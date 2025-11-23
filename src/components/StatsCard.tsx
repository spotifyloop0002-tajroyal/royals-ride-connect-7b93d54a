import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useEffect, useRef } from "react";

interface StatsCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
}

const StatsCard = ({ icon: Icon, title, value }: StatsCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <Card 
      ref={cardRef}
      className="relative overflow-hidden transition-all duration-300 border-2 border-primary/20 hover:border-primary/50 bg-gradient-to-br from-card via-card to-primary/5"
      style={{ transformStyle: 'preserve-3d' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
      <CardContent className="p-6 text-center relative z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/50">
          <Icon className="w-8 h-8 text-primary-foreground" />
        </div>
        <div className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2">
          {value}
        </div>
        <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{title}</div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
