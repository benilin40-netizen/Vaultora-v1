import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-[#05070B] border-t border-slate-800 text-slate-400 text-sm py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-[#05090F] p-0.5 border border-amber-500/30 shadow-md">
                <img src="/favicon.svg" alt="Valutora Emblem" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Valutora</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vaultora is a professional financial savings and treasury platform offering secure high-yield savings engine, deposits, withdrawals, and enterprise admin control.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational & Encrypted
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li><button onClick={() => onNavigate('landing')} className="hover:text-emerald-400 transition-colors">Overview</button></li>
              <li><button onClick={() => onNavigate('landing')} className="hover:text-emerald-400 transition-colors">Savings Engine (8%)</button></li>
              <li><button onClick={() => onNavigate('landing')} className="hover:text-emerald-400 transition-colors">Deposit & Withdrawal</button></li>
              <li><button onClick={() => onNavigate('user-register')} className="hover:text-emerald-400 transition-colors">Open Account</button></li>
            </ul>
          </div>

          {/* Administration */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Administration</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('admin-login')} className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  Admin Login
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin-signup')} className="hover:text-emerald-400 transition-colors">
                  Admin Signup / Bootstrap
                </button>
              </li>
              <li><button onClick={() => onNavigate('admin-dashboard')} className="hover:text-emerald-400 transition-colors">Admin Control Panel</button></li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">Compliance & Security</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Vaultora implements bank-grade PBKDF2 hashing, audit logging, and isolated ledger storage. Comply with applicable financial regulations.
            </p>
            <p className="text-[10px] text-slate-400">
              © 2026 Vaultora Financial Technologies Inc. All rights reserved.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <p>Vaultora Financial Platform · Save smarter. Stay in control.</p>
          <div className="flex items-center gap-6 mt-4 sm:mt-0">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
