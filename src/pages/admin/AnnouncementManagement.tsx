import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function AnnouncementManagement() {
  const queryClient = useQueryClient();
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    description: "",
    is_active: true,
    show_as_popup: true,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const { data: announcements } = useQuery({
    queryKey: ['announcements-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async () => {
      let photoUrl = null;
      
      if (photoFile) {
        const fileName = `${Date.now()}-${photoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('announcements')
          .upload(fileName, photoFile);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('announcements')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('announcements')
        .insert([{
          ...newAnnouncement,
          photo_url: photoUrl,
        }]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] });
      setNewAnnouncement({
        title: "",
        description: "",
        is_active: true,
        show_as_popup: true,
      });
      setPhotoFile(null);
      toast.success('Announcement created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create announcement: ' + error.message);
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: string) => {
      const announcement = announcements?.find(a => a.id === id);
      if (announcement?.photo_url) {
        const fileName = announcement.photo_url.split('/').pop();
        await supabase.storage.from('announcements').remove([fileName!]);
      }
      
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] });
      toast.success('Announcement deleted successfully');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements-admin'] });
      toast.success('Announcement status updated');
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">News & Announcements</h1>
          <p className="text-muted-foreground">Manage club announcements and news</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAnnouncement.description}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, description: e.target.value })}
                  rows={5}
                />
              </div>
              <div>
                <Label htmlFor="photo">Photo (Optional)</Label>
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="show_as_popup">Show as Popup</Label>
                <Switch
                  id="show_as_popup"
                  checked={newAnnouncement.show_as_popup}
                  onCheckedChange={(checked) => setNewAnnouncement({ ...newAnnouncement, show_as_popup: checked })}
                />
              </div>
              <Button 
                onClick={() => createAnnouncementMutation.mutate()}
                disabled={!newAnnouncement.title || !newAnnouncement.description}
              >
                Create Announcement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Announcements ({announcements?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements?.map((announcement) => (
              <div key={announcement.id} className="p-4 border rounded-lg">
                <div className="flex gap-4">
                  {announcement.photo_url && (
                    <img
                      src={announcement.photo_url}
                      alt={announcement.title}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{announcement.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`text-xs px-2 py-1 rounded ${announcement.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {announcement.is_active ? 'Active' : 'Inactive'}
                      </span>
                      {announcement.show_as_popup && (
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          Popup Enabled
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Switch
                      checked={announcement.is_active || false}
                      onCheckedChange={() => toggleActiveMutation.mutate({ id: announcement.id, isActive: announcement.is_active || false })}
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
