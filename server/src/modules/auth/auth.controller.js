export class AuthController {
  constructor(authModel, mailService) {
    this.authModel = authModel;
    this.mailService = mailService;
    this.register = this.register.bind(this);
    this.verifyOtp = this.verifyOtp.bind(this);
    this.resendOtp = this.resendOtp.bind(this);
    this.googleAuth = this.googleAuth.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.verifyResetOtp = this.verifyResetOtp.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.getMe = this.getMe.bind(this);
  }

  async register(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required',
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long',
        });
      }

      const { user, otp, resumed } = await this.authModel.registerLocal({
        name,
        email,
        password,
        role,
      });
      if (this.mailService) {
        await this.mailService.sendVerificationOtp(email, otp, user.name);
      }

      return res.status(resumed ? 200 : 201).json({
        success: true,
        resumed: Boolean(resumed),
        isUnverified: true,
        message: resumed
          ? 'Account already exists but is unverified. A new verification OTP has been sent to your email.'
          : 'Registration initiated. Verification OTP sent to email',
        data: {
          user,
          otp: process.env.NODE_ENV === 'test' ? otp : undefined,
        },
      });
    } catch (error) {
      if (error.message === 'Email already registered' || error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
      }
      next(error);
    }
  }

  async verifyOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification OTP are required',
        });
      }

      const result = await this.authModel.verifyRegistrationOtp(email, otp);
      return res.status(200).json({
        success: true,
        message: 'Account verified successfully',
        data: result,
      });
    } catch (error) {
      if (error.isSuspended) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: error.message,
        });
      }
      if (
        error.message.includes('Invalid') ||
        error.message.includes('expired') ||
        error.message.includes('not found')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async resendOtp(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const { user, otp } = await this.authModel.resendRegistrationOtp(email);
      if (this.mailService) {
        await this.mailService.sendVerificationOtp(email, otp, user.name);
      }

      return res.status(200).json({
        success: true,
        message: 'Verification OTP resent to email',
        data: {
          email,
          otp: process.env.NODE_ENV === 'test' ? otp : undefined,
        },
      });
    } catch (error) {
      if (error.message.includes('suspended')) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: error.message,
        });
      }
      if (error.message.includes('not found') || error.message.includes('already verified')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async googleAuth(req, res, next) {
    try {
      const { googleId, email, name, avatar } = req.body;
      if (!googleId || !email || !name) {
        return res.status(400).json({
          success: false,
          message: 'googleId, email, and name are required',
        });
      }

      const result = await this.authModel.authenticateGoogle({ googleId, email, name, avatar });
      return res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: result,
      });
    } catch (error) {
      if (error.isSuspended) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      const authResult = await this.authModel.authenticate(email, password);
      if (!authResult) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: authResult,
      });
    } catch (error) {
      if (error.isSuspended) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: error.message,
        });
      }
      if (error.isUnverified) {
        let otp;
        if (this.mailService && error.user) {
          const resendResult = await this.authModel.resendRegistrationOtp(error.email);
          otp = resendResult.otp;
          await this.mailService.sendVerificationOtp(error.email, otp, error.user.name);
        }
        return res.status(403).json({
          success: false,
          isUnverified: true,
          message: 'Account is not verified. A verification OTP has been sent to your email.',
          email: error.email,
          data: {
            otp: process.env.NODE_ENV === 'test' ? otp : undefined,
          },
        });
      }
      next(error);
    }
  }

  async logout(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required',
        });
      }

      const { user, otp } = await this.authModel.requestPasswordReset(email);
      if (this.mailService) {
        await this.mailService.sendPasswordResetOtp(email, otp, user.name);
      }

      return res.status(200).json({
        success: true,
        message: 'Password reset OTP sent to email',
        data: {
          email,
          otp: process.env.NODE_ENV === 'test' ? otp : undefined,
        },
      });
    } catch (error) {
      if (error.message.includes('suspended')) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: error.message,
        });
      }
      if (error.message.includes('No account found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async verifyResetOtp(req, res, next) {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: 'Email and reset OTP are required',
        });
      }

      await this.authModel.verifyResetOtp(email, otp);
      return res.status(200).json({
        success: true,
        message: 'Reset OTP verified successfully',
      });
    } catch (error) {
      if (error.message.includes('suspended')) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: error.message,
        });
      }
      if (error.message.includes('Invalid') || error.message.includes('expired')) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, OTP, and newPassword are required',
        });
      }

      const result = await this.authModel.resetPassword({ email, otp, newPassword });
      return res.status(200).json({
        success: true,
        message: 'Password reset successfully',
        data: result,
      });
    } catch (error) {
      if (error.message.includes('suspended')) {
        return res.status(403).json({
          success: false,
          isSuspended: true,
          message: error.message,
        });
      }
      if (
        error.message.includes('Invalid') ||
        error.message.includes('expired') ||
        error.message.includes('at least 6')
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await this.authModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          user: this.authModel.sanitizeUser(user),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
