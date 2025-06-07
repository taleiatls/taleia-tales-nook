
export const cleanupAuthState = () => {
  try {
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage if in use
    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    
    console.log('Auth state cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up auth state:', error);
  }
};

export const secureSignOut = async (supabase: any) => {
  try {
    // Clean up auth state first
    cleanupAuthState();
    
    // Attempt global sign out (fallback if it fails)
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.warn('Global sign out failed, but continuing with cleanup:', err);
    }
    
    // Force page reload for a clean state
    window.location.href = '/auth';
  } catch (error) {
    console.error('Error during secure sign out:', error);
    // Force redirect even if sign out fails
    window.location.href = '/auth';
  }
};

export const secureSignIn = async (supabase: any, email: string, password: string) => {
  try {
    // Clean up existing state
    cleanupAuthState();
    
    // Attempt global sign out first
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      // Continue even if this fails
      console.warn('Pre-signin cleanup failed, continuing:', err);
    }
    
    // Sign in with email/password
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Force page reload for clean state
      window.location.href = '/';
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Secure sign in error:', error);
    return { data: null, error };
  }
};
