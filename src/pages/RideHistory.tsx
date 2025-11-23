import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, TrendingUp, Award } from "lucide-react";

export default function RideHistory() {
  const { user } = useAuth();

  const { data: rideHistory, isLoading } = useQuery({
    queryKey: ['ride-history', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('ride_registrations')
        .select(`
          *,
          rides (
            id,
            title,
            description,
            ride_date,
            ride_type,
            difficulty,
            distance,
            start_point,
            end_point,
            status
          )
        `)
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const completedRides = rideHistory?.filter(r => r.rides && new Date(r.rides.ride_date) < new Date()) || [];
  const upcomingRides = rideHistory?.filter(r => r.rides && new Date(r.rides.ride_date) >= new Date()) || [];
  
  const totalDistance = completedRides.reduce((sum, r) => sum + (r.rides?.distance || 0), 0);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading ride history...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Your Ride History</h1>
          <p className="text-muted-foreground mb-8">Track all your adventures</p>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{completedRides.length}</div>
                <div className="text-sm text-muted-foreground">Completed Rides</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{totalDistance.toLocaleString()} km</div>
                <div className="text-sm text-muted-foreground">Total Distance</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{upcomingRides.length}</div>
                <div className="text-sm text-muted-foreground">Upcoming Rides</div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Rides */}
          {upcomingRides.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Upcoming Rides</h2>
              <div className="space-y-4">
                {upcomingRides.map((registration: any) => (
                  <Card key={registration.id} className="border-accent">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{registration.rides.title}</h3>
                            <Badge variant="secondary">{registration.rides.ride_type}</Badge>
                            <Badge variant="outline">{registration.rides.difficulty}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{registration.rides.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(registration.rides.ride_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {registration.rides.distance} km
                            </div>
                          </div>
                        </div>
                        <Badge className="self-start md:self-center">Registered</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Completed Rides */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Rides</h2>
            {completedRides.length > 0 ? (
              <div className="space-y-4">
                {completedRides.map((registration: any) => (
                  <Card key={registration.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-xl font-semibold">{registration.rides.title}</h3>
                            <Badge variant="secondary">{registration.rides.ride_type}</Badge>
                            <Badge variant="outline">{registration.rides.difficulty}</Badge>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2">{registration.rides.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(registration.rides.ride_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {registration.rides.distance} km
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              {registration.rides.start_point} → {registration.rides.end_point}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-primary" />
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No completed rides yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Join your first ride to start building your history!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
