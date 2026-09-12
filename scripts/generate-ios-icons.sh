#!/bin/bash

# iOS Icon Generation Script
# Generates all required iOS app icons from a single 1024x1024 source image
# Requires ImageMagick to be installed

set -e

SOURCE_IMAGE="${1:-}"
ICON_DIR="/home/user/Legends-of-Kai-Jax-The-memory-Hero/apps/web/ios/App/App/Assets.xcassets/AppIcon.appiconset"

if [ -z "$SOURCE_IMAGE" ]; then
  echo "Usage: $0 <path-to-1024x1024-icon.png>"
  echo ""
  echo "This script generates all required iOS app icons from a single 1024x1024 PNG image."
  echo "ImageMagick must be installed: brew install imagemagick"
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

echo "Generating iOS icons from: $SOURCE_IMAGE"
echo "Output directory: $ICON_DIR"
echo ""

# iPhone icons
echo "Generating iPhone icons..."
convert "$SOURCE_IMAGE" -resize 40x40 "$ICON_DIR/icon-20.png"
convert "$SOURCE_IMAGE" -resize 60x60 "$ICON_DIR/icon-20@3x.png"
convert "$SOURCE_IMAGE" -resize 58x58 "$ICON_DIR/icon-29.png"
convert "$SOURCE_IMAGE" -resize 87x87 "$ICON_DIR/icon-29@3x.png"
convert "$SOURCE_IMAGE" -resize 80x80 "$ICON_DIR/icon-40.png"
convert "$SOURCE_IMAGE" -resize 120x120 "$ICON_DIR/icon-40@3x.png"
convert "$SOURCE_IMAGE" -resize 120x120 "$ICON_DIR/icon-60@2x.png"
convert "$SOURCE_IMAGE" -resize 180x180 "$ICON_DIR/icon-60@3x.png"

# iPad icons
echo "Generating iPad icons..."
convert "$SOURCE_IMAGE" -resize 20x20 "$ICON_DIR/icon-ipad-20.png"
convert "$SOURCE_IMAGE" -resize 40x40 "$ICON_DIR/icon-ipad-20@2x.png"
convert "$SOURCE_IMAGE" -resize 29x29 "$ICON_DIR/icon-ipad-29.png"
convert "$SOURCE_IMAGE" -resize 58x58 "$ICON_DIR/icon-ipad-29@2x.png"
convert "$SOURCE_IMAGE" -resize 40x40 "$ICON_DIR/icon-ipad-40.png"
convert "$SOURCE_IMAGE" -resize 80x80 "$ICON_DIR/icon-ipad-40@2x.png"
convert "$SOURCE_IMAGE" -resize 76x76 "$ICON_DIR/icon-ipad-76.png"
convert "$SOURCE_IMAGE" -resize 152x152 "$ICON_DIR/icon-ipad-76@2x.png"
convert "$SOURCE_IMAGE" -resize 167x167 "$ICON_DIR/icon-ipad-83.5@2x.png"

# App Store icon (already exists as AppIcon-512@2x.png, but regenerate to ensure consistency)
echo "Generating App Store icon..."
convert "$SOURCE_IMAGE" -resize 1024x1024 "$ICON_DIR/AppIcon-512@2x.png"

echo ""
echo "Icon generation complete!"
echo "Generated icons:"
ls -lh "$ICON_DIR"/icon-*.png "$ICON_DIR"/AppIcon-*.png 2>/dev/null | awk '{print $9, "(" $5 ")"}'
echo ""
echo "Next steps:"
echo "1. Verify all icons look correct"
echo "2. Run: pnpm cap sync ios"
echo "3. Open in Xcode: pnpm cap open ios"
