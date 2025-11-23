-- Create notifications table for user alerts
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ride', 'announcement', 'badge'
  reference_id UUID, -- ID of the related ride/announcement/badge
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System/Admins can create notifications
CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to notify users about new rides
CREATE OR REPLACE FUNCTION public.notify_users_new_ride()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert notification for all users about new ride
  INSERT INTO public.notifications (user_id, title, message, type, reference_id)
  SELECT 
    id,
    'New Ride: ' || NEW.title,
    'A new ride has been posted for ' || NEW.ride_date::text || '. Check it out!',
    'ride',
    NEW.id
  FROM auth.users;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new rides
CREATE TRIGGER on_new_ride_created
  AFTER INSERT ON public.rides
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_new_ride();

-- Create function to notify users about new announcements
CREATE OR REPLACE FUNCTION public.notify_users_new_announcement()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only notify if announcement is active and shown as popup
  IF NEW.is_active AND NEW.show_as_popup THEN
    INSERT INTO public.notifications (user_id, title, message, type, reference_id)
    SELECT 
      id,
      'New Announcement: ' || NEW.title,
      LEFT(NEW.description, 100) || '...',
      'announcement',
      NEW.id
    FROM auth.users;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new announcements
CREATE TRIGGER on_new_announcement_created
  AFTER INSERT ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_new_announcement();

-- Create function to notify user when they earn a badge
CREATE OR REPLACE FUNCTION public.notify_user_badge_earned()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  badge_name TEXT;
BEGIN
  -- Get badge name
  SELECT name INTO badge_name FROM public.badges WHERE id = NEW.badge_id;
  
  -- Notify user
  INSERT INTO public.notifications (user_id, title, message, type, reference_id)
  VALUES (
    NEW.user_id,
    'Badge Earned: ' || badge_name,
    'Congratulations! You earned a new badge.',
    'badge',
    NEW.badge_id
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for badge earned
CREATE TRIGGER on_user_badge_earned
  AFTER INSERT ON public.user_badges
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_user_badge_earned();