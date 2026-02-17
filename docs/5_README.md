# Zen-Ops Monitor - Operations Dashboard

A modern, real-time operations monitoring dashboard built with React, Tailwind CSS, Lucide React icons, and Firebase Firestore.

## Features

- **Real-time Task Management**: Monitor and update operational tasks in real-time
- **Shift Management**: Configure and manage multiple work shifts with team members
- **Timeline Visualization**: Beautiful vertical timeline showing tasks organized by hour
- **Analytics Dashboard**: Comprehensive statistics on task completion and compliance
- **Task Status Tracking**: Track task status (pending, in-progress, completed, aborted)
- **Compliance Monitoring**: Monitor shift compliance and task completion rates
- **Role-based Access**: Support for shift leads and team members
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **Real-time Sync**: Instant updates across all connected devices via Firestore

## Tech Stack

- **Frontend Framework**: React 18
- **Styling**: Tailwind CSS 3
- **Icons**: Lucide React
- **Backend**: Firebase with Firestore
- **Build Tool**: Vite
- **Authentication**: Firebase Anonymous Auth

## Prerequisites

- Node.js 16+ and npm
- Firebase Project (create at [firebase.google.com](https://firebase.google.com))

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd zen-ops-app
npm install
```

### 2. Configure Firebase

1. Create a Firebase project at [https://firebase.google.com](https://firebase.google.com)
2. Enable Firestore Database (test mode or production mode with appropriate rules)
3. Copy your Firebase configuration credentials
4. Update `src/firebaseConfig.js` with your credentials:

```javascript
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

### 3. Create Firestore Indexes (Optional)

The app automatically creates Firestore documents. Firestore will suggest composite indexes if needed - follow the links in the error messages to create them.

### 4. Run Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

Production-ready files will be in the `dist/` folder.

## Project Structure

```
zen-ops-app/
├── src/
│   ├── components/
│   │   ├── Header.jsx              # App header with shift info
│   │   ├── ShiftDashboard.jsx       # Statistics and monitoring dashboard
│   │   ├── TimelineView.jsx         # Timeline visualization of tasks
│   │   ├── ReportView.jsx           # Table/analytics view
│   │   ├── TaskModal.jsx            # Task update form
│   │   ├── ShiftManager.jsx         # Shift configuration modal
│   │   └── ProgressBar.jsx          # Reusable progress bar
│   ├── services/
│   │   └── firebaseService.js       # Firebase/Firestore integration
│   ├── App.jsx                      # Main app component
│   ├── main.jsx                     # Entry point
│   ├── utils.js                     # Utility functions
│   ├── index.css                    # Tailwind directives
│   └── firebaseConfig.js            # Firebase configuration
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Usage

### Dashboard Views

**Timeline View**:
- Displays all tasks organized by hour of the day
- Shows task status with visual indicators
- Shows shift handovers at hour boundaries
- Click on any task to update it

**Report/Analytics View**:
- Tabular view of all tasks
- Shows task completion status and variances
- Sortable and filterable data

### Shift Management

1. Click the settings (gear) icon in the top-right header
2. Manage shifts: edit name, times, and team members
3. Add or delete shifts as needed
4. Click "Apply Configuration" to save changes

### Task Updates

1. Click on any task in the timeline
2. Update task status, actual times, and comments
3. Changes sync to Firestore automatically
4. All users see updates in real-time

### Demo Data

The app includes demo data generation. When first run, it:
- Creates 3 sample shifts
- Generates 50+ tasks across 24 hours
- Populates realistic past statuses for demonstration

To reset demo data:
1. Open shift management
2. Click "Reset & Regenerate Demo Data"
3. Wait for data to regenerate

## Firestore Database Schema

```
artifacts/
  {appId}/
    public/
      data/
        tasks/
          {taskId}: {
            title: string
            type: "critical" | "routine" | "admin"
            plannedStart: "HH:mm"
            plannedEnd: "HH:mm"
            actualStart: "HH:mm" (optional)
            actualEnd: "HH:mm" (optional)
            status: "pending" | "in_progress" | "completed" | "aborted"
            comments: string
            updatedBy: string (user name)
            updatedAt: timestamp
            createdAt: timestamp
          }
```

## Firestore Security Rules

For development/testing:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/public/data/tasks/{taskId} {
      allow read, write: if true;
    }
  }
}
```

For production, implement proper authentication and authorization checks.

## Deployment Options

### Vercel
```bash
npm run build
# Deploy to Vercel
```

### Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

### Netlify
Connect your GitHub repository to Netlify and enable auto-deployment.

## Performance Optimization

- Lazy loading of components
- Memoized calculations for stats
- Real-time Firestore subscriptions with proper cleanup
- Efficient filtering and sorting
- CSS animations optimized for 60fps

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Android Chrome)

## Customization

### Change Shift Times
Edit `shifts` state in `App.jsx`:
```javascript
const [shifts, setShifts] = useState([
  { 
    id: 'shift-a', 
    name: 'Your Shift', 
    start: '08:00', 
    end: '16:00', 
    lead: 'Your Name', 
    resources: ['Team Member 1', 'Team Member 2'] 
  },
  // ...
]);
```

### Add Custom Task Types
Update the `types` array in `firebaseService.js`:
```javascript
const types = ['critical', 'routine', 'admin', 'your-type'];
```

### Customize Colors
Edit Tailwind classes in component files. The app uses:
- Indigo for primary actions
- Emerald for success states
- Rose for error/warning states
- Slate for neutral elements

## Troubleshooting

**Tasks not appearing?**
- Check Firebase configuration in `src/firebaseConfig.js`
- Ensure Firestore database is enabled
- Check browser console for errors

**Real-time updates not syncing?**
- Verify Firestore security rules allow read/write
- Check network connection
- Look for Firebase errors in console

**Styling issues?**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Rebuild Tailwind: `npm run dev`

## Contributing

To contribute improvements:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - feel free to use in personal or commercial projects

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Firebase documentation: https://firebase.google.com/docs
3. Check Tailwind CSS docs: https://tailwindcss.com/docs
4. Review component files for implementation details

## Future Enhancements

- User authentication with roles
- Task assignment to team members
- Real-time notifications
- Customizable shift templates
- Export reports to PDF/CSV
- Dark mode support
- Automated task scheduling
- Integration with external APIs
- Advanced filtering and search
- Task priority levels
