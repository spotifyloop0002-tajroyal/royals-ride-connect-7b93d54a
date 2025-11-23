import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Bell,
  LogOut,
  User,
  Camera,
  Shield,
  IdCard,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch user badges
  const { data: userBadges } = useQuery({
    queryKey: ['user-badges', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('user_badges')
        .select('*, badges(*)')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch upcoming rides
  const { data: upcomingRides } = useQuery({
    queryKey: ['upcoming-rides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .gte('ride_date', new Date().toISOString().split('T')[0])
        .eq('status', 'Open')
        .order('ride_date', { ascending: true })
        .limit(1);
      
      if (error) throw error;
      return data;
    },
  });

  if (profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const userData = {
    name: profile?.full_name || "Rider",
    username: profile?.username || "rider",
    memberId: profile?.member_id || "TRC0000",
    memberSince: profile?.member_since ? new Date(profile.member_since).getFullYear().toString() : new Date().getFullYear().toString(),
    photo: profile?.profile_photo_url || "👤",
    ridesCompleted: profile?.total_rides_completed || 0,
    totalKM: profile?.total_km_ridden || 0,
    badgesEarned: userBadges?.length || 0,
    bloodGroup: profile?.blood_group || "Not Set",
    bike: profile?.bike_model || "Not Set",
  };

  const upcomingRide = upcomingRides?.[0] ? {
    title: upcomingRides[0].title,
    date: new Date(upcomingRides[0].ride_date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    distance: `${upcomingRides[0].distance} km`,
    id: upcomingRides[0].id,
  } : null;

  const yearsInClub = new Date().getFullYear() - parseInt(userData.memberSince);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <Card className="mb-8 bg-gradient-to-r from-primary to-secondary text-primary-foreground animate-fade-in">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h1 className="text-4xl font-bold mb-2">Welcome back, Rider!</h1>
                  <p className="text-lg opacity-90">Your next adventure awaits.</p>
                </div>
                <Button size="lg" variant="secondary" asChild>
                  <Link to="/rides">Join Next Ride</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Ride Alert */}
          {upcomingRide && (
            <Card className="mb-8 border-2 border-accent animate-fade-in">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Bell className="w-8 h-8 text-accent" />
                    <div>
                      <h3 className="font-semibold text-lg">{upcomingRide.title}</h3>
                      <p className="text-muted-foreground">
                        {upcomingRide.date} • {upcomingRide.distance}
                      </p>
                    </div>
                  </div>
                  <Button asChild>
                    <Link to="/rides">View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - User Info */}
            <div className="space-y-6">
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-6xl mb-4">{userData.photo}</div>
                  <h2 className="text-2xl font-bold mb-1">{userData.name}</h2>
                  <p className="text-muted-foreground mb-2">@{userData.username}</p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <IdCard className="w-4 h-4 text-primary" />
                    <span className="font-mono text-sm font-semibold text-primary">{userData.memberId}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bike:</span>
                      <span className="font-medium">{userData.bike}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Blood Group:</span>
                      <span className="font-medium">{userData.bloodGroup}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Member Since:</span>
                      <span className="font-medium">{userData.memberSince}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Years in Club:</span>
                      <span className="font-medium">{yearsInClub} years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/profile/edit">
                      <User className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/rides">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Ride Calendar
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link to="/gallery">
                      <Camera className="w-4 h-4 mr-2" />
                      Browse Gallery
                    </Link>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-destructive"
                    onClick={handleSignOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Stats & Badges */}
            <div className="md:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="animate-fade-in">
                  <CardContent className="p-6 text-center">
                    <MapPin className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{userData.ridesCompleted}</div>
                    <div className="text-sm text-muted-foreground">Rides</div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{userData.totalKM.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total KM</div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in">
                  <CardContent className="p-6 text-center">
                    <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{userData.badgesEarned}</div>
                    <div className="text-sm text-muted-foreground">Badges</div>
                  </CardContent>
                </Card>

                <Card className="animate-fade-in">
                  <CardContent className="p-6 text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{yearsInClub}</div>
                    <div className="text-sm text-muted-foreground">Years</div>
                  </CardContent>
                </Card>
              </div>

              {/* Badges */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Your Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userBadges && userBadges.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {userBadges.map((userBadge: any) => (
                        <div key={userBadge.id} className="text-center p-4 border rounded-lg">
                          {userBadge.badges.icon_url ? (
                            <img 
                              src={userBadge.badges.icon_url} 
                              alt={userBadge.badges.name}
                              className="w-16 h-16 mx-auto mb-2"
                            />
                          ) : (
                            <Award className="w-16 h-16 mx-auto mb-2 text-primary" />
                          )}
                          <h4 className="font-semibold text-sm">{userBadge.badges.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {userBadge.badges.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Earned {new Date(userBadge.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No badges earned yet</p>
                      <p className="text-sm mt-1">Complete rides to earn badges!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
