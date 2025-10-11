/*import { firebaseAdminConfig } from '@/constants'
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig),
    })
}

export const verifyFirebaseToken = async (token: string) => {
    return admin.auth().verifyIdToken(token)
}

export default admin
*/