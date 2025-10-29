// Client-side storage utility functions
// These functions provide a simple interface for localStorage operations
// Used by components that need to cache data locally

import type { Image } from "@/lib/types"

// Add image to localStorage cache
export function addImage(image: Image): void {
  if (typeof window === "undefined") return

  try {
    const images = JSON.parse(localStorage.getItem("cloud_storage_images") || "[]")
    images.push(image)
    localStorage.setItem("cloud_storage_images", JSON.stringify(images))
  } catch (error) {
    console.error("[v0] Error adding image to localStorage:", error)
  }
}

// Rename image in localStorage cache
export async function renameImage(imageId: string, newName: string): Promise<void> {
  try {
    // Call API to rename in database
    const response = await fetch(`/api/images/${imageId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    })

    if (!response.ok) {
      throw new Error("Failed to rename image")
    }

    // Update localStorage cache
    if (typeof window !== "undefined") {
      const images = JSON.parse(localStorage.getItem("cloud_storage_images") || "[]")
      const updatedImages = images.map((img: Image) => (img.id === imageId ? { ...img, name: newName } : img))
      localStorage.setItem("cloud_storage_images", JSON.stringify(updatedImages))
    }
  } catch (error) {
    console.error("[v0] Error renaming image:", error)
    throw error
  }
}
