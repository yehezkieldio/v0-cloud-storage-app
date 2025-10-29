"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { COMPRESSION_PRESETS } from "@/lib/compression"

interface CompressionSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPreset: keyof typeof COMPRESSION_PRESETS
  useProgressiveCompression: boolean
  onSettingsChange: (preset: keyof typeof COMPRESSION_PRESETS, useProgressive: boolean) => void
}

export function CompressionSettingsDialog({
  open,
  onOpenChange,
  currentPreset,
  useProgressiveCompression,
  onSettingsChange,
}: CompressionSettingsDialogProps) {
  const [preset, setPreset] = useState(currentPreset)
  const [progressive, setProgressive] = useState(useProgressiveCompression)

  const handleSave = () => {
    onSettingsChange(preset, progressive)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Compression Settings</DialogTitle>
          <DialogDescription>
            Configure how images are compressed before uploading to reduce storage costs and improve performance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="progressive">Progressive Compression</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically adjust compression based on image size and resolution
                </p>
              </div>
              <Switch id="progressive" checked={progressive} onCheckedChange={setProgressive} />
            </div>
          </div>

          {!progressive && (
            <div className="space-y-3">
              <Label>Compression Preset</Label>
              <RadioGroup
                value={preset}
                onValueChange={(value) => setPreset(value as keyof typeof COMPRESSION_PRESETS)}
              >
                {Object.entries(COMPRESSION_PRESETS).map(([key, preset]) => (
                  <div key={key} className="flex items-start space-x-3 space-y-0">
                    <RadioGroupItem value={key} id={key} className="mt-1" />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor={key} className="font-medium cursor-pointer">
                        {preset.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Max: {preset.settings.maxSizeMB}MB, {preset.settings.maxWidthOrHeight}px, Quality:{" "}
                        {preset.settings.quality * 100}%
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {progressive && (
            <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
              <p className="text-sm font-medium">Progressive Compression Rules</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Small files (&lt;1MB): Minimal compression, high quality</li>
                <li>• Medium files (1-3MB): Balanced compression</li>
                <li>• Large files (3-5MB): Web optimized compression</li>
                <li>• Very large files (&gt;5MB): Aggressive compression</li>
                <li>• High resolution images (&gt;4000px): Additional compression</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <button onClick={() => onOpenChange(false)} className="px-4 py-2 text-sm rounded-md hover:bg-muted">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Settings
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
