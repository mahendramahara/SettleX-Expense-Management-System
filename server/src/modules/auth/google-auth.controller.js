export class GoogleAuthController {
  constructor(authModel, config = {}) {
    this.authModel = authModel;
    this.clientId = config.clientId || process.env.GOOGLE_CLIENT_ID || '';
    this.clientSecret = config.clientSecret || process.env.GOOGLE_CLIENT_SECRET || '';
    this.redirectUri =
      config.redirectUri ||
      process.env.GOOGLE_REDIRECT_URI ||
      (process.env.NODE_ENV === 'production'
        ? 'https://sattlex.miro.com.np/auth/callback'
        : 'http://localhost:5173/auth/callback');

    this.getAuthUrl = this.getAuthUrl.bind(this);
    this.handleCallback = this.handleCallback.bind(this);
    this.verifyCredential = this.verifyCredential.bind(this);
  }

  getAuthUrl(req, res) {
    const redirectUri = req.query.redirectUri || this.redirectUri;
    const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      prompt: 'consent',
    });

    return res.status(200).json({
      success: true,
      data: {
        url: `${rootUrl}?${params.toString()}`,
      },
    });
  }

  async handleCallback(req, res, next) {
    try {
      const code = req.body?.code || req.query?.code;
      const redirectUri = req.body?.redirectUri || req.query?.redirectUri || this.redirectUri;

      if (!code) {
        return res.status(400).json({
          success: false,
          message: 'Google authorization code is required',
        });
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) {
        return res.status(400).json({
          success: false,
          message:
            tokenData.error_description || 'Failed to exchange authorization code with Google',
          details: tokenData,
        });
      }

      const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const profile = await profileResponse.json();
      if (!profileResponse.ok || !profile.email) {
        return res.status(400).json({
          success: false,
          message: 'Failed to retrieve user profile from Google',
        });
      }

      const authResult = await this.authModel.authenticateGoogle({
        googleId: profile.sub,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        avatar: profile.picture,
      });

      if (req.method === 'GET' && !req.headers.accept?.includes('application/json')) {
        return res.redirect(`${redirectUri}?token=${authResult.token}`);
      }

      return res.status(200).json({
        success: true,
        message: 'Google authentication successful',
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
      next(error);
    }
  }

  async verifyCredential(req, res, next) {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Google credential ID token is required',
        });
      }

      const tokenInfoResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
      );
      const tokenInfo = await tokenInfoResponse.json();

      if (!tokenInfoResponse.ok || !tokenInfo.email) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Google credential token',
        });
      }

      const authResult = await this.authModel.authenticateGoogle({
        googleId: tokenInfo.sub,
        email: tokenInfo.email,
        name: tokenInfo.name || tokenInfo.email.split('@')[0],
        avatar: tokenInfo.picture,
      });

      return res.status(200).json({
        success: true,
        message: 'Google authentication successful',
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
      next(error);
    }
  }
}
