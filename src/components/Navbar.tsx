import React from 'react';
import { ShieldCheck, Lock, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';

interface NavbarProps {
  user: any;
  admin: any;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onUserLogout: () => void;
  onAdminLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  admin,
  currentRoute,
  onNavigate,
  onUserLogout,
  onAdminLogout
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#090D16]/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate(admin ? 'admin-dashboard' : (user ? 'user-dashboard' : 'landing'))} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-xl overflow-hidden shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform bg-[#05090F] p-0.5 border border-amber-500/30">
            <img src="/favicon.svg" alt="Valutora Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
              Valutora
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Secure
              </span>
            </span>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Save smarter. Stay in control.</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {!admin && !user && (
            <>
              <button 
                onClick={() => {
                  if (currentRoute !== 'landing') onNavigate('landing');
                  else document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' });
                }} 
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
              >
                Overview
              </button>
              <button 
                onClick={() => {
                  if (currentRoute !== 'landing') {
                    onNavigate('landing');
                    setTimeout(() => document.getElementById('savings-engine')?.scrollIntoView({ behavior: 'smooth' }), 50);
                  } else {
                    document.getElementById('savings-engine')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
              >
                Savings Engine
              </button>
              <button 
                onClick={() => {
                  if (currentRoute !== 'landing') {
                    onNavigate('landing');
                    setTimeout(() => document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' }), 50);
                  } else {
                    document.getElementById('security')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
              >
                Security & Compliance
              </button>
              <button 
                onClick={() => {
                  if (currentRoute !== 'landing') {
                    onNavigate('landing');
                    setTimeout(() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' }), 50);
                  } else {
                    document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }} 
                className="text-sm font-medium text-slate-300 hover:text-emerald-400 transition-colors"
              >
                FAQ
              </button>
            </>
          )}

          {user && !admin && (
            <>
              <button onClick={() => onNavigate('user-dashboard')} className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            </>
          )}

          {admin && (
            <>
              <button onClick={() => onNavigate('admin-dashboard')} className="text-sm font-medium text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Admin Panel ({admin.role})
              </button>
            </>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>{user.fullName}</span>
              </div>
              <button
                onClick={onUserLogout}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : admin ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{admin.fullName}</span>
              </div>
              <button
                onClick={onAdminLogout}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                Admin Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => onNavigate('user-login')}
                className="px-4 py-2 text-xs font-semibold rounded-lg text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('user-register')}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                Open Vaultora Account
              </button>
              <button
                onClick={() => onNavigate('admin-login')}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 transition-colors flex items-center gap-1"
                title="Admin Panel"
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>Admin Panel</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
