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
import { Plus, Award, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function BadgeManagement() {
  const queryClient = useQueryClient();
  const [newBadge, setNewBadge] = useState({
    name: "",
    description: "",
    criteria_type: "rides_count",
    criteria_value: 0,
    icon_url: "",
  });
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedBadge, setSelectedBadge] = useState("");

  const { data: badges } = useQuery({
    queryKey: ['badges-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['users-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name')
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const createBadgeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('badges')
        .insert([newBadge]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges-admin'] });
      setNewBadge({
        name: "",
        description: "",
        criteria_type: "rides_count",
        criteria_value: 0,
        icon_url: "",
      });
      toast.success('Badge created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create badge: ' + error.message);
    },
  });

  const awardBadgeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedUser || !selectedBadge) return;
      
      const { error } = await supabase
        .from('user_badges')
        .insert([{
          user_id: selectedUser,
          badge_id: selectedBadge,
          is_manual: true,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      setSelectedUser("");
      setSelectedBadge("");
      toast.success('Badge awarded successfully');
    },
    onError: (error) => {
      toast.error('Failed to award badge: ' + error.message);
    },
  });

  const deleteBadgeMutation = useMutation({
    mutationFn: async (badgeId: string) => {
      // First delete all user_badges references
      const { error: userBadgesError } = await supabase
        .from('user_badges')
        .delete()
        .eq('badge_id', badgeId);
      
      if (userBadgesError) throw userBadgesError;

      // Then delete the badge itself
      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', badgeId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges-admin'] });
      toast.success('Badge deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete badge: ' + error.message);
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Badge Management</h1>
          <p className="text-muted-foreground">Create badges and award them to members</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Badge Name</Label>
                <Input
                  id="name"
                  value={newBadge.name}
                  onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                  placeholder="e.g., Mountain Master"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newBadge.description}
                  onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
                  placeholder="e.g., Complete 10 mountain rides"
                />
              </div>
              <div>
                <Label htmlFor="criteria_type">Criteria Type</Label>
                <Select 
                  value={newBadge.criteria_type}
                  onValueChange={(value) => setNewBadge({ ...newBadge, criteria_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rides_count">Ride Count</SelectItem>
                    <SelectItem value="km_count">Kilometers</SelectItem>
                    <SelectItem value="manual">Manual Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="criteria_value">Criteria Value</Label>
                <Input
                  id="criteria_value"
                  type="number"
                  value={newBadge.criteria_value}
                  onChange={(e) => setNewBadge({ ...newBadge, criteria_value: parseInt(e.target.value) })}
                  disabled={newBadge.criteria_type === 'manual'}
                />
              </div>
              <div>
                <Label htmlFor="icon_url">Icon Emoji</Label>
                <Input
                  id="icon_url"
                  value={newBadge.icon_url}
                  onChange={(e) => setNewBadge({ ...newBadge, icon_url: e.target.value })}
                  placeholder="e.g., 🏔️"
                />
              </div>
              <Button 
                onClick={() => createBadgeMutation.mutate()}
                disabled={!newBadge.name || !newBadge.description}
              >
                Create Badge
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Award Badge Manually</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select User</Label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a member" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.full_name} (@{user.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Select Badge</Label>
            <Select value={selectedBadge} onValueChange={setSelectedBadge}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a badge" />
              </SelectTrigger>
              <SelectContent>
                {badges?.map((badge) => (
                  <SelectItem key={badge.id} value={badge.id}>
                    {badge.icon_url} {badge.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => awardBadgeMutation.mutate()}
            disabled={!selectedUser || !selectedBadge}
          >
            <Award className="mr-2 h-4 w-4" />
            Award Badge
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Badges ({badges?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {badges?.map((badge) => (
              <div key={badge.id} className="p-4 border rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{badge.icon_url}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                    {badge.criteria_type !== 'manual' && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Auto-award at: {badge.criteria_value} {badge.criteria_type === 'rides_count' ? 'rides' : 'km'}
                      </p>
                    )}
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Badge</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{badge.name}"? This will also remove this badge from all users who have earned it. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteBadgeMutation.mutate(badge.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
