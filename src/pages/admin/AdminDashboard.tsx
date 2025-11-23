import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Award, ImageIcon, Bell, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [profilesRes, ridesRes, paymentsRes, badgesRes, albumsRes, announcementsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('rides').select('*', { count: 'exact', head: true }),
        supabase.from('payments').select('amount'),
        supabase.from('badges').select('*', { count: 'exact', head: true }),
        supabase.from('gallery_albums').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
      ]);

      const totalRevenue = paymentsRes.data?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      return {
        totalMembers: profilesRes.count || 0,
        totalRides: ridesRes.count || 0,
        totalRevenue,
        totalBadges: badgesRes.count || 0,
        totalAlbums: albumsRes.count || 0,
        totalAnnouncements: announcementsRes.count || 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total Members",
      value: stats?.totalMembers || 0,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Rides",
      value: stats?.totalRides || 0,
      icon: Calendar,
      color: "text-green-500",
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue.toLocaleString() || 0}`,
      icon: DollarSign,
      color: "text-yellow-500",
    },
    {
      title: "Badges Created",
      value: stats?.totalBadges || 0,
      icon: Award,
      color: "text-purple-500",
    },
    {
      title: "Gallery Albums",
      value: stats?.totalAlbums || 0,
      icon: ImageIcon,
      color: "text-pink-500",
    },
    {
      title: "Announcements",
      value: stats?.totalAnnouncements || 0,
      icon: Bell,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, manage The Taj Royals platform</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
