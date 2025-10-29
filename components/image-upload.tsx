"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import { UploadCloudIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  folderId: string | null
  folderName: string | null
  onUploadComplete: () => void
}

interface UploadingFile {
  file: File
  progress: number
  preview: string
}

export function ImageUpload({ folderId, folderName, onUploadComplete }: ImageUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File) => {
    const formData = new FormData()
    formData.append("file", file)
    if (folderId) {
      formData.append("folderId", folderId)
    }
    if (folderName) {
      formData.append("folderName", folderName)
    }

    console.log("[v0] Uploading file:", file.name, "to folder:", folderName)

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

          setUploadingFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: 10 } : f)))

          await uploadFile(fileData.file)

          setUploadingFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: 100 } : f)))
        }

        toast.success(`Successfully uploaded ${acceptedFiles.length} image${acceptedFiles.length > 1 ? "s" : ""}`)
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
    [folderId, folderName, onUploadComplete],
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
    </div>
  )
}
