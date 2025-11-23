import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Route, TrendingUp, Loader2 } from "lucide-react";

const Rides = () => {
  const { data: rides, isLoading } = useQuery({
    queryKey: ['public-rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .order('ride_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-500";
      case "Basic":
        return "bg-blue-500";
      case "Advance":
        return "bg-orange-500";
      case "Extreme":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-green-500";
      case "Full":
        return "bg-yellow-500";
      case "Completed":
        return "bg-gray-500";
      case "Cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center animate-fade-in">Ride Calendar</h1>
          <p className="text-center text-muted-foreground mb-12 animate-fade-in">
            Join us on our upcoming adventures
          </p>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rides && rides.length > 0 ? (
            <div className="space-y-6">
              {rides.map((ride, index) => (
                <Card
                  key={ride.id}
                  className="hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <CardTitle className="text-2xl mb-2">{ride.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{ride.ride_type}</Badge>
                          <Badge className={getDifficultyColor(ride.difficulty)}>
                            {ride.difficulty}
                          </Badge>
                          <Badge className={getStatusColor(ride.status || "Open")}>
                            {ride.status || "Open"}
                          </Badge>
                        </div>
                      </div>
                      {ride.status === "Open" && (
                        <Button 
                          size="lg"
                          onClick={() => {
                            if (ride.payment_link) {
                              window.open(ride.payment_link, '_blank');
                            }
                          }}
                          disabled={!ride.payment_link}
                        >
                          Register Now
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {ride.description && (
                      <p className="text-muted-foreground mb-4">{ride.description}</p>
                    )}
                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Date</div>
                          <div className="font-medium">
                            {new Date(ride.ride_date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Start</div>
                          <div className="font-medium">{ride.start_point}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">End</div>
                          <div className="font-medium">{ride.end_point}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Route className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Distance</div>
                          <div className="font-medium">{ride.distance} km</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <div className="text-sm text-muted-foreground">Spots Left</div>
                          <div className="font-medium">
                            {ride.spots_available || ride.registration_limit || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                    {ride.participation_fee && ride.participation_fee > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Participation Fee: <span className="font-semibold text-foreground">₹{ride.participation_fee}</span>
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Rides Scheduled</h3>
                <p className="text-muted-foreground">
                  Check back soon for upcoming rides and adventures!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Rides;
