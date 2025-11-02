import { FIREBASE_CONFIG } from '@/constants'
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Make sure Firebase is not initialized multiple times (important in Next.js)
const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp()

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app

