import { type NextRequest, NextResponse } from "next/server"
import { getImages, getImagesByFolder } from "@/lib/storage"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const folderId = searchParams.get("folderId")

    const images = folderId ? getImagesByFolder(folderId) : getImages()

    return NextResponse.json({ images })
  } catch (error) {
    console.error("List images error:", error)
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 })
  }
}
