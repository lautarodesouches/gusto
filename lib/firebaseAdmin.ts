import { FIREBASE_ADMIN_CONFIG } from '@/constants'
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
    console.log(process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'))
    admin.initializeApp({
        credential: admin.credential.cert(FIREBASE_ADMIN_CONFIG),
    })
}

export const verifyFirebaseToken = async (token: string) => {
    return admin.auth().verifyIdToken(token)
}

export default admin
