
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paypalOrderId } = await req.json();

    if (!paypalOrderId) {
      throw new Error("PayPal order ID is required");
    }

    console.log(`Processing PayPal success for order: ${paypalOrderId}`);

    // Get PayPal credentials
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const paypalBaseUrl = Deno.env.get("PAYPAL_BASE_URL") || "https://api-m.sandbox.paypal.com";

    if (!paypalClientId || !paypalClientSecret) {
      throw new Error("PayPal credentials not configured");
    }

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

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("PayPal token error:", errorText);
      throw new Error("Failed to get PayPal access token");
    }

    const tokenData = await tokenResponse.json();

    // Capture the payment
    const captureResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${tokenData.access_token}`,
        "Accept": "application/json",
      },
    });

    if (!captureResponse.ok) {
      const errorText = await captureResponse.text();
      console.error("PayPal capture error:", errorText);
      throw new Error("Failed to capture PayPal payment");
    }

    const captureData = await captureResponse.json();
    console.log("PayPal capture result:", captureData);

    if (captureData.status !== "COMPLETED") {
      throw new Error(`Payment was not completed successfully. Status: ${captureData.status}`);
    }

    // Update payment record and add coins using service role
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get the payment record
    const { data: paymentRecord, error: fetchError } = await supabaseService
      .from("paypal_payments")
      .select("*")
      .eq("paypal_order_id", paypalOrderId)
      .eq("status", "pending")
      .single();

    if (fetchError || !paymentRecord) {
      console.error("Payment record not found:", fetchError);
      throw new Error("Payment record not found");
    }

    // Update payment status
    const { error: updateError } = await supabaseService
      .from("paypal_payments")
      .update({ 
        status: "completed",
        captured_at: new Date().toISOString()
      })
      .eq("paypal_order_id", paypalOrderId);

    if (updateError) {
      console.error("Error updating payment status:", updateError);
      throw new Error("Failed to update payment status");
    }

    // Add coins to user account
    const { error: coinsError } = await supabaseService.rpc('add_coins_to_user', {
      p_user_id: paymentRecord.user_id,
      p_amount: paymentRecord.coins,
      p_description: `PayPal purchase - ${paymentRecord.coins} coins for $${paymentRecord.amount_usd}`
    });

    if (coinsError) {
      console.error("Error adding coins:", coinsError);
      throw new Error("Failed to add coins to user account");
    }

    console.log(`Successfully added ${paymentRecord.coins} coins to user ${paymentRecord.user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        coins: paymentRecord.coins,
        message: "Payment completed successfully"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error handling PayPal success:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
