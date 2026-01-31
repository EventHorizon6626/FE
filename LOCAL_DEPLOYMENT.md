# Event Horizon - Local Deployment Guide

## Quick Start Scripts

### Start Development Mode
```bash
./start-dev.sh
```
Or using npm:
```bash
npm run local:deploy
```
- Runs on `http://localhost:3000`
- Hot reload enabled
- Uses development environment

### Start Production Mode (Docker)
```bash
./start-prod.sh
```
Or using npm:
```bash
npm run prod:deploy
```
- Runs on `http://localhost:80`
- Production optimized build
- Served with Nginx

### Stop All Instances
```bash
./stop-all.sh
```
- Stops both dev server and Docker containers
- Cleans up ports 3000 and 80

## Available NPM Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Build production bundle |
| `npm run stop` | Stop development server |
| `npm run local:deploy` | Install deps and start dev mode |
| `npm run docker:build` | Build Docker image |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:restart` | Restart Docker containers |
| `npm run docker:logs` | View Docker logs |
| `npm run prod:deploy` | Full production deployment |

## Docker Management

### View logs
```bash
npm run docker:logs
```

### Restart containers
```bash
npm run docker:restart
```

### Stop containers
```bash
npm run docker:down
```

## Environment Variables

Make sure `.env.local` is configured with your backend API URL:
```
REACT_APP_BE_API_URL=http://localhost:4000
```

## Ports

- Development: `3000`
- Production (Docker): `80`

## Troubleshooting

### Port already in use
If you get port conflicts, run the stop script:
```bash
./stop-all.sh
```

### Docker network errors
The production script will automatically create the `eventhorizon-network` if it doesn't exist.

### Permission errors on port 80
On some systems, port 80 may require sudo:
```bash
sudo docker-compose up -d
```
