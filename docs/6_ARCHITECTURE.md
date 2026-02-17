# Architecture & Component Overview

This document describes the architecture and component relationships in Zen-Ops Monitor.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React App (Vite)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      App.jsx (Root)                      │  │
│  │  - State management                                      │  │
│  │  - View mode switching                                   │  │
│  │  - Firebase sync coordination                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│            ▼                      ▼                      ▼      │
│  ┌─────────────────┐  ┌──────────────────┐  ┌────────────────┐ │
│  │    Header       │  │  ShiftDashboard  │  │    Modals      │ │
│  │  - Branding     │  │  - Stats table    │  │ - TaskModal    │ │
│  │  - Shift info   │  │  - Progress bars  │  │ - ShiftManager │ │
│  └─────────────────┘  └──────────────────┘  └────────────────┘ │
│                              ▼                                   │
│  ┌─────────────────────────────────────────┐                   │
│  │         Main Content (View Toggle)      │                   │
│  ├─────────────────────────────────────────┤                   │
│  │                                         │                   │
│  │  ┌──────────────┐  ┌──────────────┐   │                   │
│  │  │TimelineView  │  │  ReportView  │   │                   │
│  │  │- Hour grid   │  │  - Table     │   │                   │
│  │  │- Tasks cards │  │  - Analytics │   │                   │
│  │  └──────────────┘  └──────────────┘   │                   │
│  ```                                         │                   │
│  └─────────────────────────────────────────┘                   │
│                      ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Firebase Service Layer                       │  │
│  │  - Auth (Anonymous)                                      │  │
│  │  - Firestore CRUD operations                             │  │
│  │  - Real-time subscriptions                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                      ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Firebase/Firestore                           │  │
│  │  - Cloud Database                                        │  │
│  │  - Real-time sync                                        │  │
│  │  - Authentication                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
├── Header
│   └── (Brand, Shift Info, Settings Button)
├── ShiftDashboard
│   ├── Monitoring Stats Table
│   │   └── ProgressBar (reused)
│   └── Task Stats Table
│       └── ProgressBar (reused)
├── TimelineView (conditional)
│   ├── Timeline Spine (visual)
│   ├── Current Time Indicator
│   └── Hour Sections
│       └── Task Cards (multiple per hour)
├── ReportView (conditional)
│   └── Tasks Table
├── TaskModal (conditional)
│   └── Task Edit Form
└── ShiftManager (conditional)
    └── Shift CRUD Interface
```

## State Management

### App.jsx State

```javascript
// View state
const [viewMode, setViewMode] = useState('timeline'); // 'timeline' | 'report'
const [isManageShiftsOpen, setIsManageShiftsOpen] = useState(false);

// Data state
const [user, setUser] = useState(null);
const [tasks, setTasks] = useState([]);
const [shifts, setShifts] = useState([...]);

// UI state
const [currentTime, setCurrentTime] = useState(new Date());
const [selectedTask, setSelectedTask] = useState(null);
const [isLoading, setIsLoading] = useState(true);
```

### Computed State (useMemo)

```javascript
// Derived from tasks + currentTime
const dayData = useMemo(() => calculateStats(tasks, currentTime), [...]);
const shiftData = useMemo(() => calculateStats(shiftTasks, currentTime), [...]);
const currentShift = useMemo(() => findActiveShift([...]), [...]);
```

## Data Flow

### 1. **Initialization Flow**
```
App mounts
  ↓
useEffect: Initialize Firebase
  ↓
useEffect: Setup Auth listener
  ↓
Auth state changes → setUser
  ↓
useEffect: Subscribe to tasks
  ↓
onSnapshot: Tasks update → setTasks
  ↓
If tasks < 20: generateFullSchedule()
  ↓
Component renders with data
```

### 2. **Task Update Flow**
```
User clicks task
  ↓
setSelectedTask(task)
  ↓
TaskModal renders
  ↓
User updates status/time/comments
  ↓
handleUpdateTask(taskId, updates)
  ↓
updateTask() (firebaseService)
  ↓
updateDoc(taskRef, updates)
  ↓
Firestore updates
  ↓
onSnapshot triggers (subscription)
  ↓
setTasks([...updated tasks])
  ↓
Component re-renders
  ↓
All users see update
```

### 3. **Shift Management Flow**
```
User clicks settings icon
  ↓
setIsManageShiftsOpen(true)
  ↓
ShiftManager modal renders with shifts
  ↓
User edits shifts locally
  ↓
User clicks "Apply Configuration"
  ↓
setShifts(updatedShifts)
  ↓
currentShift computed value updates
  ↓
Dashboard recalculates with new shift
  ↓
Component re-renders
```

## Key Utilities

### utils.js

```javascript
formatTime(date)                    // Date to HH:mm string
getTimelineHours()                  // Array of 24 hours
isTimeInShift(timeStr, start, end)  // Check if time in shift range
getShiftActivityStatus(task, time)  // Get task status color/label
calculateStats(taskList, currentTime)  // Compute dashboard stats
```

## Firebase Service Layer

### firebaseService.js

**Initialization**
```javascript
initializeFirebase()      // Setup Firebase app, auth, db
signInUser(customToken?)  // Authenticate user
```

**Real-time (Subscription)**
```javascript
subscribeToTasks(callback) // onSnapshot listener
onUserStateChanged(callback) // Auth state listener
```

**CRUD Operations**
```javascript
updateTask(taskId, updates)  // Update existing task
generateFullSchedule()       // Batch create demo tasks
resetAllTasks()              // Delete all tasks
```

## Prop Drilling (Data Flow)

```javascript
// App.jsx passes down:
<Header 
  complianceStatus={...}     // Computed from shiftData
  timeRemaining={...}        // Computed from currentTime
  shiftDetails={currentShift}  // Computed from shifts + currentTime
  onOpenSettings={handler}   // Function
/>

<ShiftDashboard
  dayData={dayData}          // Computed stats for all tasks
  shiftData={shiftData}      // Computed stats for shift tasks
  shiftDetails={currentShift}  // Computed from shifts + currentTime
/>

<TimelineView
  tasks={tasks}              // From Firestore subscription
  shifts={shifts}            // From local state
  currentTime={currentTime}   // Timer state
  onSelectTask={setSelectedTask}  // Callback to App
/>
```

## Component Responsibilities

### App.jsx
- Global state management
- Firebase initialization and auth
- Data subscriptions
- View switching logic
- Modal coordination
- Time ticker

### Header.jsx
- Display branding
- Show current shift info
- Show shift lead and team
- Settings button
- Responsive layout

### ShiftDashboard.jsx
- Display monitoring statistics
- Display task statistics by category
- Toggle between shift/day views
- Progress bar visualization

### TimelineView.jsx
- Render 24-hour timeline
- Display tasks grouped by hour
- Show shift handovers
- Task card details
- Handle task selection

### ReportView.jsx
- Tabular task display
- Sortable columns
- Status badges
- Variance indicators

### TaskModal.jsx
- Status selection (4 options)
- Time input fields
- Comments textarea
- Update submission
- Form validation

### ShiftManager.jsx
- List existing shifts
- Add new shifts
- Edit shift details
- Remove shifts
- Manage resources
- Reset demo data

### ProgressBar.jsx
- Visual percentage bar
- Customizable colors
- Smooth animation

## Real-time Sync Strategy

### Firestore Listeners
- Single subscription at App level
- All task changes trigger full re-render
- Component memoization prevents unnecessary renders
- Efficient state updates with setTasks

### Performance Optimizations
- useMemo for computed stats
- useMemo for currentShift
- Scroll-into-view only when needed
- Lazy modal rendering

## File Organization

```
src/
├── components/           # Reusable React components
│   ├── Header.jsx
│   ├── ShiftDashboard.jsx
│   ├── TimelineView.jsx
│   ├── ReportView.jsx
│   ├── TaskModal.jsx
│   ├── ShiftManager.jsx
│   └── ProgressBar.jsx
├── services/             # Business logic & external services
│   └── firebaseService.js
├── App.jsx               # Root component
├── main.jsx              # Entry point
├── utils.js              # Helper functions
├── firebaseConfig.js     # Firebase credentials
└── index.css             # Global styles
```

## Key Design Decisions

1. **Single Source of Truth**: Firestore is the source of truth for tasks
2. **Subscription Model**: Real-time updates via onSnapshot
3. **Local Shifts**: Shifts are managed in component state (not Firestore)
4. **Computed Values**: Stats calculated on-demand, not stored
5. **Component Composition**: Small, focused components
6. **Prop Drilling**: Used intentionally for simplicity (not redux)
7. **CSS Framework**: Tailwind for rapid development

## Scaling Considerations

For production, consider:

1. **State Management**
   - Move to Redux/Context for complex state
   - Implement normalization for large datasets

2. **Database**
   - Implementation of pagination for large task lists
   - Add proper indexes for performance
   - Archive old tasks to separate collection

3. **Authentication**
   - Implement user roles (admin, lead, member)
   - Use custom claims for authorization
   - Add proper Firestore security rules

4. **Real-time Limits**
   - Implement query filters to reduce listener scope
   - Consider eventual consistency trade-offs
   - Monitor Firestore read counts

5. **UI/UX**
   - Add task search and filtering
   - Implement task templates
   - Add notifications/alerts
   - Dark mode support

## Testing Strategy

Would involve:
- Unit tests for utils.js functions
- Component tests for modal forms
- Integration tests for Firebase operations
- E2E tests for user workflows
- Performance tests for large datasets
