import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

export const FirebaseAdminProvider = {
  provide: 'FIREBASE_ADMIN',
  useFactory: (configService: ConfigService) => {
    const projectId = configService.get<string>('PROJECT_ID');
    const clientEmail = configService.get<string>('CLIENT_EMAIL');
    const rawPrivateKey = configService.get<string>('PRIVATE_KEY');
    const privateKey = rawPrivateKey.replace(/\\n/g, '\n');

    // Перевірка, чи додаток вже ініціалізовано
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }

    // Повертаємо вже ініціалізований Firebase додаток
    return admin;
  },
  inject: [ConfigService],
};
