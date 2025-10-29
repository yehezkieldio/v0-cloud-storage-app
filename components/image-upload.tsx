"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { UploadCloudIcon, XIcon, SettingsIcon, ZapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { addImage } from "@/lib/storage"
import { compressImage, COMPRESSION_PRESETS, formatFileSize, type CompressionResult } from "@/lib/compression"
import { CompressionSettingsDialog } from "@/components/compression-settings-dialog"

interface ImageUploadProps {
  folderId: string | null
  folderName: string | null
  onUploadComplete: () => void
}

interface UploadingFile {
  file: File
  progress: number
  preview: string
  compressionResult?: CompressionResult
}

export function ImageUpload({ folderId, folderName, onUploadComplete }: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [compressionPreset, setCompressionPreset] = useState<keyof typeof COMPRESSION_PRESETS>("balanced")
  const [useProgressiveCompression, setUseProgressiveCompression] = useState(true)

  const uploadFile = async (file: File, compressionResult?: CompressionResult) => {
    const formData = new FormData()
    formData.append("file", file)

    const targetFolderId = folderId || "root"
    const targetFolderName = folderName || "purindo"

    formData.append("folderId", targetFolderId)
    formData.append("folderName", targetFolderName)
    formData.append("fileName", compressionResult?.originalFile.name || file.name)

    console.log("[v0] Uploading file:", file.name, "to folder:", targetFolderName)

    const response = await fetch("/api/cloudinary/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      console.error("[v0] Upload failed:", error)
      throw new Error(error.error || "Upload failed")
    }

    const result = await response.json()
    console.log("[v0] Upload successful:", result)

    if (result.success && result.image) {
      console.log("[v0] Saving image to localStorage:", result.image)
      addImage(result.image)
      console.log("[v0] Image saved to localStorage")
    }

    return result
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsUploading(true)

      const filesWithPreviews = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        preview: URL.createObjectURL(file),
      }))

      setUploadingFiles(filesWithPreviews)

      try {
        for (let i = 0; i < filesWithPreviews.length; i++) {
          const fileData = filesWithPreviews[i]

          setUploadingFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: 5 } : f)))

          console.log("[v0] Starting compression for:", fileData.file.name)
          const compressionResult = await compressImage(fileData.file, compressionPreset, useProgressiveCompression)

          // Update with compression result
          setUploadingFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: 10, compressionResult } : f)))

          // Upload compressed file
          await uploadFile(compressionResult.compressedFile, compressionResult)

          setUploadingFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: 100 } : f)))
        }

        // Calculate total savings
        const totalOriginal = filesWithPreviews.reduce((sum, f) => sum + (f.compressionResult?.originalSize || 0), 0)
        const totalCompressed = filesWithPreviews.reduce(
          (sum, f) => sum + (f.compressionResult?.compressedSize || 0),
          0,
        )
        const totalSaved = totalOriginal - totalCompressed
        const savedPercentage = ((totalSaved / totalOriginal) * 100).toFixed(1)

        toast.success(
          `Successfully uploaded ${acceptedFiles.length} image${acceptedFiles.length > 1 ? "s" : ""}. Saved ${formatFileSize(totalSaved)} (${savedPercentage}% compression)`,
        )
        onUploadComplete()

        setTimeout(() => {
          filesWithPreviews.forEach((f) => URL.revokeObjectURL(f.preview))
          setUploadingFiles([])
        }, 1000)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to upload images")
        filesWithPreviews.forEach((f) => URL.revokeObjectURL(f.preview))
        setUploadingFiles([])
      } finally {
        setIsUploading(false)
      }
    },
    [folderId, folderName, onUploadComplete, compressionPreset, useProgressiveCompression],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    },
    multiple: true,
    disabled: isUploading,
  })

  const removeUploadingFile = (index: number) => {
    setUploadingFiles((prev) => {
      const file = prev[index]
      URL.revokeObjectURL(file.preview)
      return prev.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ZapIcon className="size-4" />
          <span>
            Compression: {useProgressiveCompression ? "Progressive" : COMPRESSION_PRESETS[compressionPreset].name}
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} disabled={isUploading}>
          <SettingsIcon className="size-4 mr-2" />
          Settings
        </Button>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          isUploading && "pointer-events-none opacity-50",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <UploadCloudIcon className="size-12 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">{isDragActive ? "Drop images here" : "Drag & drop images here"}</p>
            <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
          </div>
          <p className="text-xs text-muted-foreground">
            {folderName ? `Uploading to: ${folderName}` : "Uploading to: purindo (root)"}
          </p>
          <p className="text-xs text-muted-foreground">Supports: PNG, JPG, GIF, WebP, SVG</p>
        </div>
      </div>

      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Uploading {uploadingFiles.length} file(s)</h3>
          <div className="space-y-2">
            {uploadingFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border rounded-lg">
                <div className="size-12 rounded overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={file.preview || "/placeholder.svg"}
                    alt={file.file.name}
                    className="size-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.file.name}</p>
                  {file.compressionResult && (
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.compressionResult.originalSize)} →{" "}
                      {formatFileSize(file.compressionResult.compressedSize)} (
                      {file.compressionResult.compressionRatio.toFixed(1)}% saved)
                    </p>
                  )}
                  <Progress value={file.progress} className="h-1 mt-1" />
                </div>
                {!isUploading && (
                  <Button size="icon-sm" variant="ghost" onClick={() => removeUploadingFile(index)}>
                    <XIcon />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <CompressionSettingsDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        currentPreset={compressionPreset}
        useProgressiveCompression={useProgressiveCompression}
        onSettingsChange={(preset, progressive) => {
          setCompressionPreset(preset)
          setUseProgressiveCompression(progressive)
          toast.success("Compression settings updated")
        }}
      />
    </div>
  )
}
