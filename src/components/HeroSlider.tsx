import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import EnergyButton from "./EnergyButton";

// Lazy load GoldParticles (canvas-heavy)
const GoldParticles = lazy(() => import("./GoldParticles"));

// Use static URLs for hero images to avoid bundling them into JS
const fallbackSlides = [
  { id: "1", image_url: "/images/hero-1.jpg", alt_text: "Riders on highway", is_active: true, sort_order: 1 },
  { id: "2", image_url: "/images/hero-2.jpg", alt_text: "Mountain adventure", is_active: true, sort_order: 2 },
  { id: "3", image_url: "/images/hero-3.jpg", alt_text: "Group at Taj Mahal", is_active: true, sort_order: 3 },
];

const HeroSlider = () => {
  const { user } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

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
    staleTime: 10 * 60 * 1000,
  });

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
    const elements = [titleRef.current, subtitleRef.current, buttonsRef.current];
    elements.forEach((el, i) => {
      if (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.8s ease ${i * 0.2}s, transform 0.8s ease ${i * 0.2}s`;
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
      }
    });
  }, []);

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
      <div className="relative h-screen w-full overflow-hidden -mt-20 flex items-center justify-center bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden -mt-20">
      {/* Gold particles - only in premium mode, lazy loaded */}
      {document.body.classList.contains("premium-dark") && (
        <Suspense fallback={null}>
          <GoldParticles />
        </Suspense>
      )}
      
      {/* Static gradient overlay - NO animate-pulse (was causing constant repaints) */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/20 z-10 pointer-events-none" />
      
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <img
            src={slide.image_url}
            alt={slide.alt_text}
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
            loading={index === 0 ? "eager" : "lazy"}
            decoding={index === 0 ? "sync" : "async"}
            fetchPriority={index === 0 ? "high" : "low"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center justify-center text-center px-4 z-20">
        <div className="max-w-4xl">
          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl font-black mb-4 drop-shadow-2xl text-gradient-gold font-cinzel"
            style={{ letterSpacing: '0.05em' }}
          >
            RIDE TOGETHER. LIVE FREE.
          </h1>
          <p 
            ref={subtitleRef}
            className="text-xl md:text-3xl text-electric font-bold mb-8 drop-shadow-lg"
          >
            Since 2005 – Agra's First Riders Club
          </p>
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to={user ? "/dashboard" : "/auth"}>
              <EnergyButton variant="primary" className="animate-gold-glow">
                {user ? "MY DASHBOARD" : "JOIN THE REVOLUTION"}
              </EnergyButton>
            </Link>
            <Link to="/rides">
              <EnergyButton variant="accent" className="animate-gold-glow">UPCOMING RIDES</EnergyButton>
            </Link>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 glass-effect hover:bg-primary/20 text-foreground z-30 transition-all hover:scale-110"
            onClick={prevSlide}
          >
            <ChevronLeft size={32} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 glass-effect hover:bg-primary/20 text-foreground z-30 transition-all hover:scale-110"
            onClick={nextSlide}
          >
            <ChevronRight size={32} />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? "bg-primary w-12 shadow-[0_0_15px_hsl(var(--primary))]" 
                    : "bg-foreground/30 w-2 hover:bg-foreground/50"
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
