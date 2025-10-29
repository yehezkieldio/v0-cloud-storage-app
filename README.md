# Cloud Storage App with MySQL

A modern cloud storage application built with Next.js 16 and MySQL for image management.

## Features

- 📁 Folder management (create, rename, delete)
- 🖼️ Image upload with drag-and-drop
- 🗜️ Client-side image compression before upload
- 🎨 Responsive image grid with thumbnails
- 👁️ Full-screen image viewer
- 📱 Mobile-responsive sidebar navigation
- ⚡ Real-time progress tracking for uploads
- 🗑️ Image deletion with confirmation
- 💾 Download images directly
- 🔄 Automatic thumbnail generation

## Setup

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Database Setup

The application uses MySQL for storing image metadata. Database schemas are provided in the `scripts/` folder:

\`\`\`bash
# Run the SQL scripts to create tables
# scripts/001-create-tables.sql
\`\`\`

For development, the app uses localStorage to simulate database operations. In production, connect to a real MySQL database by updating the `lib/db.ts` file with your database connection.

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
3. Images are automatically compressed before upload
4. Watch the upload progress and compression statistics
5. Images appear in the grid automatically

### Compression Settings

- Click the **Settings** button in the upload area
- Choose from preset compression levels:
  - High Quality (minimal compression)
  - Balanced (recommended)
  - Web Optimized (good compression)
  - Aggressive (maximum compression)
- Enable/disable progressive compression for large images

### Managing Images

- **View**: Click any image to open the full-screen viewer
- **Rename**: Click the three dots on an image and select "Rename"
- **Download**: Click the three dots on an image and select "Download"
- **Delete**: Click the three dots on an image and select "Delete"

### Managing Folders

- **Rename**: Hover over a folder, click the three dots, and select "Rename"
- **Delete**: Hover over a folder, click the three dots, and select "Delete"

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: MySQL (simulated with localStorage in development)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS v4
- **Image Processing**: Sharp for thumbnails and compression
- **File Upload**: react-dropzone
- **Compression**: browser-image-compression
- **Notifications**: Sonner

## Project Structure

\`\`\`
├── app/
│   ├── api/
│   │   ├── images/
│   │   │   ├── upload/route.ts       # Image upload endpoint
│   │   │   └── [imageId]/route.ts    # Image operations (delete, rename)
│   │   └── folders/
│   │       ├── route.ts               # List/create folders
│   │       ├── [folderId]/route.ts    # Folder operations
│   │       └── [folderId]/images/route.ts  # List folder images
│   ├── layout.tsx                     # Root layout
│   └── page.tsx                       # Main page with sidebar
├── components/
│   ├── folder-sidebar.tsx             # Folder navigation sidebar
│   ├── image-upload.tsx               # Drag-and-drop upload with compression
│   ├── image-grid.tsx                 # Responsive image grid
│   ├── image-viewer.tsx               # Full-screen image viewer
│   ├── compression-settings-dialog.tsx # Compression settings
│   ├── create-folder-dialog.tsx       # Create folder dialog
│   ├── rename-folder-dialog.tsx       # Rename folder dialog
│   ├── rename-image-dialog.tsx        # Rename image dialog
│   └── delete-folder-dialog.tsx       # Delete folder dialog
├── lib/
│   ├── db.ts                          # Database utility layer
│   ├── file-storage.ts                # File storage utilities
│   ├── compression.ts                 # Image compression utilities
│   ├── storage.ts                     # Client-side storage helpers
│   ├── types.ts                       # TypeScript types
│   └── utils.ts                       # Utility functions
├── scripts/
│   └── 001-create-tables.sql          # Database schema
└── components/ui/                     # shadcn/ui components
\`\`\`

## API Routes

### Upload Image
- **POST** `/api/images/upload`
- Body: FormData with `file`, `folderId`, `folderName`, `fileName`

### List Images
- **GET** `/api/folders/{folderId}/images`
- Returns array of images in folder

### Delete Image
- **DELETE** `/api/images/{imageId}`

### Rename Image
- **PATCH** `/api/images/{imageId}`
- Body: `{ name: string }`

### List Folders
- **GET** `/api/folders`
- Returns array of folders

### Create Folder
- **POST** `/api/folders`
- Body: `{ name: string }`

### Rename Folder
- **PATCH** `/api/folders/{folderId}`
- Body: `{ name: string }`

### Delete Folder
- **DELETE** `/api/folders/{folderId}`

## Database Schema

### Folders Table
\`\`\`sql
CREATE TABLE folders (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
\`\`\`

### Images Table
\`\`\`sql
CREATE TABLE images (
  id VARCHAR(36) PRIMARY KEY,
  folder_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(512) NOT NULL,
  thumbnail_path VARCHAR(512) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  width INT,
  height INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
);
\`\`\`

## Production Deployment

To use a real MySQL database in production:

1. Set up a MySQL database (e.g., on PlanetScale, AWS RDS, or DigitalOcean)
2. Run the SQL scripts in `scripts/` to create tables
3. Update `lib/db.ts` to use a real MySQL connection pool instead of localStorage
4. Configure your database connection string as an environment variable

## License

MIT
