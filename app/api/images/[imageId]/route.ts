import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { deleteFile } from "@/lib/file-storage"

export async function DELETE(request: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    console.log("[v0] Delete image API called:", params.imageId)

    // Get image from database
    const image = await db.images.findById(params.imageId)
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    // Delete file from storage
    console.log("[v0] Deleting file from storage...")
    await deleteFile(image.file_path)

    // Delete from database
    console.log("[v0] Deleting from database...")
    await db.images.delete(params.imageId)

    console.log("[v0] Image deleted successfully")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete error:", error)
    return NextResponse.json({ error: `Delete failed: ${error}` }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { imageId: string } }) {
  try {
    console.log("[v0] Rename image API called:", params.imageId)

    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Update in database
    const image = await db.images.update(params.imageId, { name })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    console.log("[v0] Image renamed successfully")

    return NextResponse.json({ success: true, image })
  } catch (error) {
    console.error("[v0] Rename error:", error)
    return NextResponse.json({ error: `Rename failed: ${error}` }, { status: 500 })
  }
}
