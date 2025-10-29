import imageCompression from "browser-image-compression"

export interface CompressionSettings {
  maxSizeMB: number
  maxWidthOrHeight: number
  useWebWorker: boolean
  quality: number
}

export interface CompressionPreset {
  name: string
  description: string
  settings: CompressionSettings
}

// Predefined compression presets
export const COMPRESSION_PRESETS: Record<string, CompressionPreset> = {
  high_quality: {
    name: "High Quality",
    description: "Minimal compression, best for professional photos",
    settings: {
      maxSizeMB: 2,
      maxWidthOrHeight: 4096,
      useWebWorker: true,
      quality: 0.9,
    },
  },
  balanced: {
    name: "Balanced",
    description: "Good balance between quality and file size",
    settings: {
      maxSizeMB: 1,
      maxWidthOrHeight: 2048,
      useWebWorker: true,
      quality: 0.8,
    },
  },
  web_optimized: {
    name: "Web Optimized",
    description: "Optimized for web display, smaller file size",
    settings: {
      maxSizeMB: 0.5,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      quality: 0.7,
    },
  },
  aggressive: {
    name: "Aggressive",
    description: "Maximum compression, smallest file size",
    settings: {
      maxSizeMB: 0.2,
      maxWidthOrHeight: 1280,
      useWebWorker: true,
      quality: 0.6,
    },
  },
}

// Get compression settings based on file size (progressive compression)
export function getProgressiveCompressionSettings(fileSizeInMB: number): CompressionSettings {
  if (fileSizeInMB < 1) {
    // Small files: minimal compression
    return COMPRESSION_PRESETS.high_quality.settings
  } else if (fileSizeInMB < 3) {
    // Medium files: balanced compression
    return COMPRESSION_PRESETS.balanced.settings
  } else if (fileSizeInMB < 5) {
    // Large files: web optimized
    return COMPRESSION_PRESETS.web_optimized.settings
  } else {
    // Very large files: aggressive compression
    return COMPRESSION_PRESETS.aggressive.settings
  }
}

// Get compression settings based on image dimensions
export function getDimensionBasedSettings(width: number, height: number): Partial<CompressionSettings> {
  const maxDimension = Math.max(width, height)

  if (maxDimension > 4000) {
    // Very high resolution: compress more
    return {
      maxWidthOrHeight: 2048,
      quality: 0.75,
    }
  } else if (maxDimension > 2000) {
    // High resolution: moderate compression
    return {
      maxWidthOrHeight: 1920,
      quality: 0.8,
    }
  } else {
    // Normal resolution: minimal compression
    return {
      maxWidthOrHeight: 1920,
      quality: 0.85,
    }
  }
}

// Get image dimensions from file
async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Failed to load image"))
    }

    img.src = url
  })
}

export interface CompressionResult {
  compressedFile: File
  originalFile: File // Added original file reference to preserve filename
  originalSize: number
  compressedSize: number
  compressionRatio: number
  dimensions: { width: number; height: number }
}

// Main compression function with smart settings
export async function compressImage(
  file: File,
  preset: keyof typeof COMPRESSION_PRESETS = "balanced",
  useProgressiveCompression = true,
): Promise<CompressionResult> {
  const originalSize = file.size
  const fileSizeInMB = originalSize / 1024 / 1024

  console.log("[v0] Compressing image:", file.name, "Original size:", fileSizeInMB.toFixed(2), "MB")

  // Get image dimensions for smart compression
  let dimensions = { width: 0, height: 0 }
  try {
    dimensions = await getImageDimensions(file)
    console.log("[v0] Image dimensions:", dimensions.width, "x", dimensions.height)
  } catch (error) {
    console.warn("[v0] Could not get image dimensions, using default settings")
  }

  // Determine compression settings
  let settings: CompressionSettings

  if (useProgressiveCompression) {
    // Use progressive compression based on file size
    settings = getProgressiveCompressionSettings(fileSizeInMB)

    // Apply dimension-based adjustments if we have dimensions
    if (dimensions.width > 0) {
      const dimensionSettings = getDimensionBasedSettings(dimensions.width, dimensions.height)
      settings = { ...settings, ...dimensionSettings }
    }

    console.log("[v0] Using progressive compression settings:", settings)
  } else {
    // Use preset
    settings = COMPRESSION_PRESETS[preset].settings
    console.log("[v0] Using preset:", preset, settings)
  }

  // Compress the image
  const compressedFile = await imageCompression(file, settings)
  const compressedSize = compressedFile.size
  const compressionRatio = (1 - compressedSize / originalSize) * 100

  console.log(
    "[v0] Compression complete:",
    "Original:",
    (originalSize / 1024 / 1024).toFixed(2),
    "MB",
    "Compressed:",
    (compressedSize / 1024 / 1024).toFixed(2),
    "MB",
    "Saved:",
    compressionRatio.toFixed(1) + "%",
  )

  return {
    compressedFile,
    originalFile: file, // Include original file reference
    originalSize,
    compressedSize,
    compressionRatio,
    dimensions,
  }
}

// Batch compress multiple images
export async function compressImages(
  files: File[],
  preset: keyof typeof COMPRESSION_PRESETS = "balanced",
  useProgressiveCompression = true,
  onProgress?: (index: number, total: number, result: CompressionResult) => void,
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = []

  for (let i = 0; i < files.length; i++) {
    const result = await compressImage(files[i], preset, useProgressiveCompression)
    results.push(result)

    if (onProgress) {
      onProgress(i + 1, files.length, result)
    }
  }

  return results
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B"
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
  return (bytes / (1024 * 1024)).toFixed(2) + " MB"
}
