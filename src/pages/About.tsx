import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Eye, Users, Heart, Shield, Trophy, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const About = () => {
  const highlights = [
    {
      icon: Users,
      title: "Brotherhood",
      description: "A tight-knit community of passionate riders who support each other on and off the road",
    },
    {
      icon: Shield,
      title: "Safety First",
      description: "Organized rides with experienced leaders, safety briefings, and proper gear requirements",
    },
    {
      icon: Heart,
      title: "Charity Rides",
      description: "Giving back to society through regular charity events and community service",
    },
    {
      icon: Trophy,
      title: "Epic Adventures",
      description: "From local Sunday rides to challenging Himalayan expeditions",
    },
  ];

  const { data: teamMembers, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-center animate-fade-in text-gradient-gold font-cinzel">About The Taj Royals</h1>

          <Card className="mb-12 animate-fade-in hover-lift">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Founded on 28 July 2005, The Taj Royals is Agra's oldest and most iconic riders' club. 
                What began as a small group of passionate motorcyclists has evolved into a brotherhood 
                of over 350 riders who share an unwavering love for the open road.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                For nearly two decades, we've ridden through mountains, deserts, and cities, covering 
                over 180,000 combined kilometers and exploring more than 300 destinations across India. 
                Whether it's a Sunday morning cruise, a challenging high-altitude expedition, or a charity 
                ride to give back to the community, The Taj Royals stands for adventure, camaraderie, and 
                freedom on two wheels.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="animate-fade-in hover-lift">
              <CardHeader>
                <Target className="w-12 h-12 text-primary mb-2" />
                <CardTitle className="text-gradient-gold">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To promote safe and responsible motorcycling while fostering a community of riders 
                  who share a passion for adventure, brotherhood, and giving back to society.
                </p>
              </CardContent>
            </Card>

            <Card className="animate-fade-in hover-lift">
              <CardHeader>
                <Eye className="w-12 h-12 text-primary mb-2" />
                <CardTitle className="text-gradient-gold">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  To be India's most respected and inspiring motorcycle club, known for our commitment 
                  to safety, community service, and unforgettable riding experiences.
                </p>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-3xl font-bold mb-6 text-center text-gradient-gold font-cinzel">Why Ride With Us?</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {highlights.map((item, index) => (
              <Card
                key={item.title}
                className="animate-fade-in hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <item.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h2 className="text-3xl font-bold mb-6 text-center text-gradient-gold font-cinzel">Core Team</h2>
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            {isLoadingTeam ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-5 w-32 mx-auto mb-2" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                  </CardContent>
                </Card>
              ))
            ) : teamMembers && teamMembers.length > 0 ? (
              teamMembers.map((member, index) => (
                <Card
                  key={member.id}
                  className="text-center animate-fade-in hover-lift"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-full aspect-[5/4] mx-auto mb-4 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      {member.photo_url ? (
                        <img
                          src={member.photo_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-12 h-12 text-primary" />
                      )}
                    </div>
                    <h3 className="font-semibold mb-1 text-gradient-gold">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-4 text-center py-8 text-muted-foreground">
                No team members to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
