import { initializeApp, type FirebaseApp } from 'firebase/app'
import { browserLocalPersistence, getAuth, setPersistence, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

function readConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim() ?? '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() ?? '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? '',
  }
}

export const isFirebaseConfigured = (() => {
  const config = readConfig()
  return Boolean(config.apiKey && config.projectId && config.appId)
})()

let firebaseApp: FirebaseApp | undefined
let auth: Auth | undefined
let db: Firestore | undefined

if (isFirebaseConfigured) {
  const config = readConfig()
  firebaseApp = initializeApp(config)
  auth = getAuth(firebaseApp)
  void setPersistence(auth, browserLocalPersistence)
  db = getFirestore(firebaseApp)
}

export { firebaseApp, auth, db }

export function requireAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Authentication is not configured. Set VITE_FIREBASE_* in .env')
  }
  return auth
}

export function requireDb(): Firestore {
  if (!db) {
    throw new Error('Firestore is not configured. Set VITE_FIREBASE_* in .env')
  }
  return db
}
