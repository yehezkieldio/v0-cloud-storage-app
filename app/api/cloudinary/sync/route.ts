import { NextResponse } from "next/server"
import type { Folder, Image } from "@/lib/types"
import { globalThis } from "global"

interface CloudinaryResource {
  public_id: string
  secure_url: string
  width: number
  height: number
  bytes: number
  format: string
  created_at: string
  folder?: string
}

interface CloudinaryFolder {
  name: string
  path: string
}

export async function GET() {
  try {
    console.log("[v0] Sync API called")
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    console.log("[v0] Cloudinary config:", { cloudName, hasApiKey: !!apiKey, hasApiSecret: !!apiSecret })

    if (!cloudName || !apiKey || !apiSecret) {
      console.error("[v0] Missing Cloudinary credentials")
      return NextResponse.json({ error: "Cloudinary credentials not configured" }, { status: 500 })
    }

    // Fetch all resources from the purindo folder
    const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")

    console.log("[v0] Fetching resources from Cloudinary...")
    const resourcesResponse = await fetch(
      `https://api.cloudinary.com/${cloudName}/resources/image?type=upload&prefix=purindo/&max_results=500`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      },
    )

    console.log("[v0] Cloudinary response status:", resourcesResponse.status)

    if (!resourcesResponse.ok) {
      const error = await resourcesResponse.text()
      console.error("[v0] Failed to fetch resources:", error)
      return NextResponse.json({ error: `Failed to fetch resources: ${error}` }, { status: 500 })
    }

    const resourcesData = await resourcesResponse.json()
    const resources: CloudinaryResource[] = resourcesData.resources || []

    console.log("[v0] Found", resources.length, "resources")

    // Extract unique folder names from public_ids
    const folderSet = new Set<string>()
    const folderMap = new Map<string, Folder>()

    resources.forEach((resource) => {
      // Extract folder name from public_id (format: purindo/foldername/imageid)
      const parts = resource.public_id.split("/")
      if (parts.length >= 2 && parts[0] === "purindo") {
        const folderName = parts[1]
        folderSet.add(folderName)
      }
    })

    console.log("[v0] Found", folderSet.size, "unique folders")

    // Create folder objects
    const folders: Folder[] = Array.from(folderSet).map((folderName) => {
      const folder: Folder = {
        id: globalThis.crypto.randomUUID(),
        name: folderName,
        createdAt: new Date().toISOString(),
        imageCount: 0,
      }
      folderMap.set(folderName, folder)
      return folder
    })

    // Create image objects and assign to folders
    const images: Image[] = resources.map((resource) => {
      const parts = resource.public_id.split("/")
      let folderId = ""

      if (parts.length >= 2 && parts[0] === "purindo") {
        const folderName = parts[1]
        const folder = folderMap.get(folderName)
        if (folder) {
          folderId = folder.id
          folder.imageCount++
        }
      }

      const image: Image = {
        id: globalThis.crypto.randomUUID(),
        url: resource.secure_url,
        thumbnailUrl: getThumbnailUrl(cloudName, resource.public_id),
        publicId: resource.public_id,
        folderId,
        name: parts[parts.length - 1] || "Untitled",
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        createdAt: resource.created_at,
      }

      return image
    })

    console.log("[v0] Sync complete:", folders.length, "folders,", images.length, "images")

    return NextResponse.json({ folders, images })
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json(
      { error: `Failed to sync: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 },
    )
  }
}

function getThumbnailUrl(cloudName: string, publicId: string): string {
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/${publicId}`
}
