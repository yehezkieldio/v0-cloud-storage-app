# Cloud Storage App with Cloudinary

A modern cloud storage application built with Next.js 16 and Cloudinary for image management.

## Features

- 📁 Folder management (create, rename, delete)
- 🖼️ Image upload with drag-and-drop
- 🎨 Responsive image grid with thumbnails
- 👁️ Full-screen image viewer
- 📱 Mobile-responsive sidebar navigation
- ⚡ Real-time progress tracking for uploads
- 🗑️ Image deletion with confirmation
- 💾 Download images directly

## Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Configure Cloudinary

1. Create a free account at [Cloudinary](https://cloudinary.com/)
2. Go to your [Cloudinary Console](https://console.cloudinary.com/)
3. Copy your Cloud Name, API Key, and API Secret
4. Add them to the **Vars** section in the v0 sidebar:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

### 3. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Usage

### Creating Folders

1. Click the **+** button in the sidebar
2. Enter a folder name
3. Click "Create Folder"

### Uploading Images

1. Select a folder (or use "All Images" for root)
2. Drag and drop images into the upload area, or click to browse
3. Watch the upload progress
4. Images appear in the grid automatically

### Managing Images

- **View**: Click any image to open the full-screen viewer
- **Download**: Click the three dots on an image and select "Download"
- **Delete**: Click the three dots on an image and select "Delete"

### Managing Folders

- **Rename**: Hover over a folder, click the three dots, and select "Rename"
- **Delete**: Hover over a folder, click the three dots, and select "Delete"

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4
- **Cloud Storage**: Cloudinary
- **File Upload**: react-dropzone
- **Notifications**: Sonner

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   └── cloudinary/
│   │       ├── upload/route.ts       # Image upload endpoint
│   │       ├── delete/route.ts       # Image deletion endpoint
│   │       ├── images/route.ts       # List images endpoint
│   │       └── folders/              # Folder management endpoints
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Main page with sidebar
├── components/
│   ├── folder-sidebar.tsx            # Folder navigation sidebar
│   ├── image-upload.tsx              # Drag-and-drop upload component
│   ├── image-grid.tsx                # Responsive image grid
│   ├── image-viewer.tsx              # Full-screen image viewer
│   ├── create-folder-dialog.tsx      # Create folder dialog
│   ├── rename-folder-dialog.tsx      # Rename folder dialog
│   └── delete-folder-dialog.tsx      # Delete folder dialog
├── lib/
│   ├── cloudinary.ts                 # Cloudinary utility functions
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # Utility functions
└── components/ui/                    # shadcn/ui components
\`\`\`

## API Routes

### Upload Image
- **POST** `/api/cloudinary/upload`
- Body: FormData with `file` and optional `folderId`

### List Images
- **GET** `/api/cloudinary/images?folderId={id}`
- Returns array of images

### Delete Image
- **DELETE** `/api/cloudinary/delete`
- Body: `{ publicId: string }`

### List Folders
- **GET** `/api/cloudinary/folders`
- Returns array of folders

### Create Folder
- **POST** `/api/cloudinary/folders`
- Body: `{ name: string }`

### Rename Folder
- **PATCH** `/api/cloudinary/folders/{folderId}`
- Body: `{ name: string }`

### Delete Folder
- **DELETE** `/api/cloudinary/folders/{folderId}`

## Environment Variables

Required environment variables (add these in the Vars section):

- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

## License

MIT
