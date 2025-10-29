import type { Image } from "./types"

interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  bytes: number
  format: string
  original_filename?: string
}

async function generateSignature(paramsToSign: Record<string, string>): Promise<string> {
  const apiSecret = process.env.CLOUDINARY_API_SECRET!

  // Sort parameters alphabetically
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join("&")

  const stringToSign = `${sortedParams}${apiSecret}`

  // Use Web Crypto API to generate SHA-1 hash
  const encoder = new TextEncoder()
  const data = encoder.encode(stringToSign)
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

  return hashHex
}

export async function uploadToCloudinary(buffer: Buffer, folderName: string | null, fileName?: string): Promise<Image> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY

  if (!cloudName || !apiKey) {
    throw new Error("Cloudinary credentials not configured")
  }

  // Convert buffer to blob
  const blob = new Blob([buffer])

  // Prepare upload parameters
  const timestamp = Math.round(Date.now() / 1000).toString()
  const paramsToSign: Record<string, string> = {
    timestamp,
  }

  let publicIdName = fileName
  if (fileName) {
    // Remove file extension from the name for public_id
    publicIdName = fileName.replace(/\.[^/.]+$/, "")
  }

  if (publicIdName) {
    // When we have a custom filename, use public_id with full path
    paramsToSign.public_id = `purindo/${folderName}/${publicIdName}`
  } else if (folderName) {
    // When no custom filename, use folder parameter and let Cloudinary generate the name
    paramsToSign.folder = `purindo/${folderName}`
  }

  // Generate signature
  const signature = await generateSignature(paramsToSign)

  // Create form data
  const formData = new FormData()
  formData.append("file", blob)
  formData.append("api_key", apiKey)
  formData.append("timestamp", timestamp)
  formData.append("signature", signature)

  if (publicIdName) {
    formData.append("public_id", `purindo/${folderName}/${publicIdName}`)
  } else if (folderName) {
    formData.append("folder", `purindo/${folderName}`)
  }

  // Upload to Cloudinary
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Upload failed: ${error}`)
  }

  const result: CloudinaryUploadResponse = await response.json()

  const imageName = fileName || result.original_filename || "Untitled"
  // Remove file extension from the name for cleaner display
  const nameWithoutExtension = imageName.replace(/\.[^/.]+$/, "")

  const image: Image = {
    id: crypto.randomUUID(),
    url: result.secure_url,
    thumbnailUrl: getThumbnailUrl(result.public_id),
    publicId: result.public_id,
    folderId: "", // Will be set by caller
    name: nameWithoutExtension,
    size: result.bytes,
    width: result.width,
    height: result.height,
    createdAt: new Date().toISOString(),
  }

  return image
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY

  if (!cloudName || !apiKey) {
    throw new Error("Cloudinary credentials not configured")
  }

  const timestamp = Math.round(Date.now() / 1000).toString()
  const paramsToSign = {
    public_id: publicId,
    timestamp,
  }

  const signature = await generateSignature(paramsToSign)

  const formData = new FormData()
  formData.append("public_id", publicId)
  formData.append("api_key", apiKey)
  formData.append("timestamp", timestamp)
  formData.append("signature", signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Delete failed: ${error}`)
  }
}

export async function renameImageOnCloudinary(
  oldPublicId: string,
  newPublicId: string,
): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY

  if (!cloudName || !apiKey) {
    throw new Error("Cloudinary credentials not configured")
  }

  const timestamp = Math.round(Date.now() / 1000).toString()
  const paramsToSign = {
    from_public_id: oldPublicId,
    to_public_id: newPublicId,
    timestamp,
  }

  const signature = await generateSignature(paramsToSign)

  const formData = new FormData()
  formData.append("from_public_id", oldPublicId)
  formData.append("to_public_id", newPublicId)
  formData.append("api_key", apiKey)
  formData.append("timestamp", timestamp)
  formData.append("signature", signature)

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/rename`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Rename failed: ${error}`)
  }

  const result = await response.json()
  return result
}

export async function deleteFolderOnCloudinary(folderPath: string): Promise<void> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured")
  }

  // Use Basic Auth for Admin API
  const auth = btoa(`${apiKey}:${apiSecret}`)

  // Delete folder using Admin API
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/folders/purindo/${folderPath}`, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.warn("[v0] Failed to delete folder on Cloudinary:", error)
    // Don't throw error as folder might not exist or already be deleted
  }
}

export function getOptimizedImageUrl(publicId: string, width?: number): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  const transformations = width ? `w_${width},c_limit,q_auto,f_auto` : "q_auto,f_auto"
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`
}

export function getThumbnailUrl(publicId: string): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/${publicId}`
}
