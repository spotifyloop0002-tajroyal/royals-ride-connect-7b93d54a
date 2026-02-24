import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Loader2, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PhotoLightbox from "@/components/PhotoLightbox";

const Gallery = () => {
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const { data: albums, isLoading: albumsLoading } = useQuery({
    queryKey: ['public-albums'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: photos, isLoading: photosLoading } = useQuery({
    queryKey: ['album-photos', selectedAlbum],
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

  const selectedAlbumData = albums?.find(a => a.id === selectedAlbum);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-center animate-fade-in text-gradient-gold font-cinzel">Gallery</h1>
          <p className="text-center text-muted-foreground mb-12 animate-fade-in">
            Relive the memories from our incredible journeys
          </p>

          {albumsLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : albums && albums.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {albums.map((album, index) => (
                <Card
                  key={album.id}
                  className="hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in hover-lift"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => setSelectedAlbum(album.id)}
                >
                  <CardHeader>
                    {album.cover_photo_url ? (
                      <img
                        src={album.cover_photo_url}
                        alt={album.title}
                        loading="lazy"
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    ) : (
                      <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                        <ImageIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <CardTitle className="text-center">{album.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Camera size={16} />
                        {album.category}
                      </span>
                    </div>
                    {album.description && (
                      <p className="text-sm text-muted-foreground mt-2">{album.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Albums Yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for photos from our rides and events!
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="mt-12 bg-muted/50">
            <CardContent className="p-8 text-center">
              <Camera className="w-12 h-12 mx-auto mb-4 text-primary" />
              <h3 className="text-xl font-semibold mb-2">More Albums Coming Soon</h3>
              <p className="text-muted-foreground">
                We're constantly updating our gallery with photos from recent rides and events.
                Check back regularly for new albums!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedAlbum} onOpenChange={() => setSelectedAlbum(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{selectedAlbumData?.title}</DialogTitle>
                {selectedAlbumData?.description && (
                  <p className="text-muted-foreground mt-1">{selectedAlbumData.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAlbum(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {photosLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : photos && photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {photos.map((photo, index) => (
                <div 
                  key={photo.id} 
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedPhotoIndex(index)}
                >
                  <img
                    src={photo.photo_url}
                    alt={photo.caption || "Gallery photo"}
                    className="w-full h-48 object-cover rounded-lg transition-transform hover:scale-105"
                    loading="lazy"
                  />
                  {photo.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No photos in this album yet</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Lightbox */}
      {selectedPhotoIndex !== null && photos && (
        <PhotoLightbox
          photos={photos}
          initialIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          albumTitle={selectedAlbumData?.title}
        />
      )}
    </Layout>
  );
};

export default Gallery;
