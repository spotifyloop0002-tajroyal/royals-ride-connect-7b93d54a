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
import { Plus, Upload, Trash2 } from "lucide-react";

export default function GalleryManagement() {
  const queryClient = useQueryClient();
  const [newAlbum, setNewAlbum] = useState({ title: "", category: "", description: "" });
  const [selectedAlbum, setSelectedAlbum] = useState<string>("");
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const { data: albums } = useQuery({
    queryKey: ['gallery-albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: photos } = useQuery({
    queryKey: ['gallery-photos', selectedAlbum],
    queryFn: async () => {
      if (!selectedAlbum) return [];
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .eq('album_id', selectedAlbum)
        .order('uploaded_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedAlbum,
  });

  const createAlbumMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('gallery_albums')
        .insert([newAlbum]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-albums'] });
      setNewAlbum({ title: "", category: "", description: "" });
      toast.success('Album created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create album: ' + error.message);
    },
  });

  const uploadPhotosMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAlbum || uploadingFiles.length === 0) return;
      
      if (uploadingFiles.length > 30) {
        throw new Error('Maximum 30 photos allowed per upload');
      }

      const uploadPromises = uploadingFiles.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('gallery')
          .upload(fileName, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('gallery')
          .getPublicUrl(fileName);

        const { error: dbError } = await supabase
          .from('gallery_photos')
          .insert([{
            album_id: selectedAlbum,
            photo_url: publicUrl,
          }]);
        
        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos'] });
      setUploadingFiles([]);
      toast.success('Photos uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload photos: ' + error.message);
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (photoId: string) => {
      const photo = photos?.find(p => p.id === photoId);
      if (!photo) return;

      // Extract filename from URL
      const fileName = photo.photo_url.split('/').pop();
      
      await supabase.storage.from('gallery').remove([fileName!]);
      
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery-photos'] });
      toast.success('Photo deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete photo: ' + error.message);
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gallery Management</h1>
          <p className="text-muted-foreground">Manage photo albums and uploads</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Album
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Album</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Album Title</Label>
                <Input
                  id="title"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum({ ...newAlbum, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newAlbum.category}
                  onChange={(e) => setNewAlbum({ ...newAlbum, category: e.target.value })}
                  placeholder="e.g., Rides, Events, Members"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newAlbum.description || ""}
                  onChange={(e) => setNewAlbum({ ...newAlbum, description: e.target.value })}
                />
              </div>
              <Button 
                onClick={() => createAlbumMutation.mutate()}
                disabled={!newAlbum.title || !newAlbum.category}
              >
                Create Album
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Photos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Album</Label>
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an album" />
              </SelectTrigger>
              <SelectContent>
                {albums?.map((album) => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedAlbum && (
            <>
              <div>
                <Label htmlFor="photos">Upload Photos (Max 30)</Label>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 30) {
                      toast.error('Maximum 30 photos allowed');
                      return;
                    }
                    setUploadingFiles(files);
                  }}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {uploadingFiles.length} files
                </p>
              </div>
              <Button 
                onClick={() => uploadPhotosMutation.mutate()}
                disabled={uploadingFiles.length === 0}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {selectedAlbum && photos && (
        <Card>
          <CardHeader>
            <CardTitle>Album Photos ({photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || "Gallery photo"}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deletePhotoMutation.mutate(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
