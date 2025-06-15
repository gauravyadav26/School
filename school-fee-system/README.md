# School Fee Management System

A web-based school fee management system that helps track student information and fee payments. The system is built using HTML, CSS, and JavaScript, with Firebase as the backend database.

## Features

- Add and manage student information
- Track fee payments including tuition, books, and dress charges
- View payment history for each student
- Search functionality for students
- Responsive design for all devices

## Setup Instructions

1. Create a Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database
   - Go to Project Settings > General
   - Scroll down to "Your apps" section
   - Click on the web icon (</>)
   - Register your app and copy the Firebase configuration object

2. Update Firebase configuration:
   - Open `app.js`
   - Replace the `firebaseConfig` object with your Firebase configuration

3. Deploy to Cloudflare Pages:
   - Create a GitHub repository and push your code
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Create a new project
   - Connect your GitHub repository
   - Set the build settings:
     - Build command: (leave empty)
     - Build output directory: `school-fee-system`
   - Click "Deploy site"

## Project Structure

```
school-fee-system/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── app.js             # JavaScript application logic
└── README.md          # This file
```

## Firebase Collections

The application uses two main collections in Firestore:

1. `students` - Stores student information
   - name
   - class
   - fatherName
   - createdAt

2. `payments` - Stores payment records
   - studentId
   - paymentDate
   - tuitionFee
   - booksFee
   - dressFee
   - totalAmount

## Security Rules

Make sure to set up appropriate security rules in your Firebase project. Here's a basic example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // For testing only
    }
  }
}
```

For production, implement proper authentication and security rules.

## Contributing

Feel free to submit issues and enhancement requests! 