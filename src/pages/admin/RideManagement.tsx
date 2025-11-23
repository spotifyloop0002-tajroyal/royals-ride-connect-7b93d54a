import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Edit, X } from "lucide-react";

export default function RideManagement() {
  const queryClient = useQueryClient();
  const [newRide, setNewRide] = useState({
    title: "",
    description: "",
    ride_date: "",
    ride_type: "Sunday",
    difficulty: "Easy",
    start_point: "",
    end_point: "",
    distance: 0,
    participation_fee: 0,
    registration_limit: 50,
    route_map_link: "",
  });

  const { data: rides } = useQuery({
    queryKey: ['rides-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rides')
        .select('*')
        .order('ride_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createRideMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('rides')
        .insert([{
          ...newRide,
          spots_available: newRide.registration_limit,
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides-admin'] });
      setNewRide({
        title: "",
        description: "",
        ride_date: "",
        ride_type: "Sunday",
        difficulty: "Easy",
        start_point: "",
        end_point: "",
        distance: 0,
        participation_fee: 0,
        registration_limit: 50,
        route_map_link: "",
      });
      toast.success('Ride created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create ride: ' + error.message);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('rides')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides-admin'] });
      toast.success('Ride status updated');
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ride Calendar Management</h1>
          <p className="text-muted-foreground">Create and manage rides</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Ride
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Ride</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Ride Title</Label>
                <Input
                  id="title"
                  value={newRide.title}
                  onChange={(e) => setNewRide({ ...newRide, title: e.target.value })}
                  placeholder="e.g., Jaipur Heritage Ride"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRide.description || ""}
                  onChange={(e) => setNewRide({ ...newRide, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ride_date">Date</Label>
                  <Input
                    id="ride_date"
                    type="date"
                    value={newRide.ride_date}
                    onChange={(e) => setNewRide({ ...newRide, ride_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ride_type">Type</Label>
                  <Select 
                    value={newRide.ride_type}
                    onValueChange={(value) => setNewRide({ ...newRide, ride_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                      <SelectItem value="Long Ride">Long Ride</SelectItem>
                      <SelectItem value="Charity">Charity</SelectItem>
                      <SelectItem value="Night Ride">Night Ride</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select 
                    value={newRide.difficulty}
                    onValueChange={(value) => setNewRide({ ...newRide, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Basic">Basic</SelectItem>
                      <SelectItem value="Advance">Advance</SelectItem>
                      <SelectItem value="Extreme">Extreme</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="distance">Distance (km)</Label>
                  <Input
                    id="distance"
                    type="number"
                    value={newRide.distance}
                    onChange={(e) => setNewRide({ ...newRide, distance: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="start_point">Start Point</Label>
                <Input
                  id="start_point"
                  value={newRide.start_point}
                  onChange={(e) => setNewRide({ ...newRide, start_point: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_point">End Point</Label>
                <Input
                  id="end_point"
                  value={newRide.end_point}
                  onChange={(e) => setNewRide({ ...newRide, end_point: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="participation_fee">Fee (₹)</Label>
                  <Input
                    id="participation_fee"
                    type="number"
                    value={newRide.participation_fee}
                    onChange={(e) => setNewRide({ ...newRide, participation_fee: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="registration_limit">Registration Limit</Label>
                  <Input
                    id="registration_limit"
                    type="number"
                    value={newRide.registration_limit}
                    onChange={(e) => setNewRide({ ...newRide, registration_limit: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="route_map_link">Route Map Link (Optional)</Label>
                <Input
                  id="route_map_link"
                  value={newRide.route_map_link || ""}
                  onChange={(e) => setNewRide({ ...newRide, route_map_link: e.target.value })}
                  placeholder="Google Maps or other route link"
                />
              </div>
              <Button 
                onClick={() => createRideMutation.mutate()}
                disabled={!newRide.title || !newRide.ride_date || !newRide.start_point}
              >
                Create Ride
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rides ({rides?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rides?.map((ride) => (
              <div key={ride.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{ride.title}</h3>
                    <p className="text-sm text-muted-foreground">{ride.description}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                      <div>Date: {new Date(ride.ride_date).toLocaleDateString()}</div>
                      <div>Type: {ride.ride_type}</div>
                      <div>Distance: {ride.distance} km</div>
                      <div>Difficulty: {ride.difficulty}</div>
                      <div>Fee: ₹{ride.participation_fee}</div>
                      <div>Spots: {ride.spots_available}/{ride.registration_limit}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select 
                      value={ride.status || "Open"}
                      onValueChange={(value) => updateStatusMutation.mutate({ id: ride.id, status: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Full">Full</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
