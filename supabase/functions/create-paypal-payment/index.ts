
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PayPalAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface PayPalPaymentRequest {
  coins: number;
  bonus: number;
  price: number;
  packageId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get authenticated user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    // Parse request body
    const body: PayPalPaymentRequest = await req.json();
    const { coins, bonus, price, packageId } = body;
    const totalCoins = coins + (bonus || 0);

    console.log(`Creating PayPal payment for user ${user.id}: ${totalCoins} coins for $${price}`);

    // Get PayPal credentials
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const paypalBaseUrl = Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";

    if (!paypalClientId || !paypalClientSecret) {
      console.error("PayPal credentials missing:", { 
        hasClientId: !!paypalClientId, 
        hasClientSecret: !!paypalClientSecret 
      });
      throw new Error("PayPal credentials not configured");
    }

    console.log("PayPal config:", { 
      baseUrl: paypalBaseUrl, 
      clientId: paypalClientId?.substring(0, 10) + "..." 
    });

    // Get PayPal access token
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${paypalClientId}:${paypalClientSecret}`)}`,
        "Accept": "application/json",
      },
      body: "grant_type=client_credentials",
    });

    console.log("Token response status:", tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("PayPal token error:", errorText);
      throw new Error(`Failed to get PayPal access token: ${errorText}`);
    }

    const tokenData: PayPalAccessTokenResponse = await tokenResponse.json();
    console.log("Successfully got PayPal access token");

    // Create PayPal payment
    const paymentData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: price.toFixed(2),
          },
          description: `${totalCoins} coins (${coins} + ${bonus || 0} bonus)`,
          custom_id: `${user.id}_${packageId}_${Date.now()}`,
        },
      ],
      application_context: {
        return_url: `${req.headers.get("origin")}/payment-success`,
        cancel_url: `${req.headers.get("origin")}/store`,
        brand_name: "TaleiaTLS Novel Reader",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    };

    console.log("Creating PayPal order with data:", JSON.stringify(paymentData, null, 2));

    const paymentResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    console.log("Payment response status:", paymentResponse.status);

    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error("PayPal payment creation failed:", errorText);
      throw new Error(`Failed to create PayPal payment: ${errorText}`);
    }

    const paymentResult = await paymentResponse.json();
    console.log("PayPal payment created successfully:", paymentResult.id);

    // Find the approval URL
    const approvalUrl = paymentResult.links?.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      console.error("No approval URL in PayPal response:", paymentResult);
      throw new Error("No approval URL returned from PayPal");
    }

    // Store payment info in database using service role key
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { error: insertError } = await supabaseService.from("paypal_payments").insert({
      user_id: user.id,
      paypal_order_id: paymentResult.id,
      coins: totalCoins,
      amount_usd: price,
      package_id: packageId,
      status: "pending",
    });

    if (insertError) {
      console.error("Error storing payment record:", insertError);
      throw new Error(`Failed to store payment record: ${insertError.message}`);
    }

    console.log("Payment record stored successfully");

    return new Response(
      JSON.stringify({ 
        approvalUrl,
        orderId: paymentResult.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error creating PayPal payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
