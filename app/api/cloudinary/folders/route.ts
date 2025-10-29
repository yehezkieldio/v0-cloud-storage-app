import { type NextRequest, NextResponse } from "next/server"
import { getFolders, createFolder as createFolderStorage } from "@/lib/storage"

export async function GET() {
  try {
    const folders = getFolders()
    return NextResponse.json({ folders })
  } catch (error) {
    console.error("List folders error:", error)
    return NextResponse.json({ error: "Failed to list folders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    const folder = createFolderStorage(name)

    return NextResponse.json({
      success: true,
      folder,
    })
  } catch (error) {
    console.error("Create folder error:", error)
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 })
  }
}
