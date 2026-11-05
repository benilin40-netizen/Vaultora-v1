import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, Lock, AlertTriangle, CheckCircle2, Server, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { formatUGX } from '../utils/currency';

interface MaintenancePageProps {
  onNavigate: (route: string) => void;
  statusInfo?: {
    changedBy?: string;
    changedAt?: string | null;
    reason?: string | null;
  };
  onRefreshStatus?: () => Promise<void>;
}

export const MaintenancePage: React.FC<MaintenancePageProps> = ({
  onNavigate,
  statusInfo,
  onRefreshStatus,
}) => {
  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
    try {
      setChecking(true);
      setCheckMessage(null);
      if (onRefreshStatus) {
        await onRefreshStatus();
      } else {
        const res = await api.getSystemStatus();
        if (!res.maintenanceMode) {
          window.location.reload();
        } else {
          setCheckMessage('Maintenance is still ongoing. Normal visitor access will be restored once completed.');
        }
      }
    } catch (err: any) {
      setCheckMessage('Could not reach server. Please check your internet connection or try again shortly.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30">
      {/* Top Bar with brand */}
      <header className="border-b border-slate-800/80 bg-slate-950/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#05090F] p-0.5 border border-amber-500/30 shadow-md">
              <img src="/favicon.svg" alt="Valutora Emblem" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="font-black text-lg tracking-tight text-white block leading-none">
                VAULTORA
              </span>
              <span className="text-[10px] text-emerald-400 font-mono tracking-widest uppercase">
                UGX Savings
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('admin-login')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin Recovery Access</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center text-center">
        {/* Pulsing Maintenance Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          System Maintenance in Progress
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center mb-6 text-amber-400">
          <AlertTriangle className="w-10 h-10 stroke-[2]" />
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
          Vaultora is Temporarily Unavailable
        </h1>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mb-8">
          We are conducting scheduled technical maintenance and database reconciliation to keep your Ugandan Shilling savings engine secure, fast, and resilient.
        </p>

        {/* Ledger Security Reassurance Box */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 mb-8 text-left space-y-4 shadow-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-white">Your UGX Funds & Savings Are Safe</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                All customer balances, deposit logs, approved interest, and withdrawal records remain securely locked in our persistent ledger. Regular operations will resume automatically as soon as maintenance is restored.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Primary Currency</span>
              <span className="text-white font-bold">UGX (Ugandan Shilling)</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Minimum Deposit</span>
              <span className="text-emerald-400 font-bold">{formatUGX(5000)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-0.5">Protection Level</span>
              <span className="text-teal-400 font-bold">100% Backed Reserves</span>
            </div>
          </div>

          {(statusInfo?.reason || statusInfo?.changedAt) && (
            <div className="pt-2 text-[11px] text-slate-400 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 border-t border-slate-800/50">
              {statusInfo?.reason && (
                <span><strong className="text-slate-300">Reason:</strong> {statusInfo.reason}</span>
              )}
              {statusInfo?.changedAt && (
                <span className="font-mono text-slate-500">
                  Initiated: {new Date(statusInfo.changedAt).toLocaleString('en-UG')}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
            <span>{checking ? 'Checking Status...' : 'Check System Status'}</span>
          </button>

          <button
            onClick={() => onNavigate('admin-login')}
            className="w-full sm:flex-1 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Admin Portal</span>
          </button>
        </div>

        {checkMessage && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
            {checkMessage}
          </div>
        )}

        {/* Technical Architecture Disclosure */}
        <div className="mt-12 text-[11px] text-slate-500 max-w-lg leading-relaxed flex items-center justify-center gap-2">
          <Server className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>
            Server-side maintenance middleware is active. Administrator recovery route is preserved at <span className="font-mono text-slate-400">/admin/login</span>.
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Vaultora. Save smarter. Stay in control. All rights reserved.</p>
      </footer>
    </div>
  );
};
