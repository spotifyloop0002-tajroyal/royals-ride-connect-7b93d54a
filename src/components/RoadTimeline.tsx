import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import roadImage from "@/assets/road-timeline.png";
import { useTimelineAudio } from "@/hooks/useTimelineAudio";
import { Volume2, VolumeX } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface Milestone {
  year: string;
  title: string;
  description: string;
}

const milestones: Milestone[] = [
  {
    year: "2005",
    title: "First Ladakh Trip",
    description: "2500 km that started the legacy",
  },
  {
    year: "2008",
    title: "50+ Rides Completed",
    description: "10,000 km Achieved",
  },
  {
    year: "2011",
    title: "Longest Ladakh Expedition",
    description: "3800 km in one run",
  },
  {
    year: "2015",
    title: "Leh–Kaza Master Expedition",
    description: "4000 km toughest terrains",
  },
  {
    year: "2018",
    title: "Rider Training & Safety",
    description: "50+ riders certified",
  },
  {
    year: "2021",
    title: "Pandemic Revival",
    description: "120 riders reunited",
  },
  {
    year: "2023",
    title: "Biggest Annual Ride",
    description: "200+ riders participated",
  },
  {
    year: "2025",
    title: "National Riding Festival",
    description: "Pan-India gathering launch",
  },
];

const RoadTimeline = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const { initAudio, playMilestoneSound } = useTimelineAudio();

  // Handle milestone hover
  const handleMilestoneHover = (index: number) => {
    if (soundEnabled && audioInitialized) {
      playMilestoneSound(index);
    }
  };

  // Initialize audio on first user interaction
  useEffect(() => {
    const handleFirstInteraction = async () => {
      if (!audioInitialized) {
        await initAudio();
        setAudioInitialized(true);
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('scroll', handleFirstInteraction);
      }
    };

    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('scroll', handleFirstInteraction);

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('scroll', handleFirstInteraction);
    };
  }, [audioInitialized, initAudio]);

  useEffect(() => {
    if (!timelineRef.current) return;

    const milestoneCards = timelineRef.current.querySelectorAll(".milestone-card");
    const dots = timelineRef.current.querySelectorAll(".timeline-dot");

    // Animate road background fade in
    if (roadRef.current) {
      gsap.fromTo(
        roadRef.current,
        {
          opacity: 0,
        },
        {
          opacity: 0.4,
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: milestoneCards[0],
            start: "top 80%",
            end: "top 40%",
            scrub: 1,
          },
        }
      );
    }

    milestoneCards.forEach((card, index) => {
      const isLeft = index % 2 === 0;
      
      gsap.fromTo(
        card,
        {
          opacity: 0,
          x: isLeft ? -100 : 100,
          scale: 0.9,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            end: "top 50%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // Animate corresponding dot
      gsap.fromTo(
        dots[index],
        {
          scale: 0,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: card,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-black py-24 overflow-hidden">
      {/* Gradient Fade at Top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background via-background/50 to-transparent z-20 pointer-events-none" />
      
      {/* Gradient Fade at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent z-20 pointer-events-none" />
      
      {/* Sound Toggle Button */}
      <button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="fixed bottom-8 right-8 z-50 p-4 rounded-full bg-zinc-900 border-2 border-primary/30 hover:border-primary hover:shadow-[0_0_30px_rgba(255,0,0,0.4)] transition-all duration-300 group"
        aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
      >
        {soundEnabled ? (
          <Volume2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
        ) : (
          <VolumeX className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-transform" />
        )}
      </button>
      
      {/* Section Title */}
      <div className="container mx-auto px-4 mb-16 max-w-7xl relative z-10">
        <h2 className="text-5xl md:text-7xl font-black text-left mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
          <span className="text-gradient">OUR JOURNEY</span>
        </h2>
        <p className="text-left text-muted-foreground text-lg">Two decades of adventure on two wheels</p>
      </div>

      {/* Road Background - Animated fade in, seamlessly connected */}
      <div 
        ref={roadRef}
        className="absolute left-1/2 -translate-x-1/2 w-[180px] pointer-events-none opacity-0"
        style={{
          backgroundImage: `url(${roadImage})`,
          backgroundSize: '180px auto',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'center top',
          top: '250px',
          height: 'calc(100% - 250px)',
        }}
      />

      {/* Timeline Container */}
      <div ref={timelineRef} className="relative container mx-auto px-4 max-w-7xl">
        {milestones.map((milestone, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <div
              key={index}
              className="relative mb-32 md:mb-40"
            >
              {/* Desktop Layout - Alternating sides */}
              <div className="hidden md:grid md:grid-cols-2 md:gap-16 items-center">
                {isLeft ? (
                  <>
                    {/* Left Side Card */}
                    <div className="milestone-card flex justify-end">
                      <div className="relative max-w-md">
                        <div 
                          className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-primary/30 rounded-lg p-8 hover:border-primary hover:shadow-[0_0_40px_rgba(255,0,0,0.3)] transition-all duration-300 group cursor-pointer"
                          onMouseEnter={() => handleMilestoneHover(index)}
                        >
                          <div className="text-6xl font-black mb-3 text-primary" style={{ fontFamily: 'Impact, sans-serif' }}>
                            {milestone.year}
                          </div>
                          <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'Anton, sans-serif' }}>
                            {milestone.title}
                          </h3>
                          <p className="text-muted-foreground text-lg">
                            {milestone.description}
                          </p>
                        </div>
                        {/* Connecting Line to Road */}
                        <div className="absolute top-1/2 -right-16 w-12 h-0.5 bg-gradient-to-r from-zinc-400 to-transparent" />
                      </div>
                    </div>
                    {/* Empty Right Side */}
                    <div />
                  </>
                ) : (
                  <>
                    {/* Empty Left Side */}
                    <div />
                    {/* Right Side Card */}
                    <div className="milestone-card flex justify-start">
                      <div className="relative max-w-md">
                        <div 
                          className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-primary/30 rounded-lg p-8 hover:border-primary hover:shadow-[0_0_40px_rgba(255,0,0,0.3)] transition-all duration-300 group cursor-pointer"
                          onMouseEnter={() => handleMilestoneHover(index)}
                        >
                          <div className="text-6xl font-black mb-3 text-primary" style={{ fontFamily: 'Impact, sans-serif' }}>
                            {milestone.year}
                          </div>
                          <h3 className="text-2xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors" style={{ fontFamily: 'Anton, sans-serif' }}>
                            {milestone.title}
                          </h3>
                          <p className="text-muted-foreground text-lg">
                            {milestone.description}
                          </p>
                        </div>
                        {/* Connecting Line to Road */}
                        <div className="absolute top-1/2 -left-16 w-12 h-0.5 bg-gradient-to-l from-zinc-400 to-transparent" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Layout - Centered */}
              <div className="md:hidden milestone-card">
                <div 
                  className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-[0_0_40px_rgba(255,0,0,0.3)] transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => handleMilestoneHover(index)}
                >
                  <div className="text-5xl font-black mb-2 text-primary" style={{ fontFamily: 'Impact, sans-serif' }}>
                    {milestone.year}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-foreground" style={{ fontFamily: 'Anton, sans-serif' }}>
                    {milestone.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {milestone.description}
                  </p>
                </div>
              </div>

              {/* Timeline Dot on Road */}
              <div className="timeline-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary shadow-[0_0_20px_rgba(255,0,0,0.8)] border-4 border-black z-10 animate-pulse" />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RoadTimeline;
