import React, { useState, useEffect } from 'react';
import { 
  Wallet, TrendingUp, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, 
  PlusCircle, History, User, Lock, AlertCircle, CheckCircle2, RefreshCw, X, Copy, Check, MessageSquare, HelpCircle, Send 
} from 'lucide-react';
import { api } from '../services/api';
import { formatUGX } from '../utils/currency';

export const UserDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'deposits' | 'withdrawals' | 'savings' | 'transactions' | 'support'>('overview');

  // Support & Dispute State
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Deposit Dispute');
  const [ticketRef, setTicketRef] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);
  const [ticketReplies, setTicketReplies] = useState<Record<string, string>>({});

  // Modals
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [submittingDeposit, setSubmittingDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMethod, setDepositMethod] = useState('MTN Mobile Money');
  const [depositRef, setDepositRef] = useState('');

  // Deposit Result Modal
  const [depositResultModal, setDepositResultModal] = useState<{
    isOpen: boolean;
    success: boolean;
    amount: number;
    paymentMethod: string;
    reference?: string;
    status?: string;
    errorMessage?: string;
    timestamp: string;
  }>({
    isOpen: false,
    success: false,
    amount: 0,
    paymentMethod: '',
    timestamp: '',
  });
  const [copiedRef, setCopiedRef] = useState(false);

  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('MTN Mobile Money');
  const [destinationDetails, setDestinationDetails] = useState('');

  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [savingsAmount, setSavingsAmount] = useState('');
  const [savingsPlanName, setSavingsPlanName] = useState('Vaultora UGX High-Yield Savings');

  const fetchDashboard = async () => {
    let isFinished = false;
    const failsafeTimer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        setLoading(false);
      }
    }, 2500);

    try {
      setLoading(true);
      const [dashRes, tktRes] = await Promise.all([
        api.getUserDashboard(),
        api.getUserSupportTickets().catch(() => ({ tickets: [] }))
      ]);
      setDashboardData(dashRes);
      setSupportTickets(tktRes?.tickets || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(failsafeTimer);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && depositResultModal.isOpen) {
        setDepositResultModal(prev => ({ ...prev, isOpen: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [depositResultModal.isOpen]);

  const handleCopyReference = (ref?: string) => {
    if (!ref) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(ref);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const numAmount = Number(depositAmount);
    if (!Number.isFinite(numAmount) || numAmount < 5000) {
      const validationError = 'The minimum deposit is UGX 5,000.';
      setError(validationError);
      setShowDepositModal(false);
      setDepositResultModal({
        isOpen: true,
        success: false,
        amount: Number.isFinite(numAmount) && numAmount > 0 ? numAmount : 0,
        paymentMethod: depositMethod,
        errorMessage: validationError,
        status: 'rejected',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    try {
      setSubmittingDeposit(true);
      const res = await api.createDeposit({
        amount: numAmount,
        paymentMethod: depositMethod,
        reference: depositRef || undefined
      });
      setSuccessMsg('UGX deposit request submitted successfully! Awaiting administrator confirmation.');
      setShowDepositModal(false);
      setDepositAmount('');
      setDepositRef('');
      setDepositResultModal({
        isOpen: true,
        success: true,
        amount: res.deposit?.amount || numAmount,
        paymentMethod: res.deposit?.paymentMethod || depositMethod,
        reference: res.deposit?.reference || depositRef || undefined,
        status: res.deposit?.status || 'pending',
        timestamp: res.deposit?.createdAt || new Date().toISOString(),
      });
      fetchDashboard();
    } catch (err: any) {
      const msg = err.message || 'Failed to submit deposit';
      setError(msg);
      setShowDepositModal(false);
      setDepositResultModal({
        isOpen: true,
        success: false,
        amount: numAmount,
        paymentMethod: depositMethod,
        reference: depositRef || undefined,
        status: 'failed',
        errorMessage: msg,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setSubmittingDeposit(false);
    }
  };

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    try {
      await api.createWithdrawal({
        amount: Number(withdrawalAmount),
        payoutMethod: withdrawalMethod,
        destinationDetails
      });
      setSuccessMsg('UGX withdrawal request created successfully! Funds have been reserved.');
      setShowWithdrawalModal(false);
      setWithdrawalAmount('');
      setDestinationDetails('');
      fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to submit withdrawal');
    }
  };

  const handleSavingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const numAmount = Number(savingsAmount);
    if (!Number.isFinite(numAmount) || numAmount < 5000) {
      setError('The minimum amount required to start a savings plan is UGX 5,000.');
      return;
    }
    try {
      await api.createSavingsPlan({
        amount: numAmount,
        planName: savingsPlanName
      });
      setSuccessMsg('Funds allocated into UGX savings successfully! 2-day waiting period initiated.');
      setShowSavingsModal(false);
      setSavingsAmount('');
      fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to create savings plan');
    }
  };

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      setError('Please provide both a subject and details for your ticket.');
      return;
    }
    try {
      setSubmittingTicket(true);
      await api.createUserSupportTicket({
        subject: ticketSubject.trim(),
        category: ticketCategory,
        message: ticketMessage.trim(),
        transactionReference: ticketRef.trim() || undefined
      });
      setSuccessMsg('Your ticket/dispute has been submitted to administrators.');
      setShowTicketModal(false);
      setTicketSubject('');
      setTicketRef('');
      setTicketMessage('');
      fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to submit support ticket');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleReplyTicket = async (ticketId: string) => {
    const text = ticketReplies[ticketId]?.trim();
    if (!text) return;
    try {
      setError('');
      setSuccessMsg('');
      await api.replyUserSupportTicket(ticketId, text);
      setTicketReplies(prev => ({ ...prev, [ticketId]: '' }));
      setSuccessMsg('Reply sent successfully.');
      fetchDashboard();
    } catch (err: any) {
      setError(err.message || 'Failed to send reply');
    }
  };

  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
        Loading Vaultora Dashboard...
      </div>
    );
  }

  const stats = dashboardData?.stats || {};
  const user = dashboardData?.user || {};
  const deposits = dashboardData?.deposits || [];
  const withdrawals = dashboardData?.withdrawals || [];
  const savingsPlans = dashboardData?.savingsPlans || [];
  const credits = dashboardData?.credits || [];

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 pb-20">
      {/* Top Banner / Welcome */}
      <div className="bg-[#05070B] border-b border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified UGX Account
              </span>
              <span className="text-xs text-slate-400">Currency: {user.currency || 'UGX'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {user.fullName}</h1>
            <p className="text-xs text-slate-400 mt-1">Here is your verified Ugandan Shilling financial portfolio and savings engine.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowDepositModal(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Deposit UGX
            </button>
            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <ArrowUpRight className="w-4 h-4" /> Withdraw
            </button>
            <button
              onClick={() => setShowSavingsModal(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 font-semibold text-xs border border-teal-500/20 transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4" /> Save (8%)
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Financial Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-1">Available Balance</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white">{formatUGX(stats.availableBalance || 0)}</h3>
            <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Verified & Withdrawable
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-1">Savings Plans (8% Daily)</p>
            <h3 className="text-xl sm:text-2xl font-bold text-teal-400">{formatUGX((stats.activeSavings || 0) + (stats.pendingSavings || 0))}</h3>
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> +{formatUGX(stats.savingsEarnings || 0)} Earned
              </span>
              {(stats.pendingSavings || 0) > 0 && (
                <span className="text-[10px] text-amber-400/90 font-medium">({formatUGX(stats.pendingSavings || 0)} in waiting)</span>
              )}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-1">Deposited Principal</p>
            <h3 className="text-xl sm:text-2xl font-bold text-white">{formatUGX(stats.originalPrincipal || 0)}</h3>
            <p className="text-xs text-slate-400 mt-2">{deposits.length} total deposit records</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <p className="text-xs font-medium text-slate-400 mb-1">Reserved / Pending</p>
            <h3 className="text-xl sm:text-2xl font-bold text-amber-400">{formatUGX(stats.reservedFunds || 0)}</h3>
            <p className="text-xs text-slate-400 mt-2">{stats.pendingWithdrawalsCount || 0} pending withdrawals</p>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Overview & Portfolio
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'savings' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Savings Plans ({savingsPlans.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'deposits' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Deposits ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'withdrawals' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Withdrawals ({withdrawals.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'transactions' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            Ledger & Credits ({credits.length})
          </button>
          <button
            onClick={() => setActiveTab('support')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${activeTab === 'support' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'}`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Support & Disputes ({supportTickets.length})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4">Savings Engine Status (8% Daily & 2-Day Wait)</h3>
                <div className="space-y-4 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Default Waiting Period</p>
                      <p className="text-slate-400 text-[11px]">2 days before interest generation starts</p>
                    </div>
                    <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold">2 Days</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Target Daily Interest Rate</p>
                      <p className="text-slate-400 text-[11px]">Configured calculation basis</p>
                    </div>
                    <span className="px-3 py-1 rounded bg-teal-500/10 text-teal-400 font-bold">8.0% Daily</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-white">Minimum Savings Requirement</p>
                      <p className="text-slate-400 text-[11px]">Start your savings journey with just UGX 5,000</p>
                    </div>
                    <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 font-bold">{formatUGX(5000)}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4">Recent UGX Deposits</h3>
                {deposits.length === 0 ? (
                  <p className="text-xs text-slate-400">No deposits recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {deposits.slice(0, 3).map((d: any) => (
                      <div key={d.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div>
                          <p className="text-xs font-semibold text-white">{formatUGX(d.amount)}</p>
                          <p className="text-[10px] text-slate-400">{d.paymentMethod} · {new Date(d.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase ${d.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : d.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Account Summary */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Account Details</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Full Name</span>
                    <span className="text-white font-medium">{user.fullName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Email</span>
                    <span className="text-white font-medium">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">Phone</span>
                    <span className="text-white font-medium">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-400">Currency</span>
                    <span className="text-emerald-400 font-semibold">{user.currency || 'UGX'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'savings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Your UGX Savings Plans</h3>
                <p className="text-xs text-slate-400">Start your savings journey with just UGX 5,000.</p>
              </div>
              <button
                onClick={() => setShowSavingsModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Allocate Savings (Min UGX 5,000)
              </button>
            </div>
            {savingsPlans.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-900 border border-slate-800">
                <p className="text-xs text-slate-300 font-medium mb-1">“Start your savings journey with just UGX 5,000.”</p>
                <p className="text-xs text-slate-400 mb-4">No active savings plans found. Allocate funds from your available balance.</p>
                <button
                  onClick={() => setShowSavingsModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Create Plan (from UGX 5,000)
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savingsPlans.map((s: any) => (
                  <div key={s.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold text-white">{s.planName}</h4>
                        <p className="text-xs text-slate-400">Created: {new Date(s.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase ${s.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-800 text-xs">
                      <div>
                        <p className="text-slate-400">Principal</p>
                        <p className="text-base font-bold text-white">{formatUGX(s.amount)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Earned Interest</p>
                        <p className="text-base font-bold text-emerald-400">+{formatUGX(s.earnedInterest || 0)}</p>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Rate: {(s.dailyRate * 100)}% Daily</span>
                      <span>Activation: {new Date(s.activationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'deposits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Deposit History (UGX)</h3>
              <button
                onClick={() => setShowDepositModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
              >
                New Deposit
              </button>
            </div>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {deposits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">No deposit records found.</td>
                    </tr>
                  ) : (
                    deposits.map((d: any) => (
                      <tr key={d.id} className="hover:bg-slate-850/50">
                        <td className="p-4 font-mono text-slate-300">{d.reference}</td>
                        <td className="p-4 font-bold text-white">{formatUGX(d.amount)}</td>
                        <td className="p-4 text-slate-400">{d.paymentMethod}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${d.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : d.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(d.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Withdrawal History (UGX)</h3>
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
              >
                Request Withdrawal
              </button>
            </div>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">ID</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Fee</th>
                    <th className="p-4">Net Payout</th>
                    <th className="p-4">Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">No withdrawal records found.</td>
                    </tr>
                  ) : (
                    withdrawals.map((w: any) => (
                      <tr key={w.id} className="hover:bg-slate-850/50">
                        <td className="p-4 font-mono text-slate-300">{w.id.substring(0, 10)}...</td>
                        <td className="p-4 font-bold text-white">{formatUGX(w.amount)}</td>
                        <td className="p-4 text-slate-400">{formatUGX(w.fee)}</td>
                        <td className="p-4 font-bold text-emerald-400">{formatUGX(w.netAmount)}</td>
                        <td className="p-4 text-slate-400">{w.payoutMethod}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${w.status === 'completed' || w.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : w.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(w.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-white">Verified UGX Credits & Bonuses</h3>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Reference</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Reason</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {credits.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">No credits issued.</td>
                    </tr>
                  ) : (
                    credits.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-850/50">
                        <td className="p-4 font-mono text-slate-300">{c.reference}</td>
                        <td className="p-4 font-bold text-emerald-400">+{formatUGX(c.amount)}</td>
                        <td className="p-4 text-slate-300">{c.category}</td>
                        <td className="p-4 text-slate-400">{c.reason}</td>
                        <td className="p-4 text-slate-400">{new Date(c.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Support & Disputes Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Support Tickets & Transaction Disputes</h3>
                <p className="text-xs text-slate-400">Submit an inquiry or dispute directly to financial administrators.</p>
              </div>
              <button
                onClick={() => setShowTicketModal(true)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" /> Open New Ticket / Dispute
              </button>
            </div>

            {supportTickets.length === 0 ? (
              <div className="text-center py-12 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-sm font-semibold text-white">No Support Tickets or Disputes</p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Your account and transactions are in good standing. If you ever have a question or need to dispute a transfer, open a ticket here.
                </p>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700"
                >
                  Create Support Request
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {supportTickets.map((t: any) => (
                  <div key={t.id} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{t.subject}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {t.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Ticket ID: <span className="font-mono text-slate-300">{t.id}</span>
                          {t.transactionReference && (
                            <span className="ml-2">· Ref: <span className="font-mono text-emerald-400">{t.transactionReference}</span></span>
                          )}
                          <span className="ml-2">· Opened: {new Date(t.createdAt).toLocaleString()}</span>
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase self-start sm:self-auto ${t.status === 'open' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {t.messages?.map((msg: any, i: number) => (
                        <div 
                          key={i} 
                          className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                            msg.sender === 'admin' 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 ml-4' 
                              : 'bg-slate-950 border border-slate-800 text-slate-300 mr-4'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 text-[10px] text-slate-400 font-medium">
                            <span className={msg.sender === 'admin' ? 'font-bold text-emerald-400' : 'font-bold text-slate-300'}>
                              {msg.sender === 'admin' ? 'VAULTORA SUPPORT ADMIN' : 'YOU'}
                            </span>
                            {msg.timestamp && <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>}
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Type reply to administrator..."
                        value={ticketReplies[t.id] || ''}
                        onChange={(e) => setTicketReplies(prev => ({ ...prev, [t.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleReplyTicket(t.id);
                          }
                        }}
                        className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleReplyTicket(t.id)}
                        className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Support Ticket / Dispute Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">Open Support Ticket / Dispute</h3>
                <p className="text-xs text-slate-400 mt-0.5">Direct communication with Vaultora administrators</p>
              </div>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleTicketSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  <option value="Deposit Dispute">Deposit Dispute / Delay</option>
                  <option value="Withdrawal Inquiry">Withdrawal / Payout Status</option>
                  <option value="Savings Plan">Savings Plan & Interest Inquiry</option>
                  <option value="Account & Security">Account & Security</option>
                  <option value="General Inquiry">General Question</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Mobile Money Deposit Confirmation"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Transaction Reference (Optional)</label>
                <input
                  type="text"
                  value={ticketRef}
                  onChange={(e) => setTicketRef(e.target.value)}
                  placeholder="e.g. UGX-TX-... or MOMO Ref"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Message Details</label>
                <textarea
                  required
                  rows={4}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your inquiry or transaction details clearly..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket || !ticketSubject.trim() || !ticketMessage.trim()}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submittingTicket ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Savings Allocation Modal */}
      {showSavingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Allocate Into UGX Savings</h3>
                <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                  “Start your savings journey with just UGX 5,000.”
                </p>
              </div>
              <button onClick={() => setShowSavingsModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavingsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">Plan Name</label>
                <input
                  type="text"
                  value={savingsPlanName}
                  onChange={(e) => setSavingsPlanName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-slate-300">Amount to Save (UGX)</label>
                  <span className="text-[11px] font-bold text-emerald-400">Minimum: UGX 5,000</span>
                </div>
                <input
                  type="number"
                  required
                  min="5000"
                  step="500"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 5000"
                />
                <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-400">
                  <span>Available Balance: <strong className="text-white">{formatUGX(stats.availableBalance || 0)}</strong></span>
                  {Number(savingsAmount) > 0 && Number(savingsAmount) < 5000 && (
                    <span className="text-red-400 font-semibold">Minimum is UGX 5,000</span>
                  )}
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1.5">Convenient Amount Options:</label>
                <div className="grid grid-cols-4 gap-2">
                  {[5000, 10000, 20000, 50000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setSavingsAmount(amt.toString())}
                      className={`py-2 px-1 text-center rounded-lg text-[11px] font-semibold border transition-all ${
                        savingsAmount === amt.toString()
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {amt >= 1000 ? `${amt / 1000}k` : amt} UGX
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-emerald-400">Savings Terms & Waiting Period:</p>
                <p>• Initial 2-day waiting period before interest begins.</p>
                <p>• 8% daily calculation rate upon admin execution.</p>
                <p>• Start your savings journey with just UGX 5,000.</p>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSavingsModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!savingsAmount || Number(savingsAmount) < 5000 || Number(savingsAmount) > (stats.availableBalance || 0)}
                  className="flex-1 py-3 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-teal-500/20"
                >
                  Start Saving
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Result & Transaction Details Modal */}
      {depositResultModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setDepositResultModal(prev => ({ ...prev, isOpen: false }));
            }
          }}
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Transaction Receipt & Summary
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Deposit Attempt Summary
                </h3>
              </div>
              <button
                onClick={() => setDepositResultModal(prev => ({ ...prev, isOpen: false }))}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Hero Card */}
            <div
              className={`p-5 rounded-xl border flex items-center gap-4 ${
                depositResultModal.success
                  ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  : 'bg-red-500/10 border-red-500/25 text-red-400'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  depositResultModal.success
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {depositResultModal.success ? (
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                ) : (
                  <AlertCircle className="w-7 h-7 stroke-[2.5]" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  {depositResultModal.success ? 'Success · Request Submitted' : 'Failure · Request Rejected'}
                </span>
                <h4 className="text-2xl font-extrabold text-white tracking-tight mt-0.5">
                  {formatUGX(depositResultModal.amount)}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {depositResultModal.success
                    ? 'Your deposit request has been registered and is pending verification.'
                    : depositResultModal.errorMessage || 'Deposit request failed validation.'}
                </p>
              </div>
            </div>

            {/* Transaction Breakdown Table / Card */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Amount</span>
                <span className="font-bold text-white text-sm">
                  {formatUGX(depositResultModal.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Currency</span>
                <span className="text-slate-200 font-medium">UGX (Ugandan Shilling)</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Payment Channel</span>
                <span className="text-slate-200 font-medium">{depositResultModal.paymentMethod}</span>
              </div>
              {depositResultModal.reference && (
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                  <span className="text-slate-400">Reference ID</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-emerald-400 font-semibold text-[11px]">
                      {depositResultModal.reference}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyReference(depositResultModal.reference)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-300 transition-colors"
                      title="Copy reference"
                    >
                      {copiedRef ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/80">
                <span className="text-slate-400">Status</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    depositResultModal.success
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}
                >
                  {depositResultModal.status || (depositResultModal.success ? 'pending' : 'failed')}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Attempt Timestamp</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {depositResultModal.timestamp ? new Date(depositResultModal.timestamp).toLocaleString('en-UG') : 'Just now'}
                </span>
              </div>
            </div>

            {/* Explanatory notice */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/70 text-[11px] text-slate-400 leading-relaxed">
              {depositResultModal.success ? (
                <>
                  <p className="text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verification Protocol
                  </p>
                  To complete settlement, confirm the prompt on your mobile money line (MTN / Airtel) or ensure your bank transfer quotes reference <span className="font-mono text-slate-200">{depositResultModal.reference}</span>. Verified deposits are credited directly to your available balance.
                </>
              ) : (
                <>
                  <p className="text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400" /> Resolution Guidance
                  </p>
                  No funds were deducted. Please verify that the deposit amount is at least <span className="text-slate-200 font-semibold">{formatUGX(5000)}</span> and that your account details are valid before trying again.
                </>
              )}
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-3">
              {depositResultModal.success ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setDepositResultModal(prev => ({ ...prev, isOpen: false }));
                      setActiveTab('deposits');
                    }}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    View Deposits History
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositResultModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setDepositResultModal(prev => ({ ...prev, isOpen: false }))}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Dismiss
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDepositResultModal(prev => ({ ...prev, isOpen: false }));
                      setShowDepositModal(true);
                    }}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Try Again
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
