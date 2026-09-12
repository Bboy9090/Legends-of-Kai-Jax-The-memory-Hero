#!/bin/bash

# Android App Icons Generator
# Generates app icons of all required sizes from a 512x512 base image
# Usage: ./generate-app-icons.sh <input-image> [output-dir]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_error() {
  echo -e "${RED}✗ Error: $1${NC}"
  exit 1
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
  echo -e "${YELLOW}ℹ $1${NC}"
}

show_usage() {
  cat << EOF
Usage: $(basename "$0") <input-image> [output-dir]

Arguments:
  input-image     Path to 512x512 PNG source icon
  output-dir      Output directory (default: Android resources directory)

Requirements:
  - ImageMagick (convert command)

Examples:
  $(basename "$0") icon.png
  $(basename "$0") /path/to/icon.png /custom/output/dir

Icon sizes generated:
  - mdpi (1x):      48×48
  - hdpi (1.5x):    72×72
  - xhdpi (2x):     96×96
  - xxhdpi (3x):    144×144
  - xxxhdpi (4x):   192×192

Plus notification icons:
  - notification_icon_192.png (192×192)
  - notification_icon_384.png (384×384)

EOF
}

# Check arguments
if [ $# -lt 1 ]; then
  print_error "Missing input image argument"
fi

INPUT_IMAGE="$1"

# Check if input file exists
if [ ! -f "$INPUT_IMAGE" ]; then
  print_error "Input file not found: $INPUT_IMAGE"
fi

# Check if ImageMagick is installed
command -v convert >/dev/null 2>&1 || print_error "ImageMagick not found. Install with: sudo apt-get install imagemagick"

# Determine output directory
if [ -n "$2" ]; then
  OUTPUT_DIR="$2"
else
  # Default to Android resources directory
  SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
  OUTPUT_DIR="$PROJECT_ROOT/apps/web/android/app/src/main/res"
fi

# Create output directories
MIPMAP_DIRS=(
  "mipmap-mdpi"
  "mipmap-hdpi"
  "mipmap-xhdpi"
  "mipmap-xxhdpi"
  "mipmap-xxxhdpi"
)

DRAWABLE_DIR="drawable"

echo "Generating Android app icons..."
echo "Input: $INPUT_IMAGE"
echo "Output: $OUTPUT_DIR"
echo ""

# Check if input is 512x512
DIMENSIONS=$(identify "$INPUT_IMAGE" | grep -o '[0-9]\+x[0-9]\+' | head -1)
echo "Input image size: $DIMENSIONS"

if [ "$DIMENSIONS" != "512x512" ]; then
  print_info "Resizing input image to 512x512 (this may affect quality)"
  TEMP_IMAGE="/tmp/kai-jax-icon-512.png"
  convert "$INPUT_IMAGE" -resize 512x512 "$TEMP_IMAGE"
  INPUT_IMAGE="$TEMP_IMAGE"
fi

echo ""
echo "Generating icon sizes..."

# Define icon sizes for each density
# Format: density:size:folder
SIZES=(
  "mdpi:48:mipmap-mdpi"
  "hdpi:72:mipmap-hdpi"
  "xhdpi:96:mipmap-xhdpi"
  "xxhdpi:144:mipmap-xxhdpi"
  "xxxhdpi:192:mipmap-xxxhdpi"
)

# Generate app icons for each size
for SIZE_INFO in "${SIZES[@]}"; do
  IFS=':' read -r DENSITY SIZE FOLDER <<< "$SIZE_INFO"

  INPUT_PATH="$OUTPUT_DIR/$FOLDER"
  OUTPUT_PATH="$INPUT_PATH/ic_launcher.png"

  # Create directory if it doesn't exist
  mkdir -p "$INPUT_PATH"

  print_info "Generating $DENSITY ($SIZE×$SIZE)..."
  convert "$INPUT_IMAGE" -resize ${SIZE}x${SIZE} "$OUTPUT_PATH"

  if [ -f "$OUTPUT_PATH" ]; then
    print_success "Created: $OUTPUT_PATH"
  else
    print_error "Failed to create: $OUTPUT_PATH"
  fi
done

# Generate notification icons (192x192 and 384x384)
echo ""
echo "Generating notification icons..."

mkdir -p "$OUTPUT_DIR/$DRAWABLE_DIR"

print_info "Generating notification icon (192×192)..."
convert "$INPUT_IMAGE" -resize 192x192 "$OUTPUT_DIR/$DRAWABLE_DIR/notification_icon_192.png"
print_success "Created: $OUTPUT_DIR/$DRAWABLE_DIR/notification_icon_192.png"

print_info "Generating notification icon (384×384)..."
convert "$INPUT_IMAGE" -resize 384x384 "$OUTPUT_DIR/$DRAWABLE_DIR/notification_icon_384.png"
print_success "Created: $OUTPUT_DIR/$DRAWABLE_DIR/notification_icon_384.png"

# Generate round icons if needed
echo ""
echo "Generating round app icons..."

for SIZE_INFO in "${SIZES[@]}"; do
  IFS=':' read -r DENSITY SIZE FOLDER <<< "$SIZE_INFO"

  INPUT_PATH="$OUTPUT_DIR/$FOLDER"
  OUTPUT_PATH="$INPUT_PATH/ic_launcher_round.png"

  print_info "Generating round $DENSITY ($SIZE×$SIZE)..."
  convert "$INPUT_IMAGE" -resize ${SIZE}x${SIZE} -background none -gravity center -extent ${SIZE}x${SIZE} \( +clone -threshold -1 -morphology erode octagon:2 -morphology dilate octagon:2 \) -alpha off -compose CopyOpacity -composite -trim -gravity center -background none -extent ${SIZE}x${SIZE} "$OUTPUT_PATH" 2>/dev/null || {
    # Fallback: just resize without making it round
    convert "$INPUT_IMAGE" -resize ${SIZE}x${SIZE} "$OUTPUT_PATH"
  }

  if [ -f "$OUTPUT_PATH" ]; then
    print_success "Created: $OUTPUT_PATH"
  fi
done

# Summary
echo ""
echo "========================================"
echo "Icon generation complete!"
echo "========================================"
echo ""
echo "Generated icons:"
echo "  App icons (ic_launcher.png)"
echo "  Round icons (ic_launcher_round.png)"
echo "  Notification icons (notification_icon_*.png)"
echo ""
echo "Output directory: $OUTPUT_DIR"
echo ""
echo "Next steps:"
echo "  1. Review generated icons for quality"
echo "  2. Build the app: ./scripts/build-android-release.sh -t"
echo "  3. Test on device/emulator"
echo ""

print_success "Done!"
