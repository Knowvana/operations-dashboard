# Quick Start Guide

Get Zen-Ops Monitor up and running in 5 minutes!

## 1. Install Dependencies (1 minute)

```bash
cd zen-ops-app
npm install
```

## 2. Configure Firebase (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Enable Firestore Database (test mode is fine for development)
4. Get your config: Project Settings → Web App → Copy config
5. Open `src/firebaseConfig.js` and paste your credentials:

```javascript
export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 3. Start Development Server (1 minute)

```bash
npm run dev
```

Your app opens at `http://localhost:5173` 🎉

## 4. Explore the Dashboard (1 minute)

- **Timeline View**: See tasks organized by hour with status indicators
- **Analytics View**: View statistics and task categories
- **Task Management**: Click any task to update status, time, and comments
- **Shift Management**: Click the ⚙️ icon to configure shifts and team

## Common Tasks

### Add a Task Type
Edit `src/services/firebaseService.js`:
```javascript
const types = ['critical', 'routine', 'admin', 'new-type'];
```

### Change Shift Times
Edit `src/App.jsx` - look for the `shifts` state:
```javascript
{ name: 'Morning Shift', start: '08:00', end: '16:00', ... }
```

### Customize Colors
Colors use Tailwind classes. Search for:
- `bg-indigo` = Primary blue
- `bg-emerald` = Success green
- `bg-rose` = Error/warning red

### Reset Demo Data
Settings → Reset & Regenerate Demo Data

## Deployment

Ready to go live? See `DEPLOYMENT.md` for:
- Firebase Hosting (recommended)
- Vercel
- Netlify
- Self-hosted options

## Need Help?

1. Check `README.md` for full documentation
2. Review `DEPLOYMENT.md` for deployment help
3. Check console (F12) for error messages
4. Verify Firebase credentials in `src/firebaseConfig.js`

## Next Steps

- [ ] Configure your Firestore database
- [ ] Update shift names and team members
- [ ] Customize task types for your use case
- [ ] Test task updates and real-time sync
- [ ] Deploy to production (see DEPLOYMENT.md)

---

**That's it!** You now have a fully functional operations dashboard. 🚀
