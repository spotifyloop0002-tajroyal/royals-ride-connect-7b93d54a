import { useEffect, useRef, useState } from "react";
import roadImage from "@/assets/road-timeline.png";
import journeyBg from "@/assets/our-journey-bg.png";
import { useTimelineAudio } from "@/hooks/useTimelineAudio";
import { Volume2, VolumeX } from "lucide-react";

interface Milestone {
  year: string;
  title: string;
  description: string;
}

const milestones: Milestone[] = [
  { year: "2005", title: "First Ladakh Trip", description: "2500 km that started the legacy" },
  { year: "2008", title: "50+ Rides Completed", description: "10,000 km Achieved" },
  { year: "2011", title: "Longest Ladakh Expedition", description: "3800 km in one run" },
  { year: "2015", title: "Leh–Kaza Master Expedition", description: "4000 km toughest terrains" },
  { year: "2018", title: "Rider Training & Safety", description: "50+ riders certified" },
  { year: "2021", title: "Pandemic Revival", description: "120 riders reunited" },
  { year: "2023", title: "Biggest Annual Ride", description: "200+ riders participated" },
  { year: "2025", title: "National Riding Festival", description: "Pan-India gathering launch" },
];

const RoadTimeline = () => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioInitialized, setAudioInitialized] = useState(false);
  
  const { initAudio, playMilestoneSound } = useTimelineAudio();

  const handleMilestoneHover = (index: number) => {
    if (soundEnabled && audioInitialized) {
      playMilestoneSound(index);
    }
  };

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

  // IntersectionObserver for scroll animations (replaces GSAP)
  useEffect(() => {
    if (!timelineRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    timelineRef.current.querySelectorAll(".milestone-card").forEach((el) => observer.observe(el));
    timelineRef.current.querySelectorAll(".timeline-dot").forEach((el) => observer.observe(el));

    const roadEl = timelineRef.current.querySelector(".road-bg");
    if (roadEl) observer.observe(roadEl);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={timelineRef} className="relative min-h-screen bg-black py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 w-full h-[120%] -top-[10%]">
          <img
            src={journeyBg}
            alt="Journey Background"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-black/40 to-black/60" />
        </div>
      </div>

      {/* Gradient Fades */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background via-background/50 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent z-20 pointer-events-none" />
      
      {/* Sound Toggle */}
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
        <h2 className="text-5xl md:text-7xl font-black text-left mb-4 font-cinzel">
          <span className="text-gradient-gold">OUR JOURNEY</span>
        </h2>
        <p className="text-left text-muted-foreground text-lg">Two decades of adventure on two wheels</p>
      </div>

      {/* Road Background */}
      <div 
        className="road-bg fade-up absolute left-1/2 -translate-x-1/2 w-[180px] pointer-events-none"
        style={{
          backgroundImage: `url(${roadImage})`,
          backgroundSize: '180px auto',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'center top',
          top: '250px',
          height: 'calc(100% - 250px)',
          opacity: 0.4,
        }}
      />

      {/* Timeline Container */}
      <div className="relative container mx-auto px-4 max-w-7xl">
        {milestones.map((milestone, index) => {
          const isLeft = index % 2 === 0;
          
          return (
            <div key={index} className="relative mb-32 md:mb-40">
              {/* Desktop Layout */}
              <div className="hidden md:grid md:grid-cols-2 md:gap-16 items-center">
                {isLeft ? (
                  <>
                    <div className={`milestone-card milestone-left flex justify-end`} style={{ transitionDelay: `${index * 80}ms` }}>
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
                          <p className="text-muted-foreground text-lg">{milestone.description}</p>
                        </div>
                        <div className="absolute top-1/2 -right-16 w-12 h-0.5 bg-gradient-to-r from-zinc-400 to-transparent" />
                      </div>
                    </div>
                    <div />
                  </>
                ) : (
                  <>
                    <div />
                    <div className={`milestone-card milestone-right flex justify-start`} style={{ transitionDelay: `${index * 80}ms` }}>
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
                          <p className="text-muted-foreground text-lg">{milestone.description}</p>
                        </div>
                        <div className="absolute top-1/2 -left-16 w-12 h-0.5 bg-gradient-to-l from-zinc-400 to-transparent" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Layout */}
              <div className="md:hidden milestone-card fade-up" style={{ transitionDelay: `${index * 80}ms` }}>
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
                  <p className="text-muted-foreground">{milestone.description}</p>
                </div>
              </div>

              {/* Timeline Dot */}
              <div className="timeline-dot absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-primary shadow-[0_0_20px_rgba(255,0,0,0.8)] border-4 border-black z-10 opacity-0 scale-0 transition-all duration-500" />
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RoadTimeline;
