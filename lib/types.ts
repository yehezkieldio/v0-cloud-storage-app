export interface Folder {
  id: string
  name: string
  createdAt: string
  imageCount: number
}

export interface Image {
  id: string
  url: string
  thumbnailUrl: string
  publicId: string
  folderId: string
  name: string
  size: number
  width: number
  height: number
  createdAt: string
}
