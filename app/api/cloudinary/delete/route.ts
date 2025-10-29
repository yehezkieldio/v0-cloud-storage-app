import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json()

    if (!publicId) {
      return NextResponse.json({ error: "Public ID is required" }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: "Cloudinary configuration missing" }, { status: 500 })
    }

    const timestamp = Math.round(new Date().getTime() / 1000)
    const signature = crypto
      .createHash("sha1")
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex")

    const formData = new FormData()
    formData.append("public_id", publicId)
    formData.append("timestamp", timestamp.toString())
    formData.append("api_key", apiKey)
    formData.append("signature", signature)

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: formData,
    })

    const result = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to delete from Cloudinary", details: result },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("[v0] Cloudinary delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
