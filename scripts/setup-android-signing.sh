#!/bin/bash

# Android Signing Setup Script
# Creates keystore and signing configuration for release builds
# Usage: ./setup-android-signing.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ANDROID_DIR="$PROJECT_ROOT/apps/web/android"
KEYSTORE_PATH="$PROJECT_ROOT/release.keystore"

# Functions
print_header() {
  echo -e "\n${GREEN}========================================${NC}"
  echo -e "${GREEN}$1${NC}"
  echo -e "${GREEN}========================================${NC}\n"
}

print_step() {
  echo -e "\n${YELLOW}→ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ $1${NC}"
}

print_error() {
  echo -e "\n${RED}✗ Error: $1${NC}"
  exit 1
}

print_success() {
  echo -e "\n${GREEN}✓ $1${NC}"
}

print_warning() {
  echo -e "\n${YELLOW}⚠ Warning: $1${NC}"
}

# Check if keytool is available
command -v keytool >/dev/null 2>&1 || print_error "Java keytool not found. Install JDK from https://adoptopenjdk.net/"

print_header "Legends of Kai-Jax Android Signing Setup"

# Check if keystore already exists
if [ -f "$KEYSTORE_PATH" ]; then
  print_warning "Keystore already exists at: $KEYSTORE_PATH"
  read -p "Do you want to create a new keystore? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_info "Using existing keystore"
    SKIP_KEYSTORE=true
  else
    read -p "This will overwrite the existing keystore. Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      print_info "Cancelled"
      exit 0
    fi
    SKIP_KEYSTORE=false
  fi
else
  SKIP_KEYSTORE=false
fi

# Step 1: Create Keystore
if [ "$SKIP_KEYSTORE" = false ]; then
  print_header "Step 1: Creating Release Keystore"

  print_info "You will be prompted to enter keystore details"
  print_info "Make sure to remember the passwords - they cannot be recovered"

  print_step "Creating keystore at: $KEYSTORE_PATH"

  keytool -genkey -v -keystore "$KEYSTORE_PATH" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -alias kaijax_release

  if [ ! -f "$KEYSTORE_PATH" ]; then
    print_error "Failed to create keystore"
  fi

  print_success "Keystore created successfully"
  ls -lh "$KEYSTORE_PATH"
fi

# Step 2: Create signing.properties
print_header "Step 2: Creating Signing Configuration"

SIGNING_PROPS="$ANDROID_DIR/signing.properties"

print_step "Creating signing.properties..."

# Read keystore password
read -sp "Enter keystore password: " KEYSTORE_PASSWORD
echo
read -sp "Confirm keystore password: " KEYSTORE_PASSWORD_CONFIRM
echo

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
  print_error "Passwords do not match"
fi

# Read key password
read -sp "Enter key password (usually same as keystore): " KEY_PASSWORD
echo

# Create the signing properties file
cat > "$SIGNING_PROPS" << EOF
# Android Release Signing Configuration
# WARNING: This file contains sensitive information - never commit to git!
# Add to .gitignore to prevent accidental commits

# Path to the release keystore (relative to android/ directory)
RELEASE_KEY_STORE_PATH=../../../release.keystore

# Keystore password
RELEASE_KEY_STORE_PASSWORD=$KEYSTORE_PASSWORD

# Key alias (same as -alias in keytool command)
RELEASE_KEY_ALIAS=kaijax_release

# Key password
RELEASE_KEY_PASSWORD=$KEY_PASSWORD

# Optional: Key validity (in years)
KEY_VALIDITY=10000
EOF

print_success "Signing configuration created"
ls -lh "$SIGNING_PROPS"

# Step 3: Verify signing.properties is in gitignore
print_header "Step 3: Git Configuration"

GITIGNORE="$PROJECT_ROOT/.gitignore"

if [ -f "$GITIGNORE" ]; then
  if grep -q "signing.properties" "$GITIGNORE" && grep -q "release.keystore" "$GITIGNORE"; then
    print_info "Signing files already in .gitignore"
  else
    print_step "Adding signing files to .gitignore..."

    # Append to gitignore
    {
      echo ""
      echo "# Android release signing (sensitive - never commit!)"
      echo "apps/web/android/signing.properties"
      echo "release.keystore"
    } >> "$GITIGNORE"

    print_success "Updated .gitignore"
  fi
else
  print_warning "No .gitignore found. Create one to prevent accidental commits of sensitive files"
fi

# Step 4: Verify keystore
print_header "Step 4: Verifying Keystore"

print_step "Verifying keystore integrity..."

keytool -list -v -keystore "$KEYSTORE_PATH" -storepass "$KEYSTORE_PASSWORD" | head -20

print_success "Keystore verified"

# Step 5: Environment Variables Alternative
print_header "Step 5: Alternative Setup (Environment Variables)"

print_info "You can also use environment variables instead of signing.properties:"
print_info "Add to your shell profile (.bashrc, .zshrc, etc.):"

cat << 'EOF'

export RELEASE_KEY_STORE_PATH=/path/to/release.keystore
export RELEASE_KEY_STORE_PASSWORD=your_password
export RELEASE_KEY_ALIAS=kaijax_release
export RELEASE_KEY_PASSWORD=your_password

EOF

# Final summary
print_header "Setup Complete!"

echo "Next steps:"
echo ""
echo "1. Backup your keystore and passwords:"
echo "   - Keystore: $KEYSTORE_PATH"
echo "   - Passwords: Save in secure password manager"
echo ""
echo "2. Verify signing.properties is in .gitignore"
echo "   (should not be committed to git)"
echo ""
echo "3. Test the signing configuration:"
echo "   cd $ANDROID_DIR"
echo "   ./gradlew bundleRelease"
echo ""
echo "4. For CI/CD pipelines, use environment variables instead of signing.properties"
echo ""

print_success "Signing setup complete!"
