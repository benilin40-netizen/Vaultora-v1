import React from 'react';
import { ShieldCheck, TrendingUp, Lock, ArrowRight, CheckCircle2, Clock, Wallet, BarChart3, Users } from 'lucide-react';
import { formatUGX } from '../utils/currency';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100">
      {/* Hero Section */}
      <section id="overview" className="relative overflow-hidden pt-24 pb-20 lg:pt-32 lg:pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-[#090D16] to-[#090D16] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Vaultora UGX Savings & Treasury Platform v1.0
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
              Save smarter in UGX. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
                Stay in control.
              </span>
            </h1>
            <p className="text-lg text-slate-300 mb-10 leading-relaxed">
              Experience disciplined wealth preservation and high-yield savings in Ugandan Shillings (UGX). Start your savings journey with just UGX 5,000, enjoy transparent 8% daily calculation engine with a 2-day waiting period, and institutional audit controls.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('user-register')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                Open Free UGX Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('user-login')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-sm transition-all"
              >
                Sign In to Dashboard
              </button>
            </div>
          </div>

          {/* Hero Platform Specification Card */}
          <div className="mt-16 max-w-5xl mx-auto rounded-2xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#05090F] p-0.5 border border-amber-500/30 shadow-md">
                  <img src="/favicon.svg" alt="Valutora Emblem" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Vaultora Treasury Ledger (UGX)</h3>
                  <p className="text-xs text-slate-400">Deterministic Monetary Arithmetic & High-Yield Engine</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                  Audited Ledger
                </span>
                <span className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium">
                  UGX (Shs)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <p className="text-xs font-medium text-slate-400 mb-1">Minimum Savings Entry</p>
                <h4 className="text-2xl font-bold text-emerald-400">{formatUGX(5000)}</h4>
                <p className="text-xs text-slate-300 mt-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Start saving with just UGX 5,000
                </p>
              </div>
              <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <p className="text-xs font-medium text-slate-400 mb-1">High-Yield Rate Basis</p>
                <h4 className="text-2xl font-bold text-teal-400">8.0% Daily</h4>
                <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> 2-Day Structured Verification Window
                </p>
              </div>
              <div className="p-5 rounded-xl bg-slate-950/50 border border-slate-800/80">
                <p className="text-xs font-medium text-slate-400 mb-1">Initial Balance Basis</p>
                <h4 className="text-2xl font-bold text-white">{formatUGX(0)}</h4>
                <p className="text-xs text-slate-400 mt-2">Zero fictional seed funds; genuine ledger</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Savings Engine Feature Section */}
      <section id="savings-engine" className="py-24 bg-[#05070B] border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">The Vaultora Savings Engine in UGX</h2>
            <p className="text-sm text-slate-400">
              Designed with precision monetary arithmetic, idempotent calculations, and structured waiting periods for Ugandan Shilling accounts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">1. Two-Day Waiting Period</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every newly funded UGX savings allocation undergoes an initial 2-day verification and waiting window before daily interest calculations commence.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">2. 8% Daily Rate Basis</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Configurable daily calculation basis yielding structured UGX interest credits upon successful admin-authorized idempotent daily runs.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Immutable Ledger Records</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete separation of deposited UGX principal, savings transfers, bonuses, and withdrawable funds backed by append-only ledger entries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Features & Security */}
      <section id="security" className="py-24 bg-[#090D16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">MTN Mobile Money & Airtel Money Integration</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Verified UGX Deposits & Payouts</h4>
                    <p className="text-xs text-slate-400">Strict server-side verification workflows prevent duplicate requests and guarantee safe UGX capital handling.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Advanced Role-Based Admin Panel</h4>
                    <p className="text-xs text-slate-400">Super Admin, Finance Admin, and Support Admin roles with complete audit logs and UGX treasury tracking.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">Exact Ugandan Shillings Arithmetic</h4>
                    <p className="text-xs text-slate-400">Precise UGX integer rounding and atomic balance reservations eliminate calculation discrepancies.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
              <h3 className="text-lg font-bold text-white">Start your savings journey with just UGX 5,000</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Deposit through MTN Mobile Money, Airtel Money, or bank wire. Allocate funds into high-yield savings plans with transparent 8% daily compounding.
              </p>
              <button
                onClick={() => onNavigate('user-register')}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                Create Your Vaultora UGX Account
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faq" className="py-24 bg-[#05070B] border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400">Everything you need to know about Vaultora UGX accounts and savings engine.</p>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">What is the minimum amount required to start saving?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                You can start your savings journey with as little as <strong>UGX 5,000</strong>. Both the minimum deposit and minimum savings plan allocation are set to UGX 5,000.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">How does the 2-day waiting period work?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When you allocate funds into a savings plan, an initial 2-day verification window begins. Once the 2-day period elapses, the plan activates and begins earning 8% daily interest upon each scheduled calculation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">How do I deposit and withdraw funds?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We support MTN Mobile Money, Airtel Money, and standard bank wire transfers. Deposits are verified through transaction reference numbers and credited to your available balance.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-2">How can I dispute a transaction or get help?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inside your user dashboard, navigate to the Support & Disputes tab to open a ticket directly with financial administrators, referencing any deposit or withdrawal transaction for immediate review.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
