-- Create database schema for image storage application
-- This script creates the necessary tables for folders and images

-- Folders table to store folder hierarchy
CREATE TABLE IF NOT EXISTS folders (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_folder_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Images table to store image metadata
CREATE TABLE IF NOT EXISTS images (
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
  FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE,
  INDEX idx_folder_id (folder_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create default root folder
INSERT INTO folders (id, name) 
VALUES ('root', 'purindo')
ON DUPLICATE KEY UPDATE name = name;
