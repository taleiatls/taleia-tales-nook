
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useAdminCheck = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsSuperAdmin(false);
        setIsLoading(false);
        return;
      }

      try {
        // Check if user is super admin
        const { data: superAdminData } = await supabase
          .rpc('is_super_admin', { check_user_id: user.id });

        // Check user role
        const { data: roleData } = await supabase
          .rpc('get_user_admin_role', { check_user_id: user.id });

        setIsSuperAdmin(!!superAdminData);
        setIsAdmin(!!roleData && ['admin', 'moderator', 'super_admin'].includes(roleData));
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsSuperAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  return {
    isAdmin,
    isSuperAdmin,
    isLoading,
    hasAdminAccess: isAdmin || isSuperAdmin
  };
};
