import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { deleteFile, renameFile } from "@/lib/file-storage"

export async function PATCH(request: NextRequest, { params }: { params: { folderId: string } }) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    // Get old folder info
    const oldFolder = await db.folders.findById(params.folderId)
    if (!oldFolder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 })
    }

    // Update folder in database
    const folder = await db.folders.update(params.folderId, { name })

    // Update all images in this folder
    const images = await db.images.findByFolderId(params.folderId)
    for (const image of images) {
      const oldPath = image.file_path
      const newPath = oldPath.replace(`/uploads/${oldFolder.name}/`, `/uploads/${name}/`)

      // Rename file in storage
      await renameFile(oldPath, newPath)

      // Update database
      await db.images.update(image.id, {
        file_path: newPath,
        thumbnail_path: newPath.replace(/\/([^/]+)$/, "/thumbnails/$1"),
      })
    }

    return NextResponse.json({ success: true, folder })
  } catch (error) {
    console.error("[v0] Error renaming folder:", error)
    return NextResponse.json({ error: "Failed to rename folder" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { folderId: string } }) {
  try {
    // Get all images in folder
    const images = await db.images.findByFolderId(params.folderId)

    // Delete all image files
    for (const image of images) {
      await deleteFile(image.file_path)
    }

    // Delete folder (cascade will delete images from DB)
    await db.folders.delete(params.folderId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting folder:", error)
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 })
  }
}
