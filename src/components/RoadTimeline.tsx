import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import roadImage from "@/assets/road-timeline.png";

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

  useEffect(() => {
    if (!timelineRef.current) return;

    const milestoneCards = timelineRef.current.querySelectorAll(".milestone-card");
    const dots = timelineRef.current.querySelectorAll(".timeline-dot");

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
      {/* Section Title */}
      <div className="container mx-auto px-4 mb-16 max-w-7xl">
        <h2 className="text-5xl md:text-7xl font-black text-left mb-4" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
          <span className="text-gradient">OUR JOURNEY</span>
        </h2>
        <p className="text-left text-muted-foreground text-lg">Two decades of adventure on two wheels</p>
      </div>

      {/* Road Background - Fixed in center */}
      <div 
        className="absolute left-1/2 top-0 -translate-x-1/2 w-[200px] h-full pointer-events-none opacity-40"
        style={{
          backgroundImage: `url(${roadImage})`,
          backgroundSize: 'contain',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'center',
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
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-primary/30 rounded-lg p-8 hover:border-primary hover:shadow-[0_0_40px_rgba(255,0,0,0.3)] transition-all duration-300 group">
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
                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-primary/30 rounded-lg p-8 hover:border-primary hover:shadow-[0_0_40px_rgba(255,0,0,0.3)] transition-all duration-300 group">
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
                <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-[0_0_40px_rgba(255,0,0,0.3)] transition-all duration-300">
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
