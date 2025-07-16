# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Tricksy Project - Deployment Guide

## Frontend (Vercel)

1. **Set Environment Variables**
   - In Vercel dashboard, add:
     - `VITE_API_URL=https://your-backend-url.onrender.com/api`

2. **Build & Deploy**
   - Vercel will auto-detect Vite and use `npm run build`.
   - Output directory: `dist`

## Backend (Render)

1. **Set Environment Variables**
   - In Render dashboard, add:
     - `PORT=4002`
     - `MONGODB_URI=your-mongodb-uri`
     - `CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name`
     - `CLOUDINARY_API_KEY=your-cloudinary-api-key`
     - `CLOUDINARY_API_SECRET=your-cloudinary-api-secret`
     - `FRONTEND_URL=https://your-frontend-url.vercel.app`

2. **Start Command**
   - `npm start`

3. **Build Command**
   - `npm install`

## Notes
- Ensure CORS and API URLs are set correctly for production.
- For file uploads, use Cloudinary in production.
- Do not commit your real `.env` files, only `.env.example`.
