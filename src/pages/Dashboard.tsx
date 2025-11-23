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
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  // Mock user data - in production, fetch from profiles table
  const userData = {
    name: user?.user_metadata?.full_name || "Rider",
    username: user?.user_metadata?.username || "rider",
    memberSince: "2020",
    photo: "👤",
    ridesCompleted: 42,
    totalKM: 8500,
    badgesEarned: 3,
    bloodGroup: "O+",
    bike: "Royal Enfield Himalayan",
  };

  const badges = [
    {
      id: 1,
      name: "Mountain Master",
      progress: 60,
      current: 6,
      total: 10,
      icon: "🏔️",
      description: "Complete 10 mountain rides",
    },
    {
      id: 2,
      name: "Highway King",
      progress: 80,
      current: 8,
      total: 10,
      icon: "🛣️",
      description: "Complete 10 long highway rides",
    },
    {
      id: 3,
      name: "Night Rider",
      progress: 40,
      current: 2,
      total: 5,
      icon: "🌙",
      description: "Complete 5 night rides",
    },
  ];

  const upcomingRide = {
    title: "Jaipur Heritage Ride",
    date: "Dec 8, 2025",
    distance: "240 km",
  };

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
                <Button>Join Ride</Button>
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-muted-foreground mb-4">@{userData.username}</p>
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
                  {isAdmin && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <Link to="/admin">
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    </Button>
                  )}
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

              {/* Badges Progress */}
              <Card className="animate-fade-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Badge Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {badges.map((badge) => (
                    <div key={badge.id}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{badge.icon}</span>
                          <div>
                            <h4 className="font-semibold">{badge.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {badge.description}
                            </p>
                          </div>
                        </div>
                        <Badge variant={badge.progress === 100 ? "default" : "secondary"}>
                          {badge.current}/{badge.total}
                        </Badge>
                      </div>
                      <Progress value={badge.progress} className="h-2" />
                      {badge.progress < 100 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {badge.total - badge.current} more to unlock!
                        </p>
                      )}
                    </div>
                  ))}
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
