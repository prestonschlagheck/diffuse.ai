-- ============================================
-- UPDATE: User Profile Trigger for Full Name
-- Run this in your Supabase SQL Editor
-- ============================================

-- Drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function that extracts full_name from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name, subscription_tier, user_level)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        'free',
        'individual'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- DONE! 
-- New users will now have their full_name 
-- automatically saved to user_profiles
-- ============================================

