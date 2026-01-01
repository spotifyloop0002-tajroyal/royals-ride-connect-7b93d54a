-- Add is_suspended column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_suspended boolean DEFAULT false;

-- Create policy for admins to update any profile
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create policy for admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'super_admin'::app_role) OR has_role(auth.uid(), 'admin'::app_role));