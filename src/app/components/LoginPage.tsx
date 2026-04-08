import React, { useState } from 'react';
import { authApi } from '../utils/api';
import { cacheCredentials, verifyOfflineCredentials, hasCachedCredentials } from '../utils/offlineAuthCache';

// User role type - must match the type in App.tsx
type UserRole = 'owner' | 'booking_clerk' | 'depot_manager';

interface LoginPageProps {
  onLogin: (role: UserRole, userId: string, depotId?: string | null) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isOfflineLogin, setIsOfflineLogin] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');
    setIsOfflineLogin(false);

    const isOnline = navigator.onLine;

    if (isOnline) {
      // ── ONLINE LOGIN ──
      try {
        // Authenticate and get user role and depot from database
        const response = await authApi.signIn(email, password);

        // Get user role, ID, and assigned depot ID from the response
        const userRole = (response.user?.role || 'owner') as UserRole;
        const userId = response.user?.id || '';
        const depotId = (response.user as any)?.assigned_depot_id || null;

        console.log('Login successful:', { userRole, userId, depotId }); // Debug log

        // Cache credentials for future offline login
        await cacheCredentials(email, password, userRole, userId, depotId);

        onLogin(userRole, userId, depotId);
      } catch (err: any) {
        console.error('Login error:', err);
        setError(err.message || 'Invalid email or password. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // ── OFFLINE LOGIN ──
      setIsOfflineLogin(true);

      if (!hasCachedCredentials()) {
        setError('You must be online for your first login. No saved credentials found.');
        setIsLoading(false);
        return;
      }

      const cachedUser = await verifyOfflineCredentials(email, password);

      if (cachedUser) {
        console.log('Offline login successful:', cachedUser);
        onLogin(cachedUser.role as UserRole, cachedUser.userId, cachedUser.depotId);
      } else {
        setError('Invalid credentials. Make sure you have logged in online at least once with this account.');
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src="/Logo.svg" alt="Dirba Amba Service Logo" className="w-32 h-32 object-contain mb-4 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Dirba Amba Service</h1>
            <p className="text-gray-600">Seasonal Transport Management</p>
          </div>

          {/* Offline Banner */}
          {!navigator.onLine && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <span className="text-lg">📡</span>
              <div>
                <p className="text-sm font-medium text-amber-800">You're offline</p>
                <p className="text-xs text-amber-600">
                  {hasCachedCredentials()
                    ? 'You can log in with previously saved credentials.'
                    : 'You must be online for your first login.'}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              disabled={isLoading}
            >
              {isLoading
                ? (isOfflineLogin ? 'Logging in offline...' : 'Logging in...')
                : 'Login'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need help? Contact your system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}