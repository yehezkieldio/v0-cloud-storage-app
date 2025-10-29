import { type NextRequest, NextResponse } from "next/server"
import { renameImageOnCloudinary } from "@/lib/cloudinary"

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

        // Update image with new URLs
        renamedImages.push({
          ...image,
          publicId: result.public_id,
          url: result.secure_url,
          thumbnailUrl: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_400,h_400,c_fill,q_auto,f_auto/${result.public_id}`,
        })

        console.log("[v0] Image renamed successfully:", result.public_id)
      } catch (error) {
        console.error("[v0] Failed to rename image:", image.publicId, error)
        // Keep the original image if rename fails
        renamedImages.push(image)
      }
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
