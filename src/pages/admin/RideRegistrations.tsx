import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Calendar, CreditCard } from "lucide-react";
import { format } from "date-fns";

export default function RideRegistrations() {
  const { data: registrations, isLoading } = useQuery({
    queryKey: ['ride-registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ride_registrations')
        .select(`
          *,
          rides (
            title,
            ride_date,
            participation_fee
          ),
          profiles:user_id (
            full_name,
            email,
            mobile
          )
        `)
        .order('registered_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['registration-stats'],
    queryFn: async () => {
      const { data: allRegs, error } = await supabase
        .from('ride_registrations')
        .select('payment_status');
      
      if (error) throw error;

      const total = allRegs?.length || 0;
      const pending = allRegs?.filter(r => r.payment_status === 'pending').length || 0;
      const completed = allRegs?.filter(r => r.payment_status === 'completed').length || 0;

      return { total, pending, completed };
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Ride Registrations</h1>
        <p className="text-muted-foreground">Track all ride registrations and payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.completed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations List */}
      <Card>
        <CardHeader>
          <CardTitle>All Registrations ({registrations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {registrations && registrations.length > 0 ? (
              registrations.map((registration: any) => (
                <div key={registration.id} className="p-4 border rounded-lg">
                  <div className="flex flex-wrap justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {registration.rides?.title || 'Unknown Ride'}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {registration.rides?.ride_date && 
                            format(new Date(registration.rides.ride_date), 'PPP')}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">User:</span>{' '}
                          <span className="font-medium">
                            {registration.profiles?.full_name || 'Unknown User'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Mobile:</span>{' '}
                          <span className="font-medium">
                            {registration.profiles?.mobile || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>{' '}
                          <span className="font-medium">
                            {registration.profiles?.email || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Amount:</span>{' '}
                          <span className="font-medium">
                            ₹{registration.rides?.participation_fee || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Registered:</span>{' '}
                          <span className="font-medium">
                            {registration.registered_at && 
                              format(new Date(registration.registered_at), 'PPp')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Badge className={getStatusColor(registration.payment_status || 'pending')}>
                      {registration.payment_status || 'pending'}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No registrations yet
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
