import Layout from "@/components/Layout";
import HeroSlider from "@/components/HeroSlider";
import StatsCard from "@/components/StatsCard";
import ParticleBackground from "@/components/ParticleBackground";
import { MapPin, Users, Route, TrendingUp, Calendar, Award } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  
  const stats = [
    { icon: Calendar, title: "Total Rides", value: "500+" },
    { icon: Route, title: "KM Per Rider", value: "125,000" },
    { icon: TrendingUp, title: "Combined KM", value: "180,000" },
    { icon: MapPin, title: "Cities Covered", value: "300+" },
    { icon: Users, title: "Active Riders", value: "350+" },
    { icon: Award, title: "Years Strong", value: "19+" },
  ];

  useEffect(() => {
    // Animate section on scroll
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.content-block'),
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        }
      );
    }

    // Animate stats cards
    if (statsRef.current) {
      gsap.fromTo(
        statsRef.current.querySelectorAll('.stat-card'),
        { opacity: 0, y: 30, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: statsRef.current,
            start: 'top 85%',
          },
        }
      );
    }
  }, []);

  return (
    <Layout>
      <ParticleBackground />
      <div className="container mx-auto px-4 py-8">
        <HeroSlider />

        <section ref={sectionRef} className="mt-16">
          <div className="max-w-4xl mx-auto text-center mb-12 content-block">
            <h2 className="text-4xl md:text-5xl font-black mb-6 text-gradient">
              WELCOME TO THE TAJ ROYALS
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Founded on 28 July 2005, The Taj Royals is Agra's oldest and most iconic riders' club. 
              What began as a small group of passionate motorcyclists has evolved into a brotherhood 
              of over 350 riders who share an unwavering love for the open road. For nearly two decades, 
              we've ridden through mountains, deserts, and cities, covering over 180,000 combined kilometers 
              and exploring more than 300 destinations across India. Whether it's a Sunday morning cruise, 
              a challenging high-altitude expedition, or a charity ride to give back to the community, 
              The Taj Royals stands for adventure, camaraderie, and freedom on two wheels.
            </p>
          </div>

          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {stats.map((stat, index) => (
              <div
                key={stat.title}
                className="stat-card"
              >
                <StatsCard {...stat} />
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
