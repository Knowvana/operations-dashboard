# Deployment Guide for Zen-Ops Monitor

This guide covers deployment options for the Zen-Ops Monitor application.

## Firebase Hosting (Recommended)

Firebase Hosting is ideal because your app already uses Firebase services.

### Prerequisites
- Firebase project set up
- Node.js and npm installed
- Firebase CLI: `npm install -g firebase-tools`

### Step-by-Step Deployment

1. **Initialize Firebase in your project**:
```bash
firebase init hosting
```

When prompted:
- Select your Firebase project
- Choose `dist` as the public directory
- Configure as single-page app: Yes
- Don't overwrite `dist/index.html` if asked

2. **Build the application**:
```bash
npm run build
```

3. **Deploy to Firebase Hosting**:
```bash
firebase deploy
```

Your app is now live! Firebase will provide a URL like: `https://your-project.web.app`

4. **View deployment**:
```bash
firebase open hosting:site
```

### Continuous Deployment

Set up auto-deployment with GitHub:

1. In Firebase Console → Hosting → Connect repository
2. Select your GitHub repo
3. Choose branch to deploy (e.g., `main`)
4. Click "Deploy"

Now, every push to your selected branch automatically deploys!

---

## Vercel Deployment

Vercel offers excellent performance and integrates well with Git.

### Step-by-Step

1. **Push your code to GitHub**

2. **Import project in Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → "Import Git Repository"
   - Select your repository
   - Choose framework: Vite

3. **Configure environment variables**:
   - Add your Firebase config as environment variables:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_PROJECT_ID`
     - etc.

4. **Deploy**:
   - Vercel automatically builds and deploys
   - Your app is live at: `https://your-project.vercel.app`

### Auto-Deployment

Every push to `main` (or your chosen branch) automatically deploys.

---

## Netlify Deployment

### Step-by-Step

1. **Connect your GitHub repository**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose GitHub and authorize
   - Select your repository

2. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set environment variables**:
   - In Netlify dashboard → Site settings → Build & deploy → Environment
   - Add your Firebase configuration variables

4. **Deploy**:
   - Click "Deploy site"
   - Your app is live at a Netlify URL

### Auto-Deployment

Every git push triggers automatic deployment.

---

## Self-Hosted Deployment

### Using Docker

1. **Create Dockerfile**:
```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

2. **Build and run**:
```bash
docker build -t zen-ops-monitor .
docker run -p 3000:3000 zen-ops-monitor
```

### Using Linux Server

1. **Build the application**:
```bash
npm run build
```

2. **Copy `dist` folder to server**:
```bash
scp -r dist user@your-server.com:/var/www/zen-ops/
```

3. **Setup Nginx** (`/etc/nginx/sites-available/zen-ops`):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/zen-ops/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

4. **Enable site and restart Nginx**:
```bash
sudo ln -s /etc/nginx/sites-available/zen-ops /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Setup SSL** (using Let's Encrypt):
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Environment Variables for Deployment

### Firebase Configuration
You need to configure these environment variables in your hosting platform:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

Update `src/firebaseConfig.js` to use environment variables:

```javascript
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
```

---

## Performance Optimization

### Before Deployment

1. **Check bundle size**:
```bash
npm run build
# Check the output for bundle size
```

2. **Test in production mode**:
```bash
npm run build
npm run preview
# Test at http://localhost:4173
```

### Post-Deployment

1. **Enable GZIP compression** in your server
2. **Setup CDN** for static assets
3. **Enable browser caching** headers
4. **Monitor performance** using:
   - Firebase Analytics
   - Google Lighthouse
   - Web Vitals

---

## Firestore Security Rules for Production

**Warning**: The demo rules allow all reads/writes. Update for production:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/tasks/{taskId} {
      // Allow only authenticated users
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (request.resource.data.updatedBy == request.auth.uid ||
         request.auth.token.isAdmin == true);
    }
  }
}
```

---

## Monitoring & Logging

### Firebase Console
- Monitor errors: **Crashlytics**
- View usage: **Analytics**
- Check database: **Firestore**
- View logs: **Cloud Logging**

### Third-party Tools
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **Google Analytics**: User behavior

---

## Rollback Instructions

### Firebase Hosting
```bash
firebase hosting:channel:list
firebase hosting:channel:deploy previous-version
```

### Vercel
- Dashboard → Deployments → Select previous version → Click "• • •" → Promote to Production

### Netlify
- Dashboard → Deploys → Select previous deploy → "Restore"

---

## Troubleshooting

### Blank page after deployment?
- Check console for errors
- Verify environment variables are set
- Clear browser cache
- Check that `dist/index.html` exists

### Firebase errors?
- Verify API credentials
- Check Firestore security rules
- Ensure Firestore database is created

### Slow performance?
- Check bundle size: `npm run build` → check output
- Verify images are optimized
- Check Firestore query efficiency

---

## Questions?

1. Check the main README.md
2. Review Firebase documentation
3. Check your platform's documentation (Vercel, Netlify, etc.)
