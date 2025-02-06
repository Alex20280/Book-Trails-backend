import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}
  private logger = new Logger('EmailService');

  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: this.configService.get<string>('GOOGLE_EMAIL'),
      pass: this.configService.get<string>('GOOGLE_PASSWORD'),
    },
  });

  async sendEmail(email: string, token: string, isPasswordReset: boolean) {
    const subject = isPasswordReset
      ? 'Password Reset Request'
      : 'Email Verification';
    const html = isPasswordReset
      ? `
          <p>Hello,</p>
          <p>We received a request to reset your password. Please use the following confirmation code to proceed:</p>
          <p style="text-align: center; font-weight: bold; font-size: 30px;">${token}</p>
          <p>If you did not request a password reset, please ignore this email.</p>
          <p>Thank you!</p>
        `
      : `
          <p>Hello,</p>
          <p>Please confirm your email address by entering the following confirmation code:</p>
          <p style="text-align: center; font-weight: bold; font-size: 30px;">${token}</p>
          <p>Thank you!</p>
        `;

    const mailOptions = {
      from: process.env.GOOGLE_EMAIL,
      to: email,
      subject,
      html,
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error(error);
      } else {
        this.logger.log(`${subject} email sent to ${email}: ` + info.response);
      }
    });
  }

  async supportEmail(userEmail: string, message: string) {
    const supportEmail = this.configService.get<string>('SUPPORT_EMAIL');
    const subject = 'user request';

    const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: #333;">Нове повідомлення від користувача</h2>
      <div style="margin: 20px 0;">
        <p><strong>Email користувача:</strong> ${userEmail}</p>
      </div>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        <h3 style="color: #444;">Повідомлення:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
    </div>
  `;

    const mailOptions = {
      from: process.env.GOOGLE_EMAIL,
      to: supportEmail,
      subject,
      html,
    };

    this.transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error(error);
      } else {
        this.logger.log(
          `${subject} email sent to ${supportEmail}: ` + info.response,
        );
      }
    });
  }
}
