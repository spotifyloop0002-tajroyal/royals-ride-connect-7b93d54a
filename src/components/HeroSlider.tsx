import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";

// Fallback slides if no images in database
const fallbackSlides = [
  { id: "1", image_url: hero1, alt_text: "Riders on highway", is_active: true, sort_order: 1 },
  { id: "2", image_url: hero2, alt_text: "Mountain adventure", is_active: true, sort_order: 2 },
  { id: "3", image_url: hero3, alt_text: "Group at Taj Mahal", is_active: true, sort_order: 3 },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: heroImages, isLoading } = useQuery({
    queryKey: ['hero-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  // Use database images or fallback to static images
  const slides = (heroImages && heroImages.length > 0) 
    ? heroImages.map(img => ({
        id: img.id,
        image_url: img.image_url,
        alt_text: img.alt_text || "Hero slide",
        isDatabase: true
      }))
    : fallbackSlides.map(img => ({
        ...img,
        isDatabase: false
      }));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  if (isLoading) {
    return (
      <div className="relative h-[600px] overflow-hidden rounded-lg flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-[600px] overflow-hidden rounded-lg">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={'isDatabase' in slide && slide.isDatabase ? slide.image_url : (slide.image_url as string)}
            alt={slide.alt_text}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div className="max-w-4xl animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-primary-foreground drop-shadow-lg">
            Ride Together. Live Free.
          </h1>
          <p className="text-xl md:text-2xl text-accent mb-8 drop-shadow-lg">
            Since 2005 – Agra's First Riders Club
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg" asChild>
              <a href="/membership">Join Membership</a>
            </Button>
            <Button size="lg" variant="secondary" className="text-lg" asChild>
              <a href="/rides">Upcoming Rides</a>
            </Button>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-primary-foreground"
            onClick={prevSlide}
          >
            <ChevronLeft size={32} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/20 hover:bg-background/40 text-primary-foreground"
            onClick={nextSlide}
          >
            <ChevronRight size={32} />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? "bg-accent w-8" : "bg-background/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSlider;
