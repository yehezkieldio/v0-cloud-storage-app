import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { folderId: string } }) {
  try {
    const images = await db.images.findByFolderId(params.folderId)

    return NextResponse.json({
      images: images.map((img) => ({
        id: img.id,
        name: img.name,
        url: img.file_path,
        thumbnailUrl: img.thumbnail_path,
        folderId: img.folder_id,
        size: img.file_size,
        width: img.width,
        height: img.height,
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching images:", error)
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 })
  }
}
