import { type NextRequest, NextResponse } from "next/server"
import { updateFolder, deleteFolder } from "@/lib/storage"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ folderId: string }> }) {
  try {
    const { folderId } = await params
    const { name } = await request.json()

    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    updateFolder(folderId, name)

    return NextResponse.json({
      success: true,
      folder: { id: folderId, name },
    })
  } catch (error) {
    console.error("Rename folder error:", error)
    return NextResponse.json({ error: "Failed to rename folder" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ folderId: string }> }) {
  try {
    const { folderId } = await params

    deleteFolder(folderId)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Delete folder error:", error)
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 })
  }
}
