# Wipro HAM Pro Frontend — Build & Deployment Guide

## Environment Files

- **Development (`.env.development`):** Points to the local/dev backend API (`http://172.20.204.134:5187`).
- **Production (`.env.production`):** Uses relative paths (`/api` and `/`) so the built bundle works on any host/port when served from `wwwroot/`.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Copy the contents of `dist/` into `WIPRO Server/wwwroot/` before publishing the backend.

## Notes

- Node.js is **not** required on the target server — IIS/Kestrel serves the compiled static assets directly from `wwwroot/`.
- Always run `npm run build` after updating `.env.production` or frontend source files.

