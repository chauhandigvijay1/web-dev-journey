"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";

export default function AvatarCropper({ imageSrc, onCancel, onConfirm }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-4">
        <h3 className="mb-3 text-sm font-semibold text-white">Crop profile image</h3>
        <div className="relative h-[360px] w-full overflow-hidden rounded-md bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-slate-300">Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="w-full"
          />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => onConfirm(croppedAreaPixels)}
            disabled={!croppedAreaPixels}
          >
            Confirm Crop
          </Button>
        </div>
      </div>
    </div>
  );
}
