import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize, Minimize, ZoomIn, ZoomOut, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import gsap from "gsap";

interface Photo {
  id: string;
  photo_url: string;
  caption: string | null;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
  albumTitle?: string;
}

const PhotoLightbox = ({ photos, initialIndex, onClose, albumTitle }: PhotoLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [pinchDistance, setPinchDistance] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const currentPhoto = photos[currentIndex];
  const totalPhotos = photos.length;

  const minSwipeDistance = 50;

  // Navigation functions
  const goToNext = () => {
    console.log('goToNext called');
    if (currentIndex < totalPhotos - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to first
    }
    setZoom(1); // Reset zoom on navigation
  };

  const goToPrevious = () => {
    console.log('goToPrevious called');
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(totalPhotos - 1); // Loop to last
    }
    setZoom(1); // Reset zoom on navigation
  };

  // Zoom functions
  const zoomIn = () => {
    console.log('zoomIn called');
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const zoomOut = () => {
    console.log('zoomOut called');
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  const resetZoom = () => {
    console.log('resetZoom called');
    setZoom(1);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    console.log('toggleFullscreen called');
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Share functionality
  const handleShare = async () => {
    console.log('handleShare called');
    try {
      // Try to use Web Share API (works on mobile, can share to Instagram)
      if (navigator.share) {
        const response = await fetch(currentPhoto.photo_url);
        const blob = await response.blob();
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          title: albumTitle || 'Photo',
          text: currentPhoto.caption || 'Check out this photo!',
          files: [file]
        });
        
        toast({
          title: "Shared successfully!",
          description: "Photo shared via native share",
        });
      } else {
        // Fallback: Copy link to clipboard
        await navigator.clipboard.writeText(currentPhoto.photo_url);
        toast({
          title: "Link copied!",
          description: "Photo URL copied to clipboard",
        });
      }
    } catch (error) {
      // If user cancels or error occurs, copy URL as fallback
      if (error instanceof Error && error.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(currentPhoto.photo_url);
          toast({
            title: "Link copied!",
            description: "Photo URL copied to clipboard",
          });
        } catch {
          toast({
            title: "Share failed",
            description: "Unable to share photo",
            variant: "destructive",
          });
        }
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
        case " ":
          e.preventDefault();
          goToNext();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, onClose]);

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchEnd(null);
      setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2) {
      // Pinch zoom start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setPinchDistance(distance);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setTouchEnd({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    } else if (e.touches.length === 2 && pinchDistance) {
      // Pinch zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scale = distance / pinchDistance;
      setZoom((prev) => Math.max(1, Math.min(prev * scale, 3)));
      setPinchDistance(distance);
    }
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = Math.abs(touchStart.y - touchEnd.y);

    // Only trigger swipe if horizontal movement is dominant
    if (Math.abs(distanceX) > minSwipeDistance && Math.abs(distanceX) > distanceY) {
      if (distanceX > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    setTouchStart(null);
    setTouchEnd(null);
    setPinchDistance(null);
  };

  // Animate image transitions
  useEffect(() => {
    if (imageRef.current) {
      setImageLoading(true);
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }
      );
    }
  }, [currentIndex]);

  // Preload adjacent images
  useEffect(() => {
    const preloadImages = () => {
      // Preload next image
      if (currentIndex < totalPhotos - 1) {
        const nextImg = new Image();
        nextImg.src = photos[currentIndex + 1].photo_url;
      }
      // Preload previous image
      if (currentIndex > 0) {
        const prevImg = new Image();
        prevImg.src = photos[currentIndex - 1].photo_url;
      }
    };

    preloadImages();
  }, [currentIndex, photos, totalPhotos]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
    >
      {/* Clickable backdrop to close */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      {/* Top Controls Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4 flex items-center justify-between">
        <div className="text-white">
          <p className="text-sm text-muted-foreground">{albumTitle}</p>
          <p className="text-sm font-medium">
            {currentIndex + 1} / {totalPhotos}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              zoomOut();
            }}
            disabled={zoom <= 1}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
            }}
            className="text-white hover:bg-white/20 text-xs px-3"
          >
            {Math.round(zoom * 100)}%
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              zoomIn();
            }}
            disabled={zoom >= 3}
            className="text-white hover:bg-white/20 disabled:opacity-50"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="text-white hover:bg-white/20"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="text-white hover:bg-white/20"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Arrow - Left */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>

      {/* Main Image Container */}
      <div
        ref={imageContainerRef}
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center overflow-hidden touch-none"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <img
          ref={imageRef}
          src={currentPhoto.photo_url}
          alt={currentPhoto.caption || "Gallery photo"}
          className="max-w-full max-h-[90vh] object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
          onLoad={() => setImageLoading(false)}
        />
      </div>

      {/* Navigation Arrow - Right */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-black/50 hover:bg-black/70 text-white"
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Bottom Caption Bar */}
      {currentPhoto.caption && (
        <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-6">
          <p className="text-white text-center max-w-3xl mx-auto">{currentPhoto.caption}</p>
        </div>
      )}

      {/* Keyboard/Touch Hints */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-black/50 px-3 py-2 rounded hidden sm:block">
        <p>← → to navigate • ESC to close • Space for next</p>
      </div>
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-black/50 px-3 py-2 rounded sm:hidden">
        <p>Swipe to navigate • Pinch to zoom</p>
      </div>
    </div>
  );
};

export default PhotoLightbox;
