# GitHub Pages Deployment Guide

## ✅ Fixed Issues

1. ✅ Added base path configuration in `vite.config.js`
2. ✅ Updated package.json with deployment script

## 🚀 Deployment Steps

### Step 1: Install gh-pages Package

```bash
cd frontend
npm install --save-dev gh-pages
```

### Step 2: Build and Deploy

Run the deployment command:

```bash
npm run deploy
```

This will:
1. Build your React app for production
2. Deploy it to the `gh-pages` branch
3. Make it available at `https://pargat-apps.github.io/msucre-frontend/`

### Step 3: Configure GitHub Pages

1. Go to your GitHub repository: `https://github.com/pargat-apps/msucre-frontend`
2. Click **Settings** → **Pages**
3. Under "Source", select **"Deploy from a branch"**
4. Select branch: **`gh-pages`**
5. Select folder: **`/ (root)`**
6. Click **Save**

### Step 4: Wait for Deployment

- GitHub Pages may take 1-2 minutes to update
- Your site will be available at: `https://pargat-apps.github.io/msucre-frontend/`

## 🔧 Configuration Details

### Base Path

The `base: '/msucre-frontend/'` in `vite.config.js` ensures all assets are loaded from the correct subdirectory.

### API Configuration

If your backend is hosted elsewhere, update the API URL in your environment variables or directly in `src/utils/api.js`:

```javascript
baseURL: import.meta.env.VITE_API_URL || 'https://your-backend-api.com/api'
```

For production, create a `.env.production` file:

```env
VITE_API_URL=https://your-backend-api.com
```

## 🐛 Troubleshooting

### 404 Errors on Assets

If you still see 404 errors:
1. Check that `base: '/msucre-frontend/'` is set in `vite.config.js`
2. Rebuild: `npm run build`
3. Redeploy: `npm run deploy`

### Routes Not Working

If direct URL access to routes (like `/products/123`) gives 404:
1. Create a `404.html` file in the `public` folder that redirects to `index.html`
2. Or use HashRouter instead of BrowserRouter in `App.jsx`

### Build Fails

If build fails:
```bash
# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

## 📝 Manual Deployment

If you prefer manual deployment:

```bash
# Build
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

## 🔄 Updating Deployment

Every time you make changes:

1. Commit your changes:
   ```bash
   git add .
   git commit -m "Update: your changes"
   git push origin main
   ```

2. Deploy:
   ```bash
   npm run deploy
   ```

## 🌐 Custom Domain (Optional)

If you want to use a custom domain:

1. Add a `CNAME` file in the `public` folder with your domain:
   ```
   yourdomain.com
   ```

2. Update DNS settings at your domain provider
3. Configure custom domain in GitHub Pages settings

## ⚠️ Important Notes

- **Base Path**: The base path must match your repository name exactly
- **API Backend**: Make sure your backend API is accessible from the internet (not localhost)
- **Environment Variables**: Use `.env.production` for production-specific variables
- **HTTPS**: GitHub Pages automatically provides HTTPS

## 🔗 Useful Links

- GitHub Pages: https://pages.github.com/
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- gh-pages package: https://github.com/tschaub/gh-pages

