import dns from 'node:dns';
import net from 'node:net';
import nodemailer from 'nodemailer';

export class MailService {
  constructor() {
    this.host = process.env.SMTP_HOST || 'smtp.gmail.com';
    this.port = Number(process.env.SMTP_PORT) || 587;
    this.user = process.env.SMTP_USER || '';
    this.pass = process.env.SMTP_PASS || '';
    this.from = process.env.SMTP_FROM || 'SettleX <noreply@settlex.com>';
    this.dnsServers = this.resolveDnsServers();

    this.configureDns();
    this.transporter = null;
    this.initializeTransporter();
  }

  resolveDnsServers() {
    if (process.env.DNS_SERVERS) {
      const parsed = process.env.DNS_SERVERS.split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (parsed.length > 0) {
        return parsed;
      }
    }
    return ['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'];
  }

  configureDns() {
    try {
      dns.setServers(this.dnsServers);
    } catch (error) {
      process.stderr.write(`Failed to configure custom DNS servers: ${error.message}\n`);
    }
  }

  customLookup(hostname, options, callback) {
    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    if (net.isIP(hostname)) {
      return callback(null, hostname, net.isIP(hostname));
    }

    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        return dns.lookup(hostname, options, callback);
      }
      if (options && options.all) {
        return callback(
          null,
          addresses.map((addr) => ({ address: addr, family: 4 }))
        );
      }
      return callback(null, addresses[0], 4);
    });
  }

  initializeTransporter() {
    if (!this.user || !this.pass) {
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.port === 465,
      auth: {
        user: this.user,
        pass: this.pass,
      },
      lookup: (hostname, options, callback) => this.customLookup(hostname, options, callback),
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });
  }

  async verifyConnection() {
    if (!this.transporter) {
      return { success: false, message: 'Transporter not initialized' };
    }
    try {
      await this.transporter.verify();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async sendVerificationOtp(email, otp, name = 'User', options = {}) {
    const subject = 'SettleX - Verify Your Account';
    const text = `Welcome to SettleX, ${name}. Your 6-digit verification code is: ${otp}. This code will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b;">Welcome to SettleX, ${name}</h2>
        <p style="color: #475569;">Thank you for registering. Please use the following 6-digit verification code to complete your registration:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background-color: #f1f5f9; border-radius: 6px; color: #0f172a;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </div>
    `;

    return this.sendMail(email, subject, html, text, options);
  }

  async sendPasswordResetOtp(email, otp, name = 'User', options = {}) {
    const subject = 'SettleX - Password Reset Code';
    const text = `Hello ${name}, your SettleX password reset code is: ${otp}. This code will expire in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #1e293b;">Password Reset Request</h2>
        <p style="color: #475569;">Hello ${name}, we received a request to reset your SettleX password. Use the following code to proceed:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; background-color: #fef2f2; border-radius: 6px; color: #b91c1c;">${otp}</span>
        </div>
        <p style="color: #64748b; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please secure your account immediately.</p>
      </div>
    `;

    return this.sendMail(email, subject, html, text, options);
  }

  async sendAnomalyAlert({ to, userName = 'Member', anomalyType = 'OUTLIER_EXPENSE', severity = 'HIGH', description = '', metrics = {} }, options = {}) {
    const subject = `[SettleX Security Alert] Detected Anomaly: ${anomalyType}`;
    const text = `Hello ${userName},\n\nSettleX automated financial monitoring has detected an unusual pattern or expense anomaly associated with your circle account: ${description}.\n\nSeverity: ${severity}\n\nPlease review your recent group expenses or contact your circle administrator if you did not authorize this activity.\n\nSettleX Autonomous Financial Integrity Engine`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
          <h2 style="color: #0f172a; margin: 0; font-size: 20px;">SettleX Anomaly & Compliance Alert</h2>
        </div>
        <div style="margin-top: 12px;">
          <span style="display: inline-block; padding: 4px 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; border-radius: 6px; background-color: #fee2e2; color: #dc2626;">
            ${severity} SEVERITY
          </span>
        </div>
        <p style="color: #334155; font-size: 14px; line-height: 1.6; margin-top: 16px;">
          Hello <strong>${userName}</strong>,
        </p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Our automated anomaly detection engine has flagged an irregular transaction pattern or balance deviation on your ledger:
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #ef4444; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
          <div style="font-weight: bold; color: #0f172a; font-size: 14px;">${anomalyType}</div>
          <div style="color: #475569; font-size: 13px; margin-top: 6px; line-height: 1.5;">${description}</div>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          If this activity was legitimate, no further action is required. If you did not authorize these transactions, please check your group ledger or contact SettleX support immediately.
        </p>
        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 11px;">
          SettleX Autonomous Financial Integrity Engine - Automated notification.
        </div>
      </div>
    `;
    return this.sendMail(to, subject, html, text, options);
  }

  async sendMail(to, subject, html, text = '', options = {}) {
    if (process.env.NODE_ENV === 'test' && !options.forceLiveSend) {
      process.stdout.write(
        `[MailService] Test mode active: Simulated email delivery to ${to} (Subject: ${subject})\n`
      );
      return {
        delivered: true,
        simulated: true,
        messageId: `test-simulated-${Date.now()}`,
        to,
        subject,
      };
    }

    if (!this.transporter) {
      process.stdout.write(
        `[MailService] No SMTP transporter configured. Mail to ${to} simulated.\n`
      );
      return { delivered: false, simulated: true, to, subject };
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text: text || undefined,
        html,
      });
      process.stdout.write(
        `[MailService] Email delivered to ${to} (MessageId: ${info.messageId})\n`
      );
      return { delivered: true, messageId: info.messageId };
    } catch (error) {
      process.stderr.write(`[MailService] Failed to send email to ${to}: ${error.message}\n`);
      return { delivered: false, error: error.message };
    }
  }
}
