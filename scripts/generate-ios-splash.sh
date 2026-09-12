#!/bin/bash

# iOS Splash Screen Generation Script
# Generates splash screens for different device sizes
# Requires ImageMagick to be installed

set -e

SOURCE_IMAGE="${1:-}"
SPLASH_DIR="/home/user/Legends-of-Kai-Jax-The-memory-Hero/apps/web/ios/App/App/Assets.xcassets/Splash.imageset"

if [ -z "$SOURCE_IMAGE" ]; then
  echo "Usage: $0 <path-to-splash-image.png>"
  echo ""
  echo "This script generates splash screens for iOS devices."
  echo "ImageMagick must be installed: brew install imagemagick"
  echo ""
  echo "Recommended source image dimensions: 2732x2732px (for iPad Pro)"
  exit 1
fi

if [ ! -f "$SOURCE_IMAGE" ]; then
  echo "Error: Source image not found: $SOURCE_IMAGE"
  exit 1
fi

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
  echo "Error: ImageMagick is not installed."
  echo "Install it with: brew install imagemagick"
  exit 1
fi

echo "Generating iOS splash screens from: $SOURCE_IMAGE"
echo "Output directory: $SPLASH_DIR"
echo ""

# Generate splash screens for different device types
# iPhone SE (2020): 750x1334
echo "Generating iPhone SE splash screen (750x1334)..."
convert "$SOURCE_IMAGE" -resize 750x1334 -gravity center -extent 750x1334 "$SPLASH_DIR/splash-750x1334.png"

# iPhone 12/13 Pro (390x844)
echo "Generating iPhone 12/13 Pro splash screen (390x844)..."
convert "$SOURCE_IMAGE" -resize 390x844 -gravity center -extent 390x844 "$SPLASH_DIR/splash-390x844.png"

# iPhone 12/13 Pro Max (430x932)
echo "Generating iPhone 12/13 Pro Max splash screen (430x932)..."
convert "$SOURCE_IMAGE" -resize 430x932 -gravity center -extent 430x932 "$SPLASH_DIR/splash-430x932.png"

# iPad (768x1024)
echo "Generating iPad splash screen (768x1024)..."
convert "$SOURCE_IMAGE" -resize 768x1024 -gravity center -extent 768x1024 "$SPLASH_DIR/splash-768x1024.png"

# iPad Pro 11" (1024x1366)
echo "Generating iPad Pro 11 splash screen (1024x1366)..."
convert "$SOURCE_IMAGE" -resize 1024x1366 -gravity center -extent 1024x1366 "$SPLASH_DIR/splash-1024x1366.png"

# iPad Pro 12.9" (1366x1024) - landscape
echo "Generating iPad Pro 12.9 splash screen (1366x1024)..."
convert "$SOURCE_IMAGE" -resize 1366x1024 -gravity center -extent 1366x1024 "$SPLASH_DIR/splash-1366x1024.png"

# Universal splash (2732x2732 - for all devices)
echo "Generating universal splash screen (2732x2732)..."
convert "$SOURCE_IMAGE" -resize 2732x2732 "$SPLASH_DIR/splash-2732x2732.png"

echo ""
echo "Splash screen generation complete!"
echo "Generated splash screens:"
ls -lh "$SPLASH_DIR"/splash-*.png 2>/dev/null | awk '{print $9, "(" $5 ")"}'
echo ""
echo "Next steps:"
echo "1. Verify splash screens look correct"
echo "2. Update Splash.imageset/Contents.json if adding new sizes"
echo "3. Run: pnpm cap sync ios"
echo "4. Open in Xcode: pnpm cap open ios"
