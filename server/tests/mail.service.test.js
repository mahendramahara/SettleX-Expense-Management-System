import 'dotenv/config';
import { describe, it, expect } from 'vitest';
import { MailService } from '../src/common/mail.service.js';

describe('MailService Unit Tests', () => {
  it('should initialize with Cloudflare and Google DNS servers', () => {
    const service = new MailService();
    expect(service.dnsServers).toEqual(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4']);
  });

  it('should support custom DNS servers configured via process.env', () => {
    const previous = process.env.DNS_SERVERS;
    process.env.DNS_SERVERS = '1.1.1.1, 8.8.8.8';
    const customService = new MailService();
    expect(customService.dnsServers).toEqual(['1.1.1.1', '8.8.8.8']);
    if (previous !== undefined) {
      process.env.DNS_SERVERS = previous;
    } else {
      delete process.env.DNS_SERVERS;
    }
  });

  it('should resolve hostname using custom DNS lookup', async () => {
    const service = new MailService();
    const resolved = await new Promise((resolve, reject) => {
      service.customLookup('smtp.gmail.com', {}, (err, address, family) => {
        if (err) {
          return reject(err);
        }
        resolve({ address, family });
      });
    });
    expect(resolved.address).toBeDefined();
    expect(resolved.family).toBe(4);
  });

  it('should automatically simulate email delivery in test environment to preserve Mailtrap limits', async () => {
    const service = new MailService();
    const result = await service.sendVerificationOtp(
      'suman.sharma@example.com',
      '123456',
      'Suman Sharma'
    );
    expect(result.delivered).toBe(true);
    expect(result.simulated).toBe(true);
    expect(result.messageId).toContain('test-simulated');
  });

  it('should handle simulated mail delivery when credentials are intentionally missing in non-test mode', async () => {
    const previousEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const previousUser = process.env.SMTP_USER;
    const previousPass = process.env.SMTP_PASS;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;

    const unconfigured = new MailService();
    const result = await unconfigured.sendVerificationOtp(
      'simulated@example.com',
      '123456',
      'Aarav',
      { forceLiveSend: true }
    );
    expect(result.simulated).toBe(true);
    expect(result.delivered).toBe(false);

    process.env.SMTP_USER = previousUser;
    process.env.SMTP_PASS = previousPass;
    process.env.NODE_ENV = previousEnv;
  });

  it('should deliver verification and reset OTP emails through transporter when mocked', async () => {
    const service = new MailService();
    service.transporter = {
      sendMail: async (opts) => ({ messageId: 'mocked-msg-id-12345', ...opts }),
    };

    const verifyResult = await service.sendVerificationOtp(
      'aarav.gurung@settlex.com',
      '849201',
      'Aarav Gurung',
      { forceLiveSend: true }
    );
    expect(verifyResult.delivered).toBe(true);
    expect(verifyResult.messageId).toBe('mocked-msg-id-12345');

    const resetResult = await service.sendPasswordResetOtp(
      'aarav.gurung@settlex.com',
      '102938',
      'Aarav Gurung',
      { forceLiveSend: true }
    );
    expect(resetResult.delivered).toBe(true);
    expect(resetResult.messageId).toBe('mocked-msg-id-12345');
  });
});
