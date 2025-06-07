#!/bin/bash

# Get current user and group IDs
export USER_ID=$(id -u)
export GROUP_ID=$(id -g)

# Set environment mode (default to cf-dev, can be overridden)
export VITE_MODE=${1:-cf-dev}

echo "Running with USER_ID=${USER_ID}, GROUP_ID=${GROUP_ID}, and VITE_MODE=${VITE_MODE}"
echo "Available .env files:"
ls -la .env* 2>/dev/null || echo "No .env files found"

# Function to cleanup Convex site URL on exit
cleanup_convex() {
    echo "Cleaning up Convex configuration..."
    if [ ! -z "$ORIGINAL_SITE_URL" ]; then
        echo "Restoring original Convex site URL: $ORIGINAL_SITE_URL"
        npx convex env set SITE_URL "$ORIGINAL_SITE_URL" 2>/dev/null || echo "Failed to restore original site URL"
    fi
}

# Set trap to cleanup on script exit
trap cleanup_convex EXIT INT TERM

# Get the Convex URL from the cf-dev environment
CF_DEV_CONVEX_URL=$(grep "SITE_URL" .env.cf-dev 2>/dev/null | cut -d'=' -f2)

if [ ! -z "$CF_DEV_CONVEX_URL" ]; then
    echo "Found cf-dev Convex URL: $CF_DEV_CONVEX_URL"
    

    # Get current Convex site URL for restoration later
    ORIGINAL_SITE_URL=$(npx convex env get SITE_URL 2>/dev/null || echo "")
    export ORIGINAL_SITE_URL
    
    if [ ! -z "$ORIGINAL_SITE_URL" ]; then
        echo "Backing up original Convex site URL: $ORIGINAL_SITE_URL"
    fi
    
    # Set Convex site URL to cf-dev URL
    echo "Setting Convex site URL to: $CF_DEV_CONVEX_URL"
    npx convex env set SITE_URL "$CF_DEV_CONVEX_URL" || echo "Warning: Failed to set Convex site URL"
else
    echo "Warning: Could not find SITE_URL in .env.cf-dev"
fi

# Run docker-compose with auto-cleanup and interactive mode
exec docker-compose up --build --remove-orphans --abort-on-container-exit 