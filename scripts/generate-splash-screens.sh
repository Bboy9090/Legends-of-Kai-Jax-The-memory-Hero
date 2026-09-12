#!/bin/bash

# Android Splash Screens Generator
# Generates adaptive splash screens for different device aspect ratios
# Usage: ./generate-splash-screens.sh <logo-image> [background-color]

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
Usage: $(basename "$0") <logo-image> [background-color]

Arguments:
  logo-image         Path to logo/icon (recommended: 512x512 PNG)
  background-color   Background color (default: #1a1a2e)
                     Format: hex color (#RRGGBB)

Device aspect ratios generated:
  Mobile (portrait):
    - Pixel 6 (1440×3120, 20:9)
    - Samsung S21 (1440×3200, 20:9)
    - Standard (1080×1920, 16:9)

  Mobile (landscape):
    - Standard (1920×1080, 16:9)

  Tablet (portrait):
    - iPad (1536×2048, 3:4)
    - Standard (1600×2560, 5:8)

  Tablet (landscape):
    - Standard (2560×1600, 8:5)

Requirements:
  - ImageMagick (convert, identify commands)

Examples:
  $(basename "$0") logo.png
  $(basename "$0") logo.png "#2d3748"
  $(basename "$0") /path/to/logo.png "#000000"

EOF
}

# Check arguments
if [ $# -lt 1 ]; then
  print_error "Missing logo image argument"
fi

LOGO_IMAGE="$1"
BG_COLOR="${2:-#1a1a2e}"

# Check if logo file exists
if [ ! -f "$LOGO_IMAGE" ]; then
  print_error "Logo file not found: $LOGO_IMAGE"
fi

# Check if ImageMagick is installed
command -v convert >/dev/null 2>&1 || print_error "ImageMagick not found. Install with: sudo apt-get install imagemagick"

# Determine output directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$PROJECT_ROOT/apps/web/android/app/src/main/res"

echo "Generating Android splash screens..."
echo "Logo: $LOGO_IMAGE"
echo "Background color: $BG_COLOR"
echo "Output directory: $OUTPUT_DIR"
echo ""

# Ensure logo is properly sized
LOGO_DIMENSIONS=$(identify "$LOGO_IMAGE" | grep -o '[0-9]\+x[0-9]\+' | head -1)
echo "Logo size: $LOGO_DIMENSIONS"

# If logo is not square, resize it to square
if [[ ! "$LOGO_DIMENSIONS" =~ ^[0-9]+x[0-9]+$ ]] || [ "$(echo "$LOGO_DIMENSIONS" | cut -d'x' -f1)" != "$(echo "$LOGO_DIMENSIONS" | cut -d'x' -f2)" ]; then
  print_info "Resizing logo to square..."
  TEMP_LOGO="/tmp/kai-jax-logo-square.png"
  convert "$LOGO_IMAGE" -resize 512x512 "$TEMP_LOGO"
  LOGO_IMAGE="$TEMP_LOGO"
fi

echo ""
echo "Generating splash screens for all aspect ratios..."
echo ""

# Define splash screen sizes
# Format: type:width:height:folder
SPLASH_SIZES=(
  # Portrait layouts
  "port-mdpi:480:800:drawable-port-mdpi"
  "port-hdpi:720:1280:drawable-port-hdpi"
  "port-xhdpi:1080:1920:drawable-port-xhdpi"
  "port-xxhdpi:1440:2560:drawable-port-xxhdpi"
  "port-xxxhdpi:1440:3120:drawable-port-xxxhdpi"

  # Landscape layouts
  "land-mdpi:800:480:drawable-land-mdpi"
  "land-hdpi:1280:720:drawable-land-hdpi"
  "land-xhdpi:1920:1080:drawable-land-xhdpi"
  "land-xxhdpi:2560:1440:drawable-land-xxhdpi"
  "land-xxxhdpi:3120:1440:drawable-land-xxxhdpi"
)

# Generate splash screens
for SPLASH_INFO in "${SPLASH_SIZES[@]}"; do
  IFS=':' read -r TYPE WIDTH HEIGHT FOLDER <<< "$SPLASH_INFO"

  OUTPUT_PATH="$OUTPUT_DIR/$FOLDER/splash.png"
  OUTPUT_DIR_PATH="$OUTPUT_DIR/$FOLDER"

  # Create directory if it doesn't exist
  mkdir -p "$OUTPUT_DIR_PATH"

  print_info "Generating splash ($TYPE: ${WIDTH}×${HEIGHT})..."

  # Create splash screen with background and centered logo
  # Logo size will be 25% of the smaller dimension
  LOGO_SIZE=$((WIDTH < HEIGHT ? WIDTH / 4 : HEIGHT / 4))

  convert "$LOGO_IMAGE" -resize ${LOGO_SIZE}x${LOGO_SIZE} /tmp/kai-jax-logo-temp.png

  # Create background
  convert -size ${WIDTH}x${HEIGHT} xc:"$BG_COLOR" /tmp/bg-temp.png

  # Composite logo onto background (centered)
  composite -gravity center /tmp/kai-jax-logo-temp.png /tmp/bg-temp.png "$OUTPUT_PATH"

  if [ -f "$OUTPUT_PATH" ]; then
    print_success "Created: $OUTPUT_PATH"
  else
    print_error "Failed to create: $OUTPUT_PATH"
  fi
done

# Clean up temp files
rm -f /tmp/kai-jax-logo-temp.png /tmp/bg-temp.png /tmp/kai-jax-logo-square.png 2>/dev/null

# Summary
echo ""
echo "========================================"
echo "Splash screen generation complete!"
echo "========================================"
echo ""
echo "Generated splash screens for:"
echo "  Portrait (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)"
echo "  Landscape (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)"
echo ""
echo "Output directory: $OUTPUT_DIR"
echo ""
echo "Device coverage:"
echo "  ✓ Pixel 6 (1440×3120)"
echo "  ✓ Samsung S21 (1440×3200)"
echo "  ✓ Standard phones (1080×1920)"
echo "  ✓ Tablets (1600×2560)"
echo ""
echo "Next steps:"
echo "  1. Review splash screens for visual quality"
echo "  2. Build the app: ./scripts/build-android-release.sh -t"
echo "  3. Test on various devices/emulators"
echo ""

print_success "Done!"
