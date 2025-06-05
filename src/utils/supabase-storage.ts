
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

// This function creates the avatars bucket if it doesn't exist
// You might want to run this on app initialization
export const ensureAvatarBucketExists = async () => {
  try {
    // Check if bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const avatarBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
    
    if (!avatarBucketExists) {
      // Bucket doesn't exist, try to create it
      const { error } = await supabase.storage.createBucket('avatars', {
        public: true,
        fileSizeLimit: 1024 * 1024 * 2, // 2MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (error) {
        console.error("Error creating avatars bucket:", error);
        return false;
      }
      return true;
    }
    return true;
  } catch (error) {
    console.error("Error checking/creating avatars bucket:", error);
    return false;
  }
};

// Upload user avatar
export const uploadAvatar = async (
  userId: string, 
  file: File
): Promise<string | null> => {
  try {
    await ensureAvatarBucketExists();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    
    // Upload file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file);
      
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
      
    return data.publicUrl;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    toast.error("Failed to upload avatar");
    return null;
  }
};

// Delete user avatar (call this when replacing avatar)
export const deleteAvatar = async (url: string): Promise<boolean> => {
  try {
    // Extract file path from URL
    const urlParts = url.split('/');
    const filePath = urlParts[urlParts.length - 1];
    
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error deleting avatar:", error);
    return false;
  }
};
