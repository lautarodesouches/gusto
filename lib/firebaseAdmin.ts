import { firebaseAdminConfig } from '@/constants'
import * as admin from 'firebase-admin'

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig),
    })
}

export default admin