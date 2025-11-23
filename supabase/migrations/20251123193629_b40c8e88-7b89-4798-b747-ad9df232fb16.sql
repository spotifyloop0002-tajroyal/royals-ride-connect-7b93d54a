-- Add payment_link column to rides table
ALTER TABLE public.rides 
ADD COLUMN payment_link text;