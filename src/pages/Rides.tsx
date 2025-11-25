import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar, MapPin, Users, Route, TrendingUp, Loader2, CreditCard, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const Rides = () => {
  const { user } = useAuth();
  const [selectedRide, setSelectedRide] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const registerForRideMutation = useMutation({
    mutationFn: async (rideId: string) => {
      if (!user) {
        toast.error('Please log in to register for rides');
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('ride_registrations')
        .insert({
          user_id: user.id,
          ride_id: rideId,
          payment_status: 'pending'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Registration initiated! Redirecting to payment...');
    },
    onError: (error: any) => {
      if (error.message !== 'User not authenticated') {
        toast.error('Registration failed: ' + error.message);
      }
    },
  });

  const handleRegisterClick = (ride: any) => {
    setSelectedRide(ride);
    setIsDialogOpen(true);
  };

  const handleConfirmRegistration = async () => {
    if (selectedRide?.payment_link) {
      await registerForRideMutation.mutateAsync(selectedRide.id);
      window.open(selectedRide.payment_link, '_blank');
      setIsDialogOpen(false);
    }
  };

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
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="lg"
                                variant="gold"
                                onClick={() => handleRegisterClick(ride)}
                                disabled={!ride.payment_link}
                              >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Register Now
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">
                                {ride.participation_fee && ride.participation_fee > 0 
                                  ? `Payment: ₹${ride.participation_fee}` 
                                  : 'Free Registration'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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

      {/* Registration Confirmation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">Confirm Ride Registration</DialogTitle>
            <DialogDescription>
              Review the ride details before proceeding to payment
            </DialogDescription>
          </DialogHeader>
          
          {selectedRide && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{selectedRide.title}</h3>
                {selectedRide.description && (
                  <p className="text-sm text-muted-foreground">{selectedRide.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Date</div>
                    <div className="font-medium text-sm">
                      {new Date(selectedRide.ride_date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Route className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Distance</div>
                    <div className="font-medium text-sm">{selectedRide.distance} km</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">Start Point</div>
                    <div className="font-medium text-sm">{selectedRide.start_point}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="text-xs text-muted-foreground">End Point</div>
                    <div className="font-medium text-sm">{selectedRide.end_point}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span className="font-semibold">Participation Fee</span>
                </div>
                <span className="text-2xl font-bold text-primary">
                  {selectedRide.participation_fee && selectedRide.participation_fee > 0 
                    ? `₹${selectedRide.participation_fee}` 
                    : 'FREE'}
                </span>
              </div>

              {!user && (
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Please log in to track your registration and receive updates.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="gold"
              onClick={handleConfirmRegistration}
              disabled={registerForRideMutation.isPending}
            >
              {registerForRideMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Proceed to Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Rides;
