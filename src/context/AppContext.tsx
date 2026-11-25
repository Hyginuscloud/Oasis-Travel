import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';
import { INITIAL_SITE_SETTINGS } from '../db/seedData';
import { EnquiryPrefill, PublicBootstrapData } from '../types';

export interface PasswordSessionUser {
  username: string;
  displayName: string;
  role: string;
}

interface AppContextValue {
  data: PublicBootstrapData;
  loading: boolean;
  error: string | null;
  refreshPublicData: () => Promise<void>;
  enquiryDrawerOpen: boolean;
  enquiryPrefill: EnquiryPrefill;
  openEnquiryDrawer: (prefill?: EnquiryPrefill) => void;
  closeEnquiryDrawer: () => void;
  authUser: User | null;
  passwordUser: PasswordSessionUser | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  getIdToken: () => Promise<string | null>;
  signInWithGoogle: () => Promise<void>;
  signInWithPassword: (username: string, password: string) => Promise<void>;
  setupInitialAdmin: (password: string, displayName?: string) => Promise<void>;
  signOutAdmin: () => Promise<void>;
}

const DEFAULT_DATA: PublicBootstrapData = {
  settings: INITIAL_SITE_SETTINGS,
  services: [],
  destinations: [],
  packages: [],
  testimonials: [],
  faqs: [],
  mediaAssets: [],
  designProjects: [],
  specialOffers: [],
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<PublicBootstrapData>(DEFAULT_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [enquiryDrawerOpen, setEnquiryDrawerOpen] = useState(false);
  const [enquiryPrefill, setEnquiryPrefill] = useState<EnquiryPrefill>({});

  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // In-memory session token for password/manager authentication (no localStorage/sessionStorage)
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [passwordUser, setPasswordUser] = useState<PasswordSessionUser | null>(null);

  const refreshPublicData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch('/api/public/bootstrap');
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Unable to load Oasis travel catalogue.');
      }
      const json = (await res.json()) as PublicBootstrapData;
      setData({
        ...json,
        designProjects: json.designProjects || [],
        specialOffers: json.specialOffers || [],
        settings: { ...INITIAL_SITE_SETTINGS, ...(json.settings || {}) },
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to reach server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshPublicData();
  }, [refreshPublicData]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  const openEnquiryDrawer = useCallback((prefill?: EnquiryPrefill) => {
    setEnquiryPrefill(prefill || {});
    setEnquiryDrawerOpen(true);
  }, []);

  const closeEnquiryDrawer = useCallback(() => {
    setEnquiryDrawerOpen(false);
  }, []);

  const getIdToken = useCallback(async (): Promise<string | null> => {
    if (adminToken) return adminToken;
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  }, [adminToken]);

  const signInWithGoogle = useCallback(async () => {
    setAdminToken(null);
    setPasswordUser(null);
    await signInWithPopup(auth, googleAuthProvider);
  }, []);

  const signInWithPassword = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim() || 'admin', password }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.token) {
      throw new Error(json.error || 'Invalid credentials.');
    }
    setAdminToken(json.token);
    setPasswordUser(json.user);
  }, []);

  const setupInitialAdmin = useCallback(async (password: string, displayName?: string) => {
    const res = await fetch('/api/auth/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, displayName: displayName || 'Primary Administrator' }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.token) {
      throw new Error(json.error || 'Unable to set up administrator password.');
    }
    setAdminToken(json.token);
    setPasswordUser(json.user);
  }, []);

  const signOutAdmin = useCallback(async () => {
    setAdminToken(null);
    setPasswordUser(null);
    if (auth.currentUser) {
      await signOut(auth);
    }
  }, []);

  const isAuthenticated = Boolean(adminToken || authUser);

  return (
    <AppContext.Provider
      value={{
        data,
        loading,
        error,
        refreshPublicData,
        enquiryDrawerOpen,
        enquiryPrefill,
        openEnquiryDrawer,
        closeEnquiryDrawer,
        authUser,
        passwordUser,
        isAuthenticated,
        authLoading,
        getIdToken,
        signInWithGoogle,
        signInWithPassword,
        setupInitialAdmin,
        signOutAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
