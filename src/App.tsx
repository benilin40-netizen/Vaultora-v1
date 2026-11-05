import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { UserLogin } from './pages/UserLogin';
import { UserRegister } from './pages/UserRegister';
import { UserDashboard } from './pages/UserDashboard';
import { AdminSignup } from './pages/AdminSignup';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { MaintenancePage } from './pages/MaintenancePage';
import { api } from './services/api';
import { AlertTriangle, Power } from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<string>('landing');
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStatus = async () => {
    try {
      const res = await api.getSystemStatus();
      setSystemStatus(res);
      return res;
    } catch (err) {
      console.warn('Failed to fetch system status:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check active user or admin sessions and system status
    const initApp = async () => {
      try {
        await fetchStatus();

        if (api.getToken(false)) {
          try {
            const res = await api.getMe();
            setUser(res.user);
            setCurrentRoute('user-dashboard');
          } catch (e: any) {
            // If maintenance mode active or invalid token
            api.clearToken(false);
          }
        } else if (api.getToken(true)) {
          try {
            const res = await api.getAdminMe();
            setAdmin(res.admin);
            setCurrentRoute('admin-dashboard');
          } catch (e: any) {
            api.clearToken(true);
          }
        }
      } catch (err) {
        console.error('Initialization failed:', err);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const handleNavigate = (route: string) => {
    // Access control checks
    if (route.startsWith('admin-') && !admin && route !== 'admin-login' && route !== 'admin-signup') {
      setCurrentRoute('admin-login');
      return;
    }
    if (route === 'user-dashboard' && !user) {
      setCurrentRoute('user-login');
      return;
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Re-check system status on navigation
    fetchStatus();
  };

  const handleUserLogout = async () => {
    await api.logoutUser();
    setUser(null);
    setCurrentRoute('landing');
  };

  const handleAdminLogout = async () => {
    await api.adminLogout();
    setAdmin(null);
    setCurrentRoute('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-400">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mr-3"></div>
        Loading Vaultora Platform...
      </div>
    );
  }

  // Maintenance mode active check:
  // If maintenance is enabled, visitors and normal users see MaintenancePage.
  // Admin access is preserved so administrators can log in, access the panel, and restore the site.
  const isMaintenanceActive = Boolean(systemStatus?.maintenanceMode);
  const isAdminRoute = currentRoute === 'admin-login' || currentRoute === 'admin-signup' || currentRoute === 'admin-dashboard';
  const showMaintenancePage = isMaintenanceActive && !admin && !isAdminRoute;

  if (showMaintenancePage) {
    return (
      <MaintenancePage
        onNavigate={handleNavigate}
        statusInfo={systemStatus}
        onRefreshStatus={async () => {
          const s = await fetchStatus();
          if (s && !s.maintenanceMode) {
            setCurrentRoute('landing');
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Persistent Admin Maintenance Warning Banner */}
      {isMaintenanceActive && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50 shadow-md">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                MAINTENANCE MODE ACTIVE: Normal visitor and user access is paused. Admin controls remain operational.
              </span>
            </div>
            {admin && currentRoute !== 'admin-dashboard' && (
              <button
                onClick={() => setCurrentRoute('admin-dashboard')}
                className="underline hover:opacity-80 text-[11px] font-extrabold uppercase shrink-0"
              >
                Go to Admin Panel
              </button>
            )}
          </div>
        </div>
      )}

      <Navbar
        user={user}
        admin={admin}
        currentRoute={currentRoute}
        onNavigate={handleNavigate}
        onUserLogout={handleUserLogout}
        onAdminLogout={handleAdminLogout}
      />

      <main className="flex-1">
        {currentRoute === 'landing' && <LandingPage onNavigate={handleNavigate} />}
        {currentRoute === 'user-login' && (
          <UserLogin
            onLoginSuccess={(u) => {
              setUser(u);
              setCurrentRoute('user-dashboard');
            }}
            onNavigate={handleNavigate}
          />
        )}
        {currentRoute === 'user-register' && (
          <UserRegister
            onRegisterSuccess={(u) => {
              setUser(u);
              setCurrentRoute('user-dashboard');
            }}
            onNavigate={handleNavigate}
          />
        )}
        {currentRoute === 'user-dashboard' && <UserDashboard />}
        {currentRoute === 'admin-signup' && (
          <AdminSignup
            onAdminLoginSuccess={(a) => {
              setAdmin(a);
              setCurrentRoute('admin-dashboard');
            }}
            onNavigate={handleNavigate}
          />
        )}
        {currentRoute === 'admin-login' && (
          <AdminLogin
            onAdminLoginSuccess={(a) => {
              setAdmin(a);
              setCurrentRoute('admin-dashboard');
            }}
            onNavigate={handleNavigate}
          />
        )}
        {currentRoute === 'admin-dashboard' && <AdminDashboard />}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
