import { FIREBASE_ADMIN_CONFIG } from '@/constants'
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(FIREBASE_ADMIN_CONFIG),
    })
}

export const verifyFirebaseToken = async (token: string) => {
    return admin.auth().verifyIdToken(token)
}

export default admin
