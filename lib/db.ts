// Database utility layer for MySQL operations
// In production, this would use a real MySQL connection pool
// For now, it uses localStorage to simulate database operations

export interface DBFolder {
  id: string
  name: string
  created_at: string
  updated_at: string
}

export interface DBImage {
  id: string
  folder_id: string
  name: string
  original_name: string
  file_path: string
  thumbnail_path: string
  file_size: number
  mime_type: string
  width?: number
  height?: number
  created_at: string
  updated_at: string
}

// Simulated database operations using localStorage
// In production, replace these with actual MySQL queries

const FOLDERS_KEY = "db_folders"
const IMAGES_KEY = "db_images"

function getFromStorage<T>(key: string): T[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

function saveToStorage<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(data))
}

// Folder operations
export const db = {
  folders: {
    async findAll(): Promise<DBFolder[]> {
      return getFromStorage<DBFolder>(FOLDERS_KEY)
    },

    async findById(id: string): Promise<DBFolder | null> {
      const folders = getFromStorage<DBFolder>(FOLDERS_KEY)
      return folders.find((f) => f.id === id) || null
    },

    async create(folder: Omit<DBFolder, "created_at" | "updated_at">): Promise<DBFolder> {
      const folders = getFromStorage<DBFolder>(FOLDERS_KEY)
      const now = new Date().toISOString()
      const newFolder: DBFolder = {
        ...folder,
        created_at: now,
        updated_at: now,
      }
      folders.push(newFolder)
      saveToStorage(FOLDERS_KEY, folders)
      return newFolder
    },

    async update(id: string, data: Partial<DBFolder>): Promise<DBFolder | null> {
      const folders = getFromStorage<DBFolder>(FOLDERS_KEY)
      const index = folders.findIndex((f) => f.id === id)
      if (index === -1) return null

      folders[index] = {
        ...folders[index],
        ...data,
        updated_at: new Date().toISOString(),
      }
      saveToStorage(FOLDERS_KEY, folders)
      return folders[index]
    },

    async delete(id: string): Promise<boolean> {
      const folders = getFromStorage<DBFolder>(FOLDERS_KEY)
      const filtered = folders.filter((f) => f.id !== id)
      if (filtered.length === folders.length) return false
      saveToStorage(FOLDERS_KEY, filtered)

      // Also delete all images in this folder
      const images = getFromStorage<DBImage>(IMAGES_KEY)
      const filteredImages = images.filter((img) => img.folder_id !== id)
      saveToStorage(IMAGES_KEY, filteredImages)

      return true
    },
  },

  images: {
    async findAll(): Promise<DBImage[]> {
      return getFromStorage<DBImage>(IMAGES_KEY)
    },

    async findByFolderId(folderId: string): Promise<DBImage[]> {
      const images = getFromStorage<DBImage>(IMAGES_KEY)
      return images.filter((img) => img.folder_id === folderId)
    },

    async findById(id: string): Promise<DBImage | null> {
      const images = getFromStorage<DBImage>(IMAGES_KEY)
      return images.find((img) => img.id === id) || null
    },

    async create(image: Omit<DBImage, "created_at" | "updated_at">): Promise<DBImage> {
      const images = getFromStorage<DBImage>(IMAGES_KEY)
      const now = new Date().toISOString()
      const newImage: DBImage = {
        ...image,
        created_at: now,
        updated_at: now,
      }
      images.push(newImage)
      saveToStorage(IMAGES_KEY, images)
      return newImage
    },

    async update(id: string, data: Partial<DBImage>): Promise<DBImage | null> {
      const images = getFromStorage<DBImage>(IMAGES_KEY)
      const index = images.findIndex((img) => img.id === id)
      if (index === -1) return null

      images[index] = {
        ...images[index],
        ...data,
        updated_at: new Date().toISOString(),
      }
      saveToStorage(IMAGES_KEY, images)
      return images[index]
    },

    async delete(id: string): Promise<boolean> {
      const images = getFromStorage<DBImage>(IMAGES_KEY)
      const filtered = images.filter((img) => img.id !== id)
      if (filtered.length === images.length) return false
      saveToStorage(IMAGES_KEY, filtered)
      return true
    },
  },
}

// Helper to generate UUIDs
export function generateId(): string {
  return globalThis.crypto.randomUUID()
}
