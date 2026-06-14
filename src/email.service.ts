import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
  }

  async sendConfirmation(email: string, name: string, date: Date, plan?: string) {
    try {
      const planInfo = plan ? `<p>Plan seleccionado: <strong>${plan}</strong></p>` : '';
      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: '✅ Reserva confirmada',
        html: `<h2>¡Hola ${name}!</h2><p>Tu reserva está confirmada para ${new Date(date).toLocaleString('es-ES')}</p>${planInfo}`,
      });
      console.log('✅ Email sent');
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  async sendBookingNotification(name: string, email: string, date: Date, duration: number, plan?: string) {
    try {
      await this.transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: '📅 Nueva reserva recibida',
        html: `
          <h2>Nueva reserva</h2>
          <p>Nombre: <strong>${name}</strong></p>
          <p>Email: <strong>${email}</strong></p>
          <p>Fecha: ${new Date(date).toLocaleString('es-ES')}</p>
          <p>Duración: ${duration}h</p>
          <p>Plan: <strong>${plan || 'sin especificar'}</strong></p>
        `,
      });
      console.log('✅ Notification sent');
    } catch (error) {
      console.error('Email error:', error);
    }
  }
}
