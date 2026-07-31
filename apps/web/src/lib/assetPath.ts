/// <reference types="vite/client" />

/**
 * Asset path resolution utility for GitHub Pages subdirectory deployment.
 * Uses import.meta.env.BASE_URL from Vite configuration to construct correct asset paths.
 * This ensures assets load correctly whether deployed at root or in a subdirectory.
 */

export function getAssetPath(relativePath: string): string {
  const baseUrl = import.meta.env.BASE_URL || '/';
  // Remove leading slash if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  // Ensure baseUrl ends with slash for clean concatenation
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  return `${cleanBase}${cleanPath}`;
}
