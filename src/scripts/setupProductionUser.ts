import { supabase } from '@/lib/supabase';

/**
 * Production User Setup Script
 * This script creates a proper production user account with Supabase Auth
 * Run this once to migrate from the old demo system to production
 */

export async function setupProductionUser() {
  try {
    console.log('🚀 Setting up production user account...');
    
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'marketing@shiva-engineering.com',
      password: 'SecurePass123!', // Strong production password
      options: {
        data: {
          name: 'Admin User',
          department: 'Marketing',
          role: 'Head of SES',
          location: 'CHENGALPATTU'
        }
      }
    });

    if (authError) {
      console.error('❌ Auth user creation failed:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      console.error('❌ No user returned from auth creation');
      return { success: false, error: 'Failed to create auth user' };
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Update team member profile to link with auth user
    const { error: updateError } = await supabase
      .from('team_members')
      .update({
        id: authData.user.id, // Link to auth user ID
        status: 'active',
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'marketing@shiva-engineering.com');

    if (updateError) {
      console.error('❌ Team member update failed:', updateError);
      // Clean up auth user if profile update fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Team member profile updated');

    // Step 3: Send verification email
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: 'marketing@shiva-engineering.com'
    });

    if (resendError) {
      console.warn('⚠️ Verification email resend failed:', resendError);
    } else {
      console.log('✅ Verification email sent');
    }

    console.log('🎉 Production user setup completed successfully!');
    console.log('📧 Check your email to verify the account');
    console.log('🔑 Use the password: SecurePass123!');
    
    return { 
      success: true, 
      message: 'Production user setup completed. Check email for verification.',
      userId: authData.user.id
    };

  } catch (error) {
    console.error('❌ Production user setup failed:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Export for use in development
export default setupProductionUser;
