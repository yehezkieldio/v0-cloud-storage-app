import { type NextRequest, NextResponse } from "next/server"
import { uploadToCloudinary } from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API called")

    const formData = await request.formData()
    const file = formData.get("file") as File
    const folderId = formData.get("folderId") as string | null
    const folderName = formData.get("folderName") as string | null

    console.log("[v0] Upload params:", { fileName: file?.name, folderId, folderName })

    if (!file) {
      console.error("[v0] No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    console.log("[v0] Uploading to Cloudinary...")
    const result = await uploadToCloudinary(buffer, folderName)
    console.log("[v0] Cloudinary upload successful:", result.publicId)

    result.folderId = folderId || ""

    return NextResponse.json({
      success: true,
      image: result,
    })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 },
    )
  }
}
