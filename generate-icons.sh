#!/bin/bash

echo "🎨 Generating iOS App Icons from AppIcon.png..."

# Check if AppIcon.png exists
if [ ! -f "AppIcon.png" ]; then
    echo "❌ Error: AppIcon.png not found in current directory"
    echo "Please place AppIcon.png in the project root directory"
    exit 1
fi

# Create icons directory if it doesn't exist
ICON_DIR="ios/App/App/Assets.xcassets/AppIcon.appiconset"
mkdir -p "$ICON_DIR"

echo "📱 Generating iPhone icons..."

# iPhone icons
sips -z 40 40 AppIcon.png --out "$ICON_DIR/icon-20@2x.png"
sips -z 60 60 AppIcon.png --out "$ICON_DIR/icon-20@3x.png"
sips -z 58 58 AppIcon.png --out "$ICON_DIR/icon-29@2x.png"
sips -z 87 87 AppIcon.png --out "$ICON_DIR/icon-29@3x.png"
sips -z 80 80 AppIcon.png --out "$ICON_DIR/icon-40@2x.png"
sips -z 120 120 AppIcon.png --out "$ICON_DIR/icon-40@3x.png"
sips -z 120 120 AppIcon.png --out "$ICON_DIR/icon-60@2x.png"
sips -z 180 180 AppIcon.png --out "$ICON_DIR/icon-60@3x.png"

echo "📱 Generating iPad icons..."

# iPad icons
sips -z 20 20 AppIcon.png --out "$ICON_DIR/icon-20.png"
sips -z 40 40 AppIcon.png --out "$ICON_DIR/icon-20@2x.png"
sips -z 29 29 AppIcon.png --out "$ICON_DIR/icon-29.png"
sips -z 58 58 AppIcon.png --out "$ICON_DIR/icon-29@2x.png"
sips -z 40 40 AppIcon.png --out "$ICON_DIR/icon-40.png"
sips -z 80 80 AppIcon.png --out "$ICON_DIR/icon-40@2x.png"
sips -z 76 76 AppIcon.png --out "$ICON_DIR/icon-76.png"
sips -z 152 152 AppIcon.png --out "$ICON_DIR/icon-76@2x.png"
sips -z 167 167 AppIcon.png --out "$ICON_DIR/icon-83.5@2x.png"

echo "📱 Generating App Store icon..."

# App Store icon (1024x1024)
sips -z 1024 1024 AppIcon.png --out "$ICON_DIR/icon-1024.png"

echo "✅ All iOS app icons generated successfully!"
echo ""
echo "📋 Generated icon files:"
ls -la "$ICON_DIR"/icon-*.png

echo ""
echo "🎯 Next steps:"
echo "1. Open Xcode project: open ios/App/App.xcworkspace"
echo "2. Build and run to verify icons appear correctly"
echo "3. Archive app for App Store submission"
