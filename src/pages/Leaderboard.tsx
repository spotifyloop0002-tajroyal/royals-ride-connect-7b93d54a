import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, MapPin, Award } from "lucide-react";

export default function Leaderboard() {
  const { data: topRiders, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('total_km_ridden', { ascending: false, nullsFirst: false });
      
      if (profilesError) throw profilesError;
      if (!profiles) return [];

      // Fetch badge counts for all users
      const { data: badgeCounts, error: badgesError } = await supabase
        .from('user_badges')
        .select('user_id');
      
      if (badgesError) throw badgesError;

      // Count badges per user
      const badgeCountMap = (badgeCounts || []).reduce((acc, badge) => {
        acc[badge.user_id] = (acc[badge.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Combine profiles with badge counts
      return profiles.map(profile => ({
        ...profile,
        user_badges: Array(badgeCountMap[profile.id] || 0).fill({ badge_id: null })
      }));
    },
  });

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Trophy className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Trophy className="w-6 h-6 text-amber-700" />;
    return <span className="w-6 h-6 flex items-center justify-center font-semibold text-muted-foreground">#{index + 1}</span>;
  };

  // Count badges for each rider
  const ridersWithBadgeCounts = (topRiders || []).map(rider => ({
    ...rider,
    badgeCount: Array.isArray(rider.user_badges) ? rider.user_badges.length : 0,
    total_km_ridden: rider.total_km_ridden || 0,
    total_rides_completed: rider.total_rides_completed || 0
  }));

  const sortByKm = [...ridersWithBadgeCounts].sort((a, b) => (b.total_km_ridden || 0) - (a.total_km_ridden || 0));
  const sortByRides = [...ridersWithBadgeCounts].sort((a, b) => (b.total_rides_completed || 0) - (a.total_rides_completed || 0));
  const sortByBadges = [...ridersWithBadgeCounts].sort((a, b) => b.badgeCount - a.badgeCount);

  const renderLeaderboardCard = (rider: any, index: number, metric: 'km' | 'rides' | 'badges') => {
    const value = metric === 'km' 
      ? `${rider.total_km_ridden.toLocaleString()} km`
      : metric === 'rides'
      ? `${rider.total_rides_completed} rides`
      : `${rider.badgeCount} badges`;

    return (
      <Card key={rider.id} className={index < 3 ? 'border-primary' : ''}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {getRankIcon(index)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{rider.full_name}</h3>
                <Badge variant="outline" className="text-xs">
                  {rider.member_id}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">@{rider.username}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{value}</p>
              {rider.bike_model && (
                <p className="text-xs text-muted-foreground truncate max-w-[150px]">{rider.bike_model}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">Celebrate our top riders</p>
          </div>

          <Tabs defaultValue="km" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="km" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Total KM
              </TabsTrigger>
              <TabsTrigger value="rides" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Rides Completed
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Badges Earned
              </TabsTrigger>
            </TabsList>

            <TabsContent value="km" className="space-y-4">
              <Card className="mb-6 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold">Top Distance Rider</h2>
                  {sortByKm[0] && (
                    <>
                      <p className="text-xl mt-2">{sortByKm[0].full_name}</p>
                      <p className="text-3xl font-bold mt-1">{sortByKm[0].total_km_ridden.toLocaleString()} km</p>
                    </>
                  )}
                </CardContent>
              </Card>
              {sortByKm.map((rider, index) => renderLeaderboardCard(rider, index, 'km'))}
            </TabsContent>

            <TabsContent value="rides" className="space-y-4">
              <Card className="mb-6 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold">Most Active Rider</h2>
                  {sortByRides[0] && (
                    <>
                      <p className="text-xl mt-2">{sortByRides[0].full_name}</p>
                      <p className="text-3xl font-bold mt-1">{sortByRides[0].total_rides_completed} rides</p>
                    </>
                  )}
                </CardContent>
              </Card>
              {sortByRides.map((rider, index) => renderLeaderboardCard(rider, index, 'rides'))}
            </TabsContent>

            <TabsContent value="badges" className="space-y-4">
              <Card className="mb-6 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 mx-auto mb-2" />
                  <h2 className="text-2xl font-bold">Top Badge Collector</h2>
                  {sortByBadges[0] && (
                    <>
                      <p className="text-xl mt-2">{sortByBadges[0].full_name}</p>
                      <p className="text-3xl font-bold mt-1">{sortByBadges[0].badgeCount} badges</p>
                    </>
                  )}
                </CardContent>
              </Card>
              {sortByBadges.map((rider, index) => renderLeaderboardCard(rider, index, 'badges'))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
}
