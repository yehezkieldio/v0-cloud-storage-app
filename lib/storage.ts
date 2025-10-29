import type { Folder, Image } from "./types"

const FOLDERS_KEY = "cloud_storage_folders"
const IMAGES_KEY = "cloud_storage_images"

// Folder operations
export function getFolders(): Folder[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(FOLDERS_KEY)
  return data ? JSON.parse(data) : []
}

export function getFolder(id: string): Folder | null {
  const folders = getFolders()
  return folders.find((f) => f.id === id) || null
}

export function createFolder(name: string): Folder {
  const folders = getFolders()
  const newFolder: Folder = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
    imageCount: 0,
  }
  folders.push(newFolder)
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  return newFolder
}

export function updateFolder(id: string, name: string): void {
  const folders = getFolders()
  const index = folders.findIndex((f) => f.id === id)
  if (index !== -1) {
    folders[index].name = name
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  }
}

export function deleteFolder(id: string): void {
  const folders = getFolders()
  const filtered = folders.filter((f) => f.id !== id)
  localStorage.setItem(FOLDERS_KEY, JSON.stringify(filtered))

  // Also delete all images in this folder
  const images = getImages()
  const filteredImages = images.filter((img) => img.folderId !== id)
  localStorage.setItem(IMAGES_KEY, JSON.stringify(filteredImages))
}

export function updateFolderImageCount(folderId: string): void {
  const folders = getFolders()
  const images = getImages()
  const index = folders.findIndex((f) => f.id === folderId)
  if (index !== -1) {
    folders[index].imageCount = images.filter((img) => img.folderId === folderId).length
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders))
  }
}

// Image operations
export function getImages(): Image[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(IMAGES_KEY)
  return data ? JSON.parse(data) : []
}

export function getImagesByFolder(folderId: string): Image[] {
  const images = getImages()
  return images.filter((img) => img.folderId === folderId)
}

export function addImage(image: Image): void {
  const images = getImages()
  images.push(image)
  localStorage.setItem(IMAGES_KEY, JSON.stringify(images))
  updateFolderImageCount(image.folderId)
}

export function deleteImage(id: string): void {
  const images = getImages()
  const image = images.find((img) => img.id === id)
  const filtered = images.filter((img) => img.id !== id)
  localStorage.setItem(IMAGES_KEY, JSON.stringify(filtered))

  if (image) {
    updateFolderImageCount(image.folderId)
  }
}
