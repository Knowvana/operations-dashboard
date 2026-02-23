# Setting Up Admin User

## Method 1: Using Firebase Console (Recommended)

1. Open Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to **Firestore Database**
4. Click **"Start collection"** or navigate to existing collections
5. Create a new collection called `systemAdmins`
6. Add a document with your user ID as the document ID:
   - Document ID: `{your-user-id}` (get this from Firebase Auth)
   - Fields:
     - `email`: your-email@example.com (string)
     - `displayName`: Your Name (string)
     - `createdAt`: (timestamp) - use server timestamp

## Method 2: Using Browser Console

1. Open your app in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run this code:

```javascript
// Get current user ID
const user = firebase.auth().currentUser;
console.log('User ID:', user.uid);
console.log('Email:', user.email);

// Add to systemAdmins collection
firebase.firestore().collection('systemAdmins').doc(user.uid).set({
  email: user.email,
  displayName: user.displayName || user.email,
  createdAt: firebase.firestore.FieldValue.serverTimestamp()
}).then(() => {
  console.log('Admin user created successfully!');
  // Refresh the page to see Admin menu
  window.location.reload();
}).catch(error => {
  console.error('Error:', error);
});
```

## Method 3: Using Admin Setup Helper (Easiest)

I'll create a temporary admin setup button for you.
