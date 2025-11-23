import { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPhoto = photos[currentIndex];
  const totalPhotos = photos.length;

  // Navigation functions
  const goToNext = () => {
    if (currentIndex < totalPhotos - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to first
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(totalPhotos - 1); // Loop to last
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
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
      onClick={onClose}
    >
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
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
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
          className="max-w-full max-h-[90vh] object-contain"
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

      {/* Keyboard Hints (optional, can be shown initially) */}
      <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-black/50 px-3 py-2 rounded">
        <p>← → to navigate • ESC to close • Space for next</p>
      </div>
    </div>
  );
};

export default PhotoLightbox;
