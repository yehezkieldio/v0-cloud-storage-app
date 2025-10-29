// File storage utility for handling image uploads and storage
// Images are stored in the public/uploads directory

import sharp from "sharp"

export interface UploadedFile {
  id: string
  originalName: string
  fileName: string
  filePath: string
  thumbnailPath: string
  fileSize: number
  mimeType: string
  width: number
  height: number
}

// Generate a unique filename to avoid collisions
export function generateFileName(originalName: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  const ext = originalName.split(".").pop()
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, "")
  const sanitized = nameWithoutExt.replace(/[^a-z0-9]/gi, "-").toLowerCase()
  return `${sanitized}-${timestamp}-${random}.${ext}`
}

// Save uploaded file to the filesystem
export async function saveUploadedFile(file: File, folderName: string): Promise<UploadedFile> {
  const fileName = generateFileName(file.name)
  const folderPath = `uploads/${folderName}`
  const filePath = `${folderPath}/${fileName}`
  const thumbnailPath = `${folderPath}/thumbnails/${fileName}`

  // Convert file to buffer
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Get image metadata
  const metadata = await sharp(buffer).metadata()

  // In a real implementation, you would save the file to disk here
  // For browser environment, we'll store the file as a data URL
  // In production with Node.js, use fs.writeFile

  // Create thumbnail (300x300)
  const thumbnailBuffer = await sharp(buffer).resize(300, 300, { fit: "cover" }).jpeg({ quality: 80 }).toBuffer()

  // Convert to data URLs for browser storage
  const fileDataUrl = `data:${file.type};base64,${buffer.toString("base64")}`
  const thumbnailDataUrl = `data:image/jpeg;base64,${thumbnailBuffer.toString("base64")}`

  // Store in browser storage (in production, this would be actual file system)
  if (typeof window !== "undefined") {
    const fileStore = JSON.parse(localStorage.getItem("file_store") || "{}")
    fileStore[filePath] = fileDataUrl
    fileStore[thumbnailPath] = thumbnailDataUrl
    localStorage.setItem("file_store", JSON.stringify(fileStore))
  }

  return {
    id: globalThis.crypto.randomUUID(),
    originalName: file.name,
    fileName,
    filePath: `/${filePath}`,
    thumbnailPath: `/${thumbnailPath}`,
    fileSize: file.size,
    mimeType: file.type,
    width: metadata.width || 0,
    height: metadata.height || 0,
  }
}

// Delete file from filesystem
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    // In production with Node.js, use fs.unlink
    // For browser environment, remove from storage
    if (typeof window !== "undefined") {
      const fileStore = JSON.parse(localStorage.getItem("file_store") || "{}")
      const normalizedPath = filePath.startsWith("/") ? filePath.substring(1) : filePath
      delete fileStore[normalizedPath]

      // Also delete thumbnail
      const thumbnailPath = normalizedPath.replace(/\/([^/]+)$/, "/thumbnails/$1")
      delete fileStore[thumbnailPath]

      localStorage.setItem("file_store", JSON.stringify(fileStore))
    }
    return true
  } catch (error) {
    console.error("[v0] Error deleting file:", error)
    return false
  }
}

// Get file URL (for serving images)
export function getFileUrl(filePath: string): string {
  if (typeof window !== "undefined") {
    const fileStore = JSON.parse(localStorage.getItem("file_store") || "{}")
    const normalizedPath = filePath.startsWith("/") ? filePath.substring(1) : filePath
    return fileStore[normalizedPath] || filePath
  }
  return filePath
}

// Rename file (move to new location)
export async function renameFile(oldPath: string, newPath: string): Promise<boolean> {
  try {
    if (typeof window !== "undefined") {
      const fileStore = JSON.parse(localStorage.getItem("file_store") || "{}")
      const oldNormalized = oldPath.startsWith("/") ? oldPath.substring(1) : oldPath
      const newNormalized = newPath.startsWith("/") ? newPath.substring(1) : newPath

      // Move main file
      if (fileStore[oldNormalized]) {
        fileStore[newNormalized] = fileStore[oldNormalized]
        delete fileStore[oldNormalized]
      }

      // Move thumbnail
      const oldThumbPath = oldNormalized.replace(/\/([^/]+)$/, "/thumbnails/$1")
      const newThumbPath = newNormalized.replace(/\/([^/]+)$/, "/thumbnails/$1")
      if (fileStore[oldThumbPath]) {
        fileStore[newThumbPath] = fileStore[oldThumbPath]
        delete fileStore[oldThumbPath]
      }

      localStorage.setItem("file_store", JSON.stringify(fileStore))
    }
    return true
  } catch (error) {
    console.error("[v0] Error renaming file:", error)
    return false
  }
}
