import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, Trash2, Eye, EyeOff } from "lucide-react";

export default function HeroEditor() {
  const queryClient = useQueryClient();
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");

  const { data: heroImages } = useQuery({
    queryKey: ['hero-images-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_images')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!uploadingFile) return;
      
      if (heroImages && heroImages.length >= 5) {
        throw new Error('Maximum 5 hero images allowed');
      }

      const fileName = `${Date.now()}-${uploadingFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('hero-images')
        .upload(fileName, uploadingFile);
      
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('hero-images')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('hero_images')
        .insert([{
          image_url: publicUrl,
          alt_text: altText,
          sort_order: (heroImages?.length || 0) + 1,
        }]);
      
      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images-admin'] });
      setUploadingFile(null);
      setAltText("");
      toast.success('Hero image uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload: ' + error.message);
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('hero_images')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images-admin'] });
      toast.success('Image status updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const image = heroImages?.find(i => i.id === id);
      if (!image) return;

      const fileName = image.image_url.split('/').pop();
      await supabase.storage.from('hero-images').remove([fileName!]);
      
      const { error } = await supabase
        .from('hero_images')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-images-admin'] });
      toast.success('Hero image deleted successfully');
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Hero Section Editor</h1>
        <p className="text-muted-foreground">Manage homepage hero slider images (Max 5)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload New Hero Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="hero-image">Select Image (JPG/PNG)</Label>
            <Input
              id="hero-image"
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              onChange={(e) => setUploadingFile(e.target.files?.[0] || null)}
            />
          </div>
          <div>
            <Label htmlFor="alt-text">Alt Text (Optional)</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image"
            />
          </div>
          <Button 
            onClick={() => uploadMutation.mutate()}
            disabled={!uploadingFile || (heroImages?.length || 0) >= 5}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Hero Image
          </Button>
          {(heroImages?.length || 0) >= 5 && (
            <p className="text-sm text-destructive">Maximum 5 images reached. Delete one to upload more.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Hero Images ({heroImages?.length || 0}/5)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {heroImages?.map((image, index) => (
              <div key={image.id} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="text-lg font-semibold w-8">#{index + 1}</div>
                <img
                  src={image.image_url}
                  alt={image.alt_text || "Hero image"}
                  className="w-32 h-20 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="font-medium">
                    {image.alt_text || "No alt text"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {image.is_active ? "Active" : "Inactive"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleActiveMutation.mutate({ id: image.id, isActive: image.is_active || false })}
                  >
                    {image.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteMutation.mutate(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
