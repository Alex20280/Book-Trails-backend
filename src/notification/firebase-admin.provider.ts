import * as admin from 'firebase-admin';

import * as dotenv from 'dotenv';
dotenv.config();

export const FirebaseAdminProvider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: () => {
    const projectId = process.env.PROJECT_ID;

    const clientEmail = process.env.CLIENT_EMAIL;
    const rawPrivateKey = process.env.PRIVATE_KEY;
    const privateKey = rawPrivateKey ? rawPrivateKey.replace(/\\n/g, '\n') : undefined;

    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    return admin;
  },
};
