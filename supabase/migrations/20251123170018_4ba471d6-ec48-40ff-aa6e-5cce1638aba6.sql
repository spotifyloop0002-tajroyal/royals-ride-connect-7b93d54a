-- Fix mutable search_path in database functions for security
-- Add fixed search_path to functions that are missing it

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email, mobile)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'rider_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Rider'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'mobile', '')
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- Fix check_and_award_badges function
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  badge_record RECORD;
BEGIN
  -- Check rides_count criteria
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE criteria_type = 'rides_count' 
    AND criteria_value <= NEW.total_rides_completed
  LOOP
    INSERT INTO public.user_badges (user_id, badge_id, is_manual)
    VALUES (NEW.id, badge_record.id, false)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
  
  -- Check km_count criteria
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE criteria_type = 'km_count' 
    AND criteria_value <= NEW.total_km_ridden
  LOOP
    INSERT INTO public.user_badges (user_id, badge_id, is_manual)
    VALUES (NEW.id, badge_record.id, false)
    ON CONFLICT (user_id, badge_id) DO NOTHING;
  END LOOP;
  
  RETURN NEW;
END;
$function$;