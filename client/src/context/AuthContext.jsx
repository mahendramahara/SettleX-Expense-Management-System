import React, { createContext, useContext, useEffect, useState } from 'react';
import { httpClient, authService, adminService } from '../services/index.js';
import userDemoData from '../demo/user-demo.json';

const AuthContext = createContext();

const DEMO_MEMBER_USER = {
  _id: userDemoData?.user?.id || 'demo-user',
  id: userDemoData?.user?.id || 'demo-user',
  name: userDemoData?.user?.name || 'Demo User',
  email: userDemoData?.user?.email || 'demo@settlex.app',
  role: userDemoData?.user?.role || 'guest',
  tier: userDemoData?.user?.tier || 'student',
  privileges: [],
  currencyPreference: userDemoData?.user?.currencyPreference || 'NPR',
  isVerified: userDemoData?.user?.isVerified ?? true,
  isSuspended: false,
  isGuest: true,
};

const GUEST_ADMIN_USER = {
  _id: 'guest_admin_demo',
  id: 'guest_admin_demo',
  name: 'Guest Administrator',
  email: 'admin.guest@settlex.demo',
  role: 'superadmin',
  isAdmin: true,
  isGuest: true,
  isGuestAdmin: true,
  tier: 'enterprise',
  privileges: [
    'MANAGE_USERS',
    'MANAGE_EXPENSES',
    'MANAGE_GROUPS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_SETTINGS',
    'ANOMALY_DETECTION',
    'DEBT_OPTIMIZATION',
  ],
  permissions: ['*'],
  currencyPreference: 'NPR',
  isVerified: true,
  isSuspended: false,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => httpClient.getToken());
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [isSwitchedToMember, setIsSwitchedToMember] = useState(
    () => sessionStorage.getItem('settlex_switched_to_member') === 'true'
  );

  useEffect(() => {
    async function loadUser() {
      if (sessionStorage.getItem('settlex_switched_to_member') === 'true') {
        setUser({ ...DEMO_MEMBER_USER, isSwitchedToMember: true });
        setIsGuest(true);
        setIsSwitchedToMember(true);
        setIsLoading(false);
        return;
      }

      const storedToken = httpClient.getToken();
      if (
        !storedToken ||
        storedToken === 'guest_demo_token' ||
        storedToken === 'guest_admin_demo_token'
      ) {
        if (
          storedToken === 'guest_demo_token' ||
          storedToken === 'guest_admin_demo_token'
        ) {
          httpClient.setToken(null);
          setToken(null);
        }
        setIsLoading(false);
        return;
      }

      try {
        let response;
        try {
          response = await authService.getMe();
        } catch (err) {
          if (err.status === 401 || err.status === 403 || err.status === 404) {
            response = await adminService.getMe();
          } else {
            throw err;
          }
        }
        const userData =
          response?.data?.user ||
          response?.data?.admin ||
          response?.data ||
          response?.user ||
          response?.admin;

        if (
          userData &&
          (response?.data?.admin ||
            response?.admin ||
            userData.role === 'superadmin' ||
            userData.role === 'admin' ||
            userData.role === 'moderator')
        ) {
          userData.isAdmin = true;
        }

        setUser(userData);
      } catch {
        httpClient.setToken(null);
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      let response;
      try {
        response = await authService.login(credentials);
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          try {
            response = await adminService.login(credentials);
          } catch {
            throw err;
          }
        } else {
          throw err;
        }
      }

      const authToken = response.data?.token || response.token;
      const authUser =
        response.data?.user || response.data?.admin || response.user || response.admin;

      if (
        authUser &&
        (response.data?.admin ||
          response.admin ||
          authUser.role === 'superadmin' ||
          authUser.role === 'admin' ||
          authUser.role === 'moderator')
      ) {
        authUser.isAdmin = true;
      }

      httpClient.setToken(authToken);
      setToken(authToken);
      setUser(authUser);
      setIsGuest(false);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAdmin = async (credentials) => {
    setIsLoading(true);
    try {
      let response;
      try {
        response = await adminService.login(credentials);
      } catch {
        response = await authService.login(credentials);
      }

      const authToken = response.data?.token || response.token;
      const authUser =
        response.data?.user || response.data?.admin || response.user || response.admin;

      if (authUser) {
        authUser.isAdmin = true;
      }

      httpClient.setToken(authToken);
      setToken(authToken);
      setUser(authUser);
      setIsGuest(false);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const verifyOtp = async (payload) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOtp(payload);
      const authToken = response.data?.token || response.token;
      const authUser = response.data?.user || response.user;

      if (authToken) {
        httpClient.setToken(authToken);
        setToken(authToken);
        setUser(authUser);
        setIsGuest(false);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (payload) => {
    return await authService.resendOtp(payload);
  };

  const forgotPassword = async (payload) => {
    return await authService.forgotPassword(payload);
  };

  const verifyResetOtp = async (payload) => {
    return await authService.verifyResetOtp(payload);
  };

  const resetPassword = async (payload) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(payload);
      const authToken = response.data?.token || response.token;
      const authUser = response.data?.user || response.user;

      if (authToken) {
        httpClient.setToken(authToken);
        setToken(authToken);
        setUser(authUser);
        setIsGuest(false);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogleMock = async () => {
    setIsLoading(true);
    try {
      const mockPayload = {
        googleId: 'google_oauth_aarav_' + Date.now(),
        email: 'aarav.gurung@gmail.com',
        name: 'Aarav Gurung',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
      };

      const response = await authService.googleAuth(mockPayload);
      const authToken = response.data?.token || response.token;
      const authUser = response.data?.user || response.user;

      httpClient.setToken(authToken);
      setToken(authToken);
      setUser(authUser);
      setIsGuest(false);
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const redirectUri =
        import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
      const res = await authService.getGoogleAuthUrl(redirectUri);
      if (res?.data?.url) {
        window.location.href = res.data.url;
        return;
      }
    } catch {
      const clientId =
        import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
      const redirectUri =
        import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
      const rootUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid profile email',
        access_type: 'offline',
        prompt: 'consent',
      });
      window.location.href = `${rootUrl}?${params.toString()}`;
    }
  };

  const handleGoogleCallback = async (code) => {
    setIsLoading(true);
    try {
      const redirectUri =
        import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`;
      const response = await authService.googleCallback({ code, redirectUri });
      const authToken = response.data?.token || response.token;
      const authUser = response.data?.user || response.user;

      if (authToken) {
        httpClient.setToken(authToken);
        setToken(authToken);
        setUser(authUser);
        setIsGuest(false);
      }
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsGuest = () => {
    setUser(DEMO_MEMBER_USER);
    setIsGuest(true);
    setToken('guest_demo_token');
  };

  const loginAsGuestAdmin = () => {
    setUser(GUEST_ADMIN_USER);
    setIsGuest(true);
    setToken('guest_admin_demo_token');
  };

  const switchToMemberView = () => {
    if (
      user &&
      (user.isAdmin ||
        user.role === 'superadmin' ||
        user.role === 'admin' ||
        user.isGuestAdmin)
    ) {
      sessionStorage.setItem('settlex_admin_backup', JSON.stringify(user));
    }
    sessionStorage.setItem('settlex_switched_to_member', 'true');
    sessionStorage.setItem('settlex_switched_to_user', 'true');
    setIsSwitchedToMember(true);
    setIsGuest(true);
    setUser({ ...DEMO_MEMBER_USER, isSwitchedToMember: true });
  };

  const switchToAdminView = () => {
    sessionStorage.removeItem('settlex_switched_to_member');
    sessionStorage.removeItem('settlex_switched_to_user');
    setIsSwitchedToMember(false);
    let savedAdmin = null;
    try {
      const saved = sessionStorage.getItem('settlex_admin_backup');
      if (saved) savedAdmin = JSON.parse(saved);
    } catch {
      // ignore
    }
    const adminUser = savedAdmin || GUEST_ADMIN_USER;
    setUser(adminUser);
    setIsGuest(Boolean(adminUser.isGuest || adminUser.isGuestAdmin));
  };

  const logout = async () => {
    const currentToken = httpClient.getToken();
    if (
      currentToken &&
      currentToken !== 'guest_demo_token' &&
      currentToken !== 'guest_admin_demo_token'
    ) {
      try {
        await httpClient.request('/auth/logout', { method: 'POST' });
      } catch {
        // Proceed regardless of server response
      }
    }
    sessionStorage.removeItem('settlex_switched_to_member');
    sessionStorage.removeItem('settlex_switched_to_user');
    sessionStorage.removeItem('settlex_admin_backup');
    setIsSwitchedToMember(false);
    httpClient.setToken(null);
    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const isAdmin = Boolean(
    user?.isAdmin ||
    user?.role === 'superadmin' ||
    user?.role === 'admin' ||
    user?.role === 'moderator'
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin,
        isLoading,
        isGuest,
        isSwitchedToMember,
        login,
        loginAdmin,
        register,
        verifyOtp,
        resendOtp,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        loginWithGoogle,
        handleGoogleCallback,
        loginWithGoogleMock,
        loginAsGuest,
        loginAsGuestAdmin,
        switchToMemberView,
        switchToAdminView,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
