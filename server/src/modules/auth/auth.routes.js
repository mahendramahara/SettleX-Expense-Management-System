import { Router } from 'express';
import { GoogleAuthController } from './google-auth.controller.js';

export class AuthRoutes {
  constructor(authController, authMiddleware, googleAuthController) {
    this.router = Router();
    this.authController = authController;
    this.authMiddleware = authMiddleware;
    this.googleAuthController =
      googleAuthController || new GoogleAuthController(this.authController.authModel);
    this.setupRoutes();
  }

  setupRoutes() {
    this.router.post('/register', this.authController.register);
    this.router.post('/verify-otp', this.authController.verifyOtp);
    this.router.post('/resend-otp', this.authController.resendOtp);
    this.router.post('/google', this.authController.googleAuth);
    this.router.get('/google/url', this.googleAuthController.getAuthUrl);
    this.router.post('/google/callback', this.googleAuthController.handleCallback);
    this.router.get('/google/callback', this.googleAuthController.handleCallback);
    this.router.post('/google/credential', this.googleAuthController.verifyCredential);
    this.router.post('/login', this.authController.login);
    this.router.post('/logout', this.authController.logout);
    this.router.post('/forgot-password', this.authController.forgotPassword);
    this.router.post('/verify-reset-otp', this.authController.verifyResetOtp);
    this.router.post('/reset-password', this.authController.resetPassword);
    this.router.get('/me', this.authMiddleware.authenticate, this.authController.getMe);
  }

  getRouter() {
    return this.router;
  }
}
