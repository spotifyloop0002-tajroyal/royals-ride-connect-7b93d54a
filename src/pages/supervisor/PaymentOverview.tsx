import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";

export default function PaymentOverview() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["supervisor-payments"],
    queryFn: async () => {
      // First get payments
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });

      if (paymentsError) throw paymentsError;

      // Then get user details for each payment
      const paymentsWithDetails = await Promise.all(
        (paymentsData || []).map(async (payment) => {
          const [profileData, rideData] = await Promise.all([
            supabase.from("profiles").select("full_name, email").eq("id", payment.user_id).single(),
            payment.ride_id ? supabase.from("rides").select("title").eq("id", payment.ride_id).single() : Promise.resolve(null),
          ]);

          return {
            ...payment,
            profiles: profileData.data,
            rides: rideData?.data,
          };
        })
      );

      return paymentsWithDetails;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;
  const successfulPayments = payments?.filter((p) => p.status === "completed").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Payment Overview</h1>
        <p className="text-muted-foreground">
          View all membership and ride participation payments
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successfulPayments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Ride</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments?.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(new Date(payment.created_at!), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{payment.profiles?.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.profiles?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{payment.payment_type}</TableCell>
                    <TableCell>{payment.rides?.title || "N/A"}</TableCell>
                    <TableCell>₹{payment.amount}</TableCell>
                    <TableCell className="uppercase">{payment.payment_gateway}</TableCell>
                    <TableCell>{getStatusBadge(payment.status || "pending")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
