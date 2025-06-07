# Use Bun as the base image
FROM oven/bun:1-alpine

# Set working directory
WORKDIR /app

# Expose the port that vinxi dev runs on (typically 3000)
EXPOSE 3000

# Default command (can be overridden by docker-compose)
CMD ["bun", "run", "dev"] 