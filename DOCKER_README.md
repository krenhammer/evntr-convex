# Docker Development Setup

Simple Docker Compose setup to run the application with Cloudflare tunnel support.

## Prerequisites

1. Docker and Docker Compose installed
2. Cloudflare tunnel token (optional, for public access)

## Usage

**Single command to run everything:**

```bash
npm run docker:dev
```

**Run with a specific environment:**

```bash
./docker-run.sh cf-dev     # Uses .env.cf-dev
./docker-run.sh local      # Uses .env.local  
./docker-run.sh production # Uses .env.production
```

This will:
- Automatically detect your user/group IDs for proper file permissions
- Use the specified environment file (defaults to cf-dev)
- Build and start the application container
- Start the Cloudflare tunnel (if token provided)
- Run in interactive mode with live logs
- Auto-cleanup containers when you stop (Ctrl+C)

## Configuration

### Environment Files

The container will automatically use the appropriate `.env.[mode]` file based on the mode you specify:

- `.env.cf-dev` - Container development with Cloudflare tunnel (default)
- `.env.local` - Local development 
- `.env.production` - Production-like environment
- `.env` - Base environment (always loaded)

### Cloudflare Tunnel

Set your Cloudflare tunnel token as an environment variable:

```bash
export CLOUDFLARE_TUNNEL_TOKEN=your_token_here
npm run docker:dev
```

Or add it to your `.env.cf-dev` file:
```
CLOUDFLARE_TUNNEL_TOKEN=your_token_here
```

## Accessing the Application

- **Local access**: http://localhost:3000
- **Public access**: Through your Cloudflare tunnel URL (if configured)

## Architecture

The setup includes three services:

1. **app**: Your Vite development server (internal port 3000)
2. **proxy**: Nginx proxy that rewrites Host headers (exposed on port 3000)
3. **cloudflared**: Cloudflare tunnel that routes traffic to the proxy

This architecture solves Vite's host restriction issues by ensuring all requests appear to come from `localhost:3000`.

## Features

- **Zero setup**: Automatically detects user/group IDs for proper file permissions
- **Hot reload**: Full directory mounting means code changes are reflected immediately  
- **Interactive mode**: Live logs and easy stop with Ctrl+C
- **Auto cleanup**: Containers are removed when you stop the process
- **Cloudflare tunnel**: Optional public access through Cloudflare tunnel
- **Host header proxy**: Nginx proxy rewrites Host headers to work with Vite's host restrictions

## Stopping

Simply press `Ctrl+C` in the terminal where the command is running. The containers will be automatically cleaned up. 