import { type NextRequest, NextResponse } from "next/server"
import {
  renameImageOnCloudinary,
  deleteFolderOnCloudinary,
  getThumbnailUrl,
  getOptimizedImageUrl,
} from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    const { oldFolderName, newFolderName, images } = await request.json()

    console.log("[v0] Renaming folder on Cloudinary:", oldFolderName, "->", newFolderName)
    console.log("[v0] Images to rename:", images.length)

    const renamedImages = []

    // Rename each image on Cloudinary
    for (const image of images) {
      try {
        // Extract the path after purindo/
        const publicId = image.publicId
        const oldPath = `purindo/${oldFolderName}/`
        const newPath = `purindo/${newFolderName}/`

        // Check if the image is in the old folder
        if (!publicId.startsWith(oldPath)) {
          console.log("[v0] Skipping image not in folder:", publicId)
          renamedImages.push(image)
          continue
        }

        // Create new public_id with new folder name
        const fileName = publicId.substring(oldPath.length)
        const newPublicId = `${newPath}${fileName}`

        console.log("[v0] Renaming image:", publicId, "->", newPublicId)

        const result = await renameImageOnCloudinary(publicId, newPublicId)

        renamedImages.push({
          ...image,
          publicId: result.public_id,
          url: getOptimizedImageUrl(result.public_id),
          thumbnailUrl: getThumbnailUrl(result.public_id),
        })

        console.log("[v0] Image renamed successfully:", result.public_id)
      } catch (error) {
        console.error("[v0] Failed to rename image:", image.publicId, error)
        // Keep the original image if rename fails
        renamedImages.push(image)
      }
    }

    try {
      console.log("[v0] Deleting old folder on Cloudinary:", oldFolderName)
      await deleteFolderOnCloudinary(oldFolderName)
      console.log("[v0] Old folder deleted successfully")
    } catch (error) {
      console.warn("[v0] Failed to delete old folder:", error)
      // Continue even if folder deletion fails
    }

    console.log("[v0] Folder rename complete, renamed", renamedImages.length, "images")

    return NextResponse.json({ success: true, images: renamedImages })
  } catch (error) {
    console.error("[v0] Folder rename failed:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to rename folder" },
      { status: 500 },
    )
  }
}
