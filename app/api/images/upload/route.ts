import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { saveUploadedFile } from "@/lib/file-storage"
import { compressImage } from "@/lib/compression"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folderId = formData.get("folderId") as string
    const folderName = formData.get("folderName") as string
    const originalFileName = formData.get("fileName") as string

    console.log("[v0] Upload params:", { originalFileName, folderId, folderName })

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Compress the image
    console.log("[v0] Compressing image...")
    const compressionResult = await compressImage(file)
    console.log("[v0] Compression complete:", {
      originalSize: compressionResult.originalSize,
      compressedSize: compressionResult.compressedSize,
      savings: compressionResult.compressionRatio,
    })

    // Save file to storage
    console.log("[v0] Saving file to storage...")
    const uploadedFile = await saveUploadedFile(compressionResult.compressedFile, folderName || "purindo")

    // Save metadata to database
    console.log("[v0] Saving metadata to database...")
    const image = await db.images.create({
      id: uploadedFile.id,
      folder_id: folderId || "root",
      name: originalFileName.replace(/\.[^/.]+$/, ""),
      original_name: originalFileName,
      file_path: uploadedFile.filePath,
      thumbnail_path: uploadedFile.thumbnailPath,
      file_size: uploadedFile.fileSize,
      mime_type: uploadedFile.mimeType,
      width: uploadedFile.width,
      height: uploadedFile.height,
    })

    console.log("[v0] Upload successful:", image.id)

    return NextResponse.json({
      success: true,
      image: {
        id: image.id,
        name: image.name,
        url: image.file_path,
        thumbnailUrl: image.thumbnail_path,
        folderId: image.folder_id,
        size: image.file_size,
        width: image.width,
        height: image.height,
      },
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: `Upload failed: ${error}` }, { status: 500 })
  }
}
