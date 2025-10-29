import { type NextRequest, NextResponse } from "next/server"
import { db, generateId } from "@/lib/db"

export async function GET() {
  try {
    const folders = await db.folders.findAll()
    return NextResponse.json({ folders })
  } catch (error) {
    console.error("[v0] Error fetching folders:", error)
    return NextResponse.json({ error: "Failed to fetch folders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Folder name is required" }, { status: 400 })
    }

    const folder = await db.folders.create({
      id: generateId(),
      name,
    })

    return NextResponse.json({ success: true, folder })
  } catch (error) {
    console.error("[v0] Error creating folder:", error)
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 })
  }
}
