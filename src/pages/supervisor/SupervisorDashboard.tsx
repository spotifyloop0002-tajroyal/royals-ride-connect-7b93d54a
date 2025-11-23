import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Award, Image, Megaphone, CreditCard } from "lucide-react";

export default function SupervisorDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["supervisor-stats"],
    queryFn: async () => {
      const [
        { count: totalMembers },
        { count: totalRides },
        { count: totalBadges },
        { count: totalAlbums },
        { count: totalAnnouncements },
        { data: payments },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("rides").select("*", { count: "exact", head: true }),
        supabase.from("badges").select("*", { count: "exact", head: true }),
        supabase.from("gallery_albums").select("*", { count: "exact", head: true }),
        supabase.from("announcements").select("*", { count: "exact", head: true }),
        supabase.from("payments").select("amount"),
      ]);

      const totalRevenue = payments?.reduce((sum, payment) => sum + Number(payment.amount), 0) || 0;

      return {
        totalMembers: totalMembers || 0,
        totalRides: totalRides || 0,
        totalRevenue,
        totalBadges: totalBadges || 0,
        totalAlbums: totalAlbums || 0,
        totalAnnouncements: totalAnnouncements || 0,
      };
    },
  });

  const statCards = [
    { title: "Total Members", value: stats?.totalMembers || 0, icon: Users, color: "text-blue-600" },
    { title: "Total Rides", value: stats?.totalRides || 0, icon: Calendar, color: "text-green-600" },
    { title: "Total Revenue", value: `₹${stats?.totalRevenue || 0}`, icon: CreditCard, color: "text-purple-600" },
    { title: "Total Badges", value: stats?.totalBadges || 0, icon: Award, color: "text-yellow-600" },
    { title: "Gallery Albums", value: stats?.totalAlbums || 0, icon: Image, color: "text-pink-600" },
    { title: "Announcements", value: stats?.totalAnnouncements || 0, icon: Megaphone, color: "text-orange-600" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Supervisor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Taj Royals Supervisor Panel
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
