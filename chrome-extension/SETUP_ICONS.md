# Icon Setup Instructions

The extension requires three icon sizes. You can create simple placeholder icons or design proper ones.

## Quick Placeholder Icons

### Option 1: Using ImageMagick (if installed)

```zsh
cd icons

# Create red placeholder icons
convert -size 16x16 xc:red icon16.png
convert -size 48x48 xc:red icon48.png
convert -size 128x128 xc:red icon128.png
```

### Option 2: Using Online Tools

1. Visit https://www.favicon-generator.org/
2. Upload any image or create a simple colored square
3. Download the generated icons
4. Rename them to match the required sizes

### Option 3: Manual Creation

Use any image editor to create three PNG files:
- `icon16.png` - 16x16 pixels
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

### Option 4: Copy from another extension

You can temporarily copy icon files from this project or another Chrome extension's icon folder.

## Icon Design Suggestions

For a checkout detector extension, consider:
- Shopping cart icon
- Credit card icon
- Checkout/payment symbol
- Colors: Red for alerts, green for success, blue for neutral

## After Adding Icons

Once icons are in place:
1. Go to `chrome://extensions/`
2. Click the refresh icon on the Think twice extension card
3. The icons should now appear properly
