import { type NextRequest, NextResponse } from "next/server"
import { deleteFromCloudinary, deleteFolderOnCloudinary } from "@/lib/cloudinary"
import { getImagesByFolder } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const { folderId, folderName } = await request.json()

    console.log("[v0] Deleting folder from Cloudinary:", folderName)

    // Get all images in the folder from localStorage
    const images = getImagesByFolder(folderId)
    console.log("[v0] Images to delete:", images.length)

    // Delete each image from Cloudinary
    for (const image of images) {
      try {
        console.log("[v0] Deleting image from Cloudinary:", image.publicId)
        await deleteFromCloudinary(image.publicId)
        console.log("[v0] Image deleted successfully:", image.publicId)
      } catch (error) {
        console.error("[v0] Failed to delete image:", image.publicId, error)
        // Continue deleting other images even if one fails
      }
    }

    // Delete the folder from Cloudinary
    try {
      console.log("[v0] Deleting folder structure from Cloudinary:", folderName)
      await deleteFolderOnCloudinary(folderName)
      console.log("[v0] Folder deleted successfully from Cloudinary")
    } catch (error) {
      console.error("[v0] Failed to delete folder from Cloudinary:", error)
      // Don't fail the request if folder deletion fails
    }

    return NextResponse.json({ success: true, deletedImages: images.length })
  } catch (error) {
    console.error("[v0] Delete folder error:", error)
    return NextResponse.json({ error: "Failed to delete folder from Cloudinary" }, { status: 500 })
  }
}
