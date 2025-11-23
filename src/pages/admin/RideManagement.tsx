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
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRide, setEditingRide] = useState<any>(null);
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
    payment_link: "",
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
        payment_link: "",
      });
      setIsCreateDialogOpen(false);
      toast.success('Ride created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create ride: ' + error.message);
    },
  });

  const updateRideMutation = useMutation({
    mutationFn: async (updatedRide: any) => {
      const { error } = await supabase
        .from('rides')
        .update(updatedRide)
        .eq('id', editingRide.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides-admin'] });
      setEditingRide(null);
      setIsEditDialogOpen(false);
      toast.success('Ride updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update ride: ' + error.message);
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

  const handleEditClick = (ride: any) => {
    setEditingRide({
      id: ride.id,
      title: ride.title,
      description: ride.description || "",
      ride_date: ride.ride_date,
      ride_type: ride.ride_type,
      difficulty: ride.difficulty,
      start_point: ride.start_point,
      end_point: ride.end_point,
      distance: ride.distance,
      participation_fee: ride.participation_fee || 0,
      registration_limit: ride.registration_limit,
      route_map_link: ride.route_map_link || "",
      payment_link: ride.payment_link || "",
    });
    setIsEditDialogOpen(true);
  };

  const RideForm = ({ ride, setRide, onSubmit, submitText }: any) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Ride Title</Label>
        <Input
          id="title"
          value={ride.title}
          onChange={(e) => setRide({ ...ride, title: e.target.value })}
          placeholder="e.g., Jaipur Heritage Ride"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={ride.description || ""}
          onChange={(e) => setRide({ ...ride, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ride_date">Date</Label>
          <Input
            id="ride_date"
            type="date"
            value={ride.ride_date}
            onChange={(e) => setRide({ ...ride, ride_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="ride_type">Type</Label>
          <Select 
            value={ride.ride_type}
            onValueChange={(value) => setRide({ ...ride, ride_type: value })}
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
            value={ride.difficulty}
            onValueChange={(value) => setRide({ ...ride, difficulty: value })}
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
            value={ride.distance}
            onChange={(e) => setRide({ ...ride, distance: parseInt(e.target.value) })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="start_point">Start Point</Label>
        <Input
          id="start_point"
          value={ride.start_point}
          onChange={(e) => setRide({ ...ride, start_point: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="end_point">End Point</Label>
        <Input
          id="end_point"
          value={ride.end_point}
          onChange={(e) => setRide({ ...ride, end_point: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="participation_fee">Fee (₹)</Label>
          <Input
            id="participation_fee"
            type="number"
            value={ride.participation_fee}
            onChange={(e) => setRide({ ...ride, participation_fee: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="registration_limit">Registration Limit</Label>
          <Input
            id="registration_limit"
            type="number"
            value={ride.registration_limit}
            onChange={(e) => setRide({ ...ride, registration_limit: parseInt(e.target.value) })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="route_map_link">Route Map Link (Optional)</Label>
        <Input
          id="route_map_link"
          value={ride.route_map_link || ""}
          onChange={(e) => setRide({ ...ride, route_map_link: e.target.value })}
          placeholder="Google Maps or other route link"
        />
      </div>
      <div>
        <Label htmlFor="payment_link">Payment Link (Optional)</Label>
        <Input
          id="payment_link"
          value={ride.payment_link || ""}
          onChange={(e) => setRide({ ...ride, payment_link: e.target.value })}
          placeholder="Payment gateway link for registration"
        />
      </div>
      <Button 
        onClick={onSubmit}
        disabled={!ride.title || !ride.ride_date || !ride.start_point}
      >
        {submitText}
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ride Calendar Management</h1>
          <p className="text-muted-foreground">Create and manage rides</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            <RideForm 
              ride={newRide}
              setRide={setNewRide}
              onSubmit={() => createRideMutation.mutate()}
              submitText="Create Ride"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Ride</DialogTitle>
          </DialogHeader>
          {editingRide && (
            <RideForm 
              ride={editingRide}
              setRide={setEditingRide}
              onSubmit={() => updateRideMutation.mutate(editingRide)}
              submitText="Update Ride"
            />
          )}
        </DialogContent>
      </Dialog>

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
                  <div className="flex gap-2 items-start">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(ride)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
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
