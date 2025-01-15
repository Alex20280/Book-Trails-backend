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

  //   async sendPasswordReset(email: string, token: string, isApp?: boolean) {
  //     const webText = `Click on the link to set new password: <a href="${process.env.CLIENT_URL}/auth/new-password?token=${token}">Reset Password</a>`;
  //     const appText = `Password recovery code: <p style="text-align: center; font-weight: bold; font-size: 30px;">${token}</p>`;

  //     const mailOptions = {
  //       from: process.env.GOOGLE_EMAIL,
  //       to: email,
  //       subject: 'Password Reset',
  //       html: isApp ? appText : webText,
  //     };

  //     this.transporter.sendMail(mailOptions, (error, info) => {
  //       if (error) {
  //         this.logger.error(error);
  //       } else {
  //         this.logger.log(`Email sent to ${email}: ` + info.response);
  //       }
  //     });
  //   }

  //   async sendSetPasswordLetter(email: string) {
  //     const text = `
  //     <div style="font-family: Arial, sans-serif; line-height: 1.5;">
  //       <h2 style="color: #4CAF50;">Your password has been successfully changed.</h2>
  //      </div>
  //   `;

  //     const mailOptions = {
  //       from: process.env.GOOGLE_EMAIL,
  //       to: email,
  //       subject: 'Password Reset',
  //       html: text,
  //     };

  //     this.transporter.sendMail(mailOptions, (error, info) => {
  //       if (error) {
  //         this.logger.error(error);
  //       } else {
  //         this.logger.log(`Email sent to ${email}: ` + info.response);
  //       }
  //     });
  //   }
}
