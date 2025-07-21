
'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Cropper, { type Area } from 'react-easy-crop';
import { getCroppedImg } from '@/lib/crop-image';
import { Loader2 } from 'lucide-react';

interface ImageCropperDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  imageSrc: string | null;
  onCropComplete: (croppedImage: string) => void;
  aspectRatio?: number;
  description?: string;
}

export function ImageCropperDialog({
  isOpen,
  onOpenChange,
  imageSrc,
  onCropComplete,
  aspectRatio = 3 / 2,
  description = "Sesuaikan gambar agar pas. Gunakan slider untuk zoom."
}: ImageCropperDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropPixelsComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setIsCropping(true);
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImage) {
        onCropComplete(croppedImage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCropping(false);
      onOpenChange(false);
    }
  };
  
  const handleClose = () => {
      if (isCropping) return;
      onOpenChange(false);
  }

  if (!isOpen || !imageSrc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Potong Gambar</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-80 w-full bg-muted">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropPixelsComplete}
          />
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Zoom</span>
          <Slider
            min={1}
            max={3}
            step={0.1}
            value={[zoom]}
            onValueChange={(value) => setZoom(value[0])}
            disabled={isCropping}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isCropping}>
            Batal
          </Button>
          <Button onClick={handleCrop} disabled={isCropping}>
            {isCropping ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan Potongan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
