# Vercel Deployment Guide for FixAndFit Platform

## Overview
This guide covers deploying the FixAndFit healthcare platform to Vercel, which includes both the Next.js frontend and Node.js backend.

## Prerequisites
- GitHub repository: https://github.com/ctoriola/fixandfit
- Vercel account (free tier available)
- MongoDB Atlas database (cloud MongoDB)

## Deployment Steps

### 1. Frontend Deployment (Next.js)

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub
   - Click "New Project" and import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Environment Variables:**
   Add these environment variables in Vercel dashboard:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
   ```

3. **Build Settings:**
   - Framework Preset: Next.js
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `.next`

### 2. Backend Deployment (Node.js API)

1. **Create Separate Vercel Project:**
   - Import the same GitHub repository
   - Select the `backend` folder as the root directory

2. **Configure Environment Variables:**
   Add these in Vercel dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fixandfit
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   NODE_ENV=production
   ```

3. **Build Settings:**
   - Framework Preset: Other
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Output Directory: `.`

### 3. Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account:**
   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a free cluster

2. **Configure Database:**
   - Create database user with read/write permissions
   - Whitelist Vercel IP addresses (or use 0.0.0.0/0 for all IPs)
   - Get connection string and update `MONGODB_URI`

3. **Create Admin User:**
   - After deployment, run the admin creation script:
   ```bash
   # This will be available as an API endpoint
   POST /api/auth/create-admin
   ```

### 4. Update Frontend API URL

After backend deployment, update the frontend environment variable:
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app
```

### 5. Custom Domain (Optional)

1. **Add Custom Domain:**
   - In Vercel dashboard, go to project settings
   - Add your custom domain
   - Update DNS records as instructed

2. **Update CORS Settings:**
   - Update backend CORS configuration to include your custom domain

## Environment Variables Reference

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.vercel.app
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fixandfit
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d
NODE_ENV=production
PORT=3001
```

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Backend API responds to health checks
- [ ] Database connection established
- [ ] Authentication system works
- [ ] Admin user created
- [ ] All features tested in production

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure backend CORS is configured for your frontend domain
   - Check `NEXT_PUBLIC_API_URL` is correct

2. **Database Connection:**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist includes Vercel IPs

3. **Environment Variables:**
   - Ensure all required variables are set in Vercel dashboard
   - Variables starting with `NEXT_PUBLIC_` are exposed to browser

4. **Build Failures:**
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json

## Support

For deployment issues:
- Check Vercel documentation: https://vercel.com/docs
- MongoDB Atlas docs: https://docs.atlas.mongodb.com/
- GitHub repository: https://github.com/ctoriola/fixandfit
