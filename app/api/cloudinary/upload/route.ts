import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"
import { addImage, getFolder } from "@/lib/storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const folderId = formData.get("folderId") as string | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    let folderName: string | null = null
    if (folderId) {
      const folder = getFolder(folderId)
      if (!folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 })
      }
      folderName = folder.name
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await uploadToCloudinary(buffer, folderName)

    result.folderId = folderId || ""
    addImage(result)

    return NextResponse.json({
      success: true,
      image: result,
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
  }
}
