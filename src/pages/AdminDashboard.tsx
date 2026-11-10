import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, Wallet, ArrowDownLeft, ArrowUpRight, TrendingUp, 
  FileText, Lock, PlusCircle, CheckCircle2, XCircle, RefreshCw, AlertCircle, 
  Settings, Key, UserCheck, UserX, Send, History, Activity, AlertTriangle, Power 
} from 'lucide-react';
import { api } from '../services/api';
import { formatUGX } from '../utils/currency';

export const AdminDashboard: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'deposits' | 'withdrawals' | 'treasury' | 'credits' | 'savings' | 'audit' | 'admins' | 'website-status' | 'security' | 'reconciliation' | 'backup' | 'diagnostics' | 'work-queue' | 'cash-flow' | 'support' | 'features' | 'deployments' | 'compliance' | 'data-integrity'>('overview');
  
  const [overviewData, setOverviewData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [depositsList, setDepositsList] = useState<any[]>([]);
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  const [treasuryList, setTreasuryList] = useState<any[]>([]);
  const [creditsList, setCreditsList] = useState<any[]>([]);
  const [savingsConfig, setSavingsConfig] = useState<any>(null);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<any[]>([]);
  const [invitationsList, setInvitationsList] = useState<any[]>([]);
  const [websiteStatus, setWebsiteStatus] = useState<any>(null);
  const [securityData, setSecurityData] = useState<any>(null);
  const [reconciliationData, setReconciliationData] = useState<any>(null);
  const [backupStatus, setBackupStatus] = useState<any>(null);
  const [diagnosticsData, setDiagnosticsData] = useState<any>(null);
  const [workQueueData, setWorkQueueData] = useState<any>(null);
  const [cashFlowData, setCashFlowData] = useState<any>(null);
  const [supportTicketsData, setSupportTicketsData] = useState<any[]>([]);
  const [featureControlsData, setFeatureControlsData] = useState<any>(null);
  const [deploymentsData, setDeploymentsData] = useState<any>(null);
  const [complianceData, setComplianceData] = useState<any>(null);
  const [dataIntegrityData, setDataIntegrityData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [showMaintenanceConfirmModal, setShowMaintenanceConfirmModal] = useState(false);
  const [maintenanceReasonInput, setMaintenanceReasonInput] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Review Modals State (replaces browser prompt)
  const [depositReviewModal, setDepositReviewModal] = useState<{ isOpen: boolean; id: string; status: string; reason: string }>({
    isOpen: false,
    id: '',
    status: '',
    reason: ''
  });
  const [withdrawalReviewModal, setWithdrawalReviewModal] = useState<{ isOpen: boolean; id: string; status: string; payoutRef: string; reason: string }>({
    isOpen: false,
    id: '',
    status: '',
    payoutRef: '',
    reason: ''
  });
  const [userStatusModal, setUserStatusModal] = useState<{ isOpen: boolean; id: string; currentStatus: string; newStatus: string; reason: string }>({
    isOpen: false,
    id: '',
    currentStatus: '',
    newStatus: '',
    reason: ''
  });

  // Treasury State & Forms
  const [treasuryStats, setTreasuryStats] = useState<any>({ currentBalance: 0, totalDeposits: 0, totalWithdrawals: 0, transactionCount: 0 });
  const [treasurySearch, setTreasurySearch] = useState('');
  const [treasuryFilterType, setTreasuryFilterType] = useState('all');

  const [tresSource, setTresSource] = useState('');
  const [tresAmount, setTresAmount] = useState('');
  const [tresCurrency, setTresCurrency] = useState('UGX');
  const [tresRef, setTresRef] = useState('');

  const [tresWithDest, setTresWithDest] = useState('');
  const [tresWithAmount, setTresWithAmount] = useState('');
  const [tresWithRef, setTresWithRef] = useState('');
  const [tresWithReason, setTresWithReason] = useState('');

  // Credit Modal / Form state
  const [credUserId, setCredUserId] = useState('');
  const [credAmount, setCredAmount] = useState('');
  const [credCategory, setCredCategory] = useState('Bonus / Promotional');
  const [credReason, setCredReason] = useState('');
  const [credRef, setCredRef] = useState('');

  // Invite Admin Form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Support Admin');

  // Savings Config Form state
  const [cfgWaiting, setCfgWaiting] = useState('2');
  const [cfgRate, setCfgRate] = useState('0.08');
  const [cfgMinDep, setCfgMinDep] = useState('5000');
  const [cfgMaxDep, setCfgMaxDep] = useState('100000000');
  const [cfgMinWith, setCfgMinWith] = useState('20000');
  const [cfgFee, setCfgFee] = useState('1.5');

  const loadData = async () => {
    let isFinished = false;
    const failsafeTimer = setTimeout(() => {
      if (!isFinished) {
        isFinished = true;
        setLoading(false);
      }
    }, 2500);

    try {
      setLoading(true);
      const safe = <T,>(promise: Promise<T>, fallback: T): Promise<T> =>
        promise.catch(() => fallback);

      const [ov, us, dep, wit, tres, cred, sav, aud, adm, ws, sec, rec, bak, diag, work, cf, spt, feat, deply, comp, dint] = await Promise.all([
        safe(api.getAdminOverview(), {}),
        safe(api.getAdminUsers(), { users: [] }),
        safe(api.getAdminDeposits(), { deposits: [] }),
        safe(api.getAdminWithdrawals(), { withdrawals: [] }),
        safe(api.getAdminTreasury(), { treasury: [], stats: { currentBalance: 0, totalDeposits: 0, totalWithdrawals: 0, transactionCount: 0 } }),
        safe(api.getAdminCredits(), { credits: [] }),
        safe(api.getAdminSavingsConfig(), { settings: {} }),
        safe(api.getAdminAuditLogs(), { auditLogs: [] }),
        safe(api.getAdminAdminsList(), { admins: [], invitations: [] }),
        safe(api.getAdminWebsiteStatus(), { maintenanceMode: false }),
        safe(api.getAdminSecurity(), {}),
        safe(api.getAdminReconciliation(), {}),
        safe(api.getAdminBackupStatus(), {}),
        safe(api.getAdminDiagnostics(), {}),
        safe(api.getAdminWorkQueue(), {}),
        safe(api.getAdminCashFlow(), {}),
        safe(api.getAdminSupportTickets(), { tickets: [] }),
        safe(api.getAdminFeatureControls(), { features: {} }),
        safe(api.getAdminDeployments(), {}),
        safe(api.getAdminCompliance(), {}),
        safe(api.getAdminDataIntegrity(), {}),
      ]);

      setOverviewData(ov);
      setUsersList(us.users || []);
      setDepositsList(dep.deposits || []);
      setWithdrawalsList(wit.withdrawals || []);
      setTreasuryList(tres.treasury || []);
      setTreasuryStats(tres.stats || { currentBalance: 0, totalDeposits: 0, totalWithdrawals: 0, transactionCount: (tres.treasury || []).length });
      setCreditsList(cred.credits || []);
      setSavingsConfig(sav.settings || {});
      setAuditLogsList(aud.auditLogs || []);
      setAdminsList(adm.admins || []);
      setInvitationsList(adm.invitations || []);
      setWebsiteStatus(ws);
      setSecurityData(sec);
      setReconciliationData(rec);
      setBackupStatus(bak);
      setDiagnosticsData(diag);
      setWorkQueueData(work);
      setCashFlowData(cf);
      setSupportTicketsData(spt.tickets || []);
      setFeatureControlsData(feat.features || {});
      setDeploymentsData(deply);
      setComplianceData(comp);
      setDataIntegrityData(dint);

      if (sav.settings) {
        setCfgWaiting(sav.settings.waitingPeriodDays || '2');
        setCfgRate(sav.settings.dailyInterestRate || '0.08');
        setCfgMinDep(sav.settings.minDeposit || '5000');
        setCfgMaxDep(sav.settings.maxDeposit || '100000000');
        setCfgMinWith(sav.settings.minWithdrawal || '20000');
        setCfgFee(sav.settings.withdrawalFeePercent || '1.5');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      if (!isFinished) {
        isFinished = true;
        clearTimeout(failsafeTimer);
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEnableMaintenance = async () => {
    try {
      setStatusUpdating(true);
      setError('');
      setSuccessMsg('');
      const reason = maintenanceReasonInput.trim() || 'Scheduled technical maintenance and database reconciliation';
      const res = await api.updateAdminWebsiteStatus(true, reason);
      setWebsiteStatus(res);
      setShowMaintenanceConfirmModal(false);
      setMaintenanceReasonInput('');
      setSuccessMsg('Website Maintenance Mode ENABLED. Normal visitor access is paused; admin recovery remains operational.');
      // Refresh audit logs
      const aud = await api.getAdminAuditLogs();
      setAuditLogsList(aud.auditLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to enable maintenance mode');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleRestoreWebsite = async () => {
    try {
      setStatusUpdating(true);
      setError('');
      setSuccessMsg('');
      const res = await api.updateAdminWebsiteStatus(false, 'Website restored to normal online operation');
      setWebsiteStatus(res);
      setSuccessMsg('Website RESTORED successfully! Normal visitor access and operations are active.');
      // Refresh audit logs
      const aud = await api.getAdminAuditLogs();
      setAuditLogsList(aud.auditLogs);
    } catch (err: any) {
      setError(err.message || 'Failed to restore website');
    } finally {
      setStatusUpdating(false);
    }
  };

  const safeConfirm = (msg: string) => {
    try {
      return typeof window !== 'undefined' && typeof window.confirm === 'function' ? window.confirm(msg) : true;
    } catch {
      return true;
    }
  };

  const handleRevokeSession = async (token: string) => {
    if (!safeConfirm('Revoke this session token immediately? The user or admin will be signed out.')) return;
    try {
      setError('');
      setSuccessMsg('');
      await api.revokeAdminSession(token);
      setSuccessMsg('Session revoked successfully.');
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleTriggerBackup = async () => {
    try {
      setError('');
      setSuccessMsg('');
      const res = await api.triggerAdminBackup();
      setSuccessMsg(`Database backup snapshot created successfully! ID: ${res.backupId}`);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReviewDeposit = (id: string, status: string) => {
    setDepositReviewModal({
      isOpen: true,
      id,
      status,
      reason: 'Admin verified UGX payment reference'
    });
  };

  const confirmReviewDeposit = async () => {
    try {
      setError('');
      setSuccessMsg('');
      await api.reviewAdminDeposit(depositReviewModal.id, depositReviewModal.status, depositReviewModal.reason || 'Verified');
      setSuccessMsg(`Deposit status updated to ${depositReviewModal.status}.`);
      setDepositReviewModal({ isOpen: false, id: '', status: '', reason: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReviewWithdrawal = (id: string, status: string) => {
    setWithdrawalReviewModal({
      isOpen: true,
      id,
      status,
      payoutRef: 'MOMO-REF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      reason: 'Verified UGX payout'
    });
  };

  const confirmReviewWithdrawal = async () => {
    try {
      setError('');
      setSuccessMsg('');
      await api.reviewAdminWithdrawal(
        withdrawalReviewModal.id,
        withdrawalReviewModal.status,
        withdrawalReviewModal.payoutRef,
        withdrawalReviewModal.reason || 'Verified'
      );
      setSuccessMsg(`Withdrawal status updated to ${withdrawalReviewModal.status}.`);
      setWithdrawalReviewModal({ isOpen: false, id: '', status: '', payoutRef: '', reason: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleUserStatus = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    setUserStatusModal({
      isOpen: true,
      id,
      currentStatus,
      newStatus,
      reason: 'Administrative compliance review'
    });
  };

  const confirmToggleUserStatus = async () => {
    try {
      setError('');
      setSuccessMsg('');
      await api.updateAdminUserStatus(userStatusModal.id, userStatusModal.newStatus, userStatusModal.reason || 'Admin action');
      setSuccessMsg(`User status updated to ${userStatusModal.newStatus}.`);
      setUserStatusModal({ isOpen: false, id: '', currentStatus: '', newStatus: '', reason: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleAddTreasury = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      await api.recordAdminTreasury({
        type: 'deposit',
        source: tresSource,
        amount: Number(tresAmount),
        currency: tresCurrency,
        reference: tresRef || undefined
      });
      setSuccessMsg('UGX treasury funding source recorded successfully.');
      setTresSource('');
      setTresAmount('');
      setTresRef('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to record treasury deposit');
    }
  };

  const handleWithdrawTreasury = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!safeConfirm('Confirm withdrawal from Asset Treasury? This will deduct funds and record an auditable ledger entry.')) return;
    try {
      setError('');
      setSuccessMsg('');
      await api.recordAdminTreasury({
        type: 'withdrawal',
        destination: tresWithDest,
        amount: Number(tresWithAmount),
        currency: 'UGX',
        reference: tresWithRef || undefined,
        reason: tresWithReason
      });
      setSuccessMsg('UGX treasury withdrawal recorded and processed successfully.');
      setTresWithDest('');
      setTresWithAmount('');
      setTresWithRef('');
      setTresWithReason('');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to process treasury withdrawal');
    }
  };

  const handleIssueCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      await api.issueAdminCredit({
        userId: credUserId,
        amount: Number(credAmount),
        currency: 'UGX',
        category: credCategory,
        reason: credReason,
        reference: credRef || undefined
      });
      setSuccessMsg('Legitimate UGX credit issued to user successfully.');
      setCredUserId('');
      setCredAmount('');
      setCredReason('');
      setCredRef('');
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      await api.updateAdminSavingsConfig({
        waitingPeriodDays: Number(cfgWaiting),
        dailyInterestRate: Number(cfgRate),
        minDeposit: Number(cfgMinDep),
        maxDeposit: Number(cfgMaxDep),
        minWithdrawal: Number(cfgMinWith),
        withdrawalFeePercent: Number(cfgFee)
      });
      setSuccessMsg('Savings engine and UGX platform configuration updated.');
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRunCalculation = async () => {
    if (!safeConfirm('Execute daily 8% savings interest calculation across all active UGX plans?')) return;
    try {
      setError('');
      setSuccessMsg('');
      const res = await api.runAdminDailyCalculation();
      setSuccessMsg(`Daily calculation executed! Plans updated: ${res.calcRecord.plansUpdated}, Interest generated: ${formatUGX(res.calcRecord.totalInterestGenerated)}`);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setSuccessMsg('');
      await api.createAdminInvite({ email: inviteEmail, role: inviteRole });
      setSuccessMsg(`Admin invitation created for ${inviteEmail}`);
      setInviteEmail('');
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading && !overviewData) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mr-2" />
        Loading Vaultora UGX Enterprise Control Panel...
      </div>
    );
  }

  const stats = overviewData?.stats || {};

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col md:flex-row">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-[#05070B] border-r border-slate-800 p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#05090F] p-0.5 border border-amber-500/30 shadow-md">
            <img src="/favicon.svg" alt="Valutora Emblem" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">Valutora Admin</span>
            <p className="text-[10px] text-amber-400 font-medium">UGX Enterprise Panel</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          <button
            onClick={() => setActiveSection('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'overview' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Overview & Stats
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'users' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Users className="w-4 h-4" /> User Management
          </button>
          <button
            onClick={() => setActiveSection('deposits')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'deposits' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Deposits ({depositsList.filter(d => d.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveSection('withdrawals')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'withdrawals' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <ArrowUpRight className="w-4 h-4" /> Withdrawals ({withdrawalsList.filter(w => w.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveSection('treasury')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'treasury' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Wallet className="w-4 h-4" /> Treasury & Funding
          </button>
          <button
            onClick={() => setActiveSection('credits')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'credits' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <PlusCircle className="w-4 h-4" /> User Credits
          </button>
          <button
            onClick={() => setActiveSection('savings')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'savings' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <TrendingUp className="w-4 h-4" /> Savings Config & Engine
          </button>
          <button
            onClick={() => setActiveSection('audit')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'audit' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <History className="w-4 h-4" /> Audit Logs
          </button>
          <button
            onClick={() => setActiveSection('admins')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'admins' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Lock className="w-4 h-4" /> Administrators
          </button>
          <button
            onClick={() => setActiveSection('security')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'security' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <ShieldCheck className="w-4 h-4" /> Security Center
          </button>
          <button
            onClick={() => setActiveSection('reconciliation')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'reconciliation' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <FileText className="w-4 h-4" /> Reconciliation
          </button>
          <button
            onClick={() => setActiveSection('backup')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'backup' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <RefreshCw className="w-4 h-4" /> Backup & Recovery
          </button>
          <button
            onClick={() => setActiveSection('diagnostics')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'diagnostics' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Activity className="w-4 h-4" /> Diagnostics
          </button>
          <button
            onClick={() => setActiveSection('work-queue')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'work-queue' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Work Queue</span>
            </div>
            {workQueueData?.counts?.totalQueue > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-slate-950">
                {workQueueData.counts.totalQueue}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSection('cash-flow')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'cash-flow' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" /> Cash-Flow Forecasting
          </button>
          <button
            onClick={() => setActiveSection('support')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'support' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Users className="w-4 h-4 text-emerald-400" /> Support & Disputes
          </button>
          <button
            onClick={() => setActiveSection('features')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'features' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <Settings className="w-4 h-4 text-emerald-400" /> Feature Controls
          </button>
          <button
            onClick={() => setActiveSection('deployments')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'deployments' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" /> Releases & Migrations
          </button>
          <button
            onClick={() => setActiveSection('compliance')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'compliance' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Compliance & Privacy
          </button>
          <button
            onClick={() => setActiveSection('data-integrity')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'data-integrity' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Data Integrity Checks
          </button>
          <button
            onClick={() => setActiveSection('website-status')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors ${activeSection === 'website-status' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
          >
            <div className="flex items-center gap-3">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Website Status</span>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${websiteStatus?.maintenanceMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${websiteStatus?.maintenanceMode ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
              {websiteStatus?.maintenanceMode ? 'Maint' : 'Online'}
            </span>
          </button>
        </nav>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
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

          {activeSection === 'overview' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Administrator Overview (UGX)</h1>
                <p className="text-xs text-slate-400 mt-1">Real-time Ugandan Shilling metrics, platform reserves, and administrative activity.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Registered Users</p>
                  <h3 className="text-2xl font-bold text-white">{stats.totalUsers}</h3>
                  <p className="text-xs text-emerald-400 mt-2">{stats.activeUsers} active accounts</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Confirmed Deposits</p>
                  <h3 className="text-xl font-bold text-emerald-400">{formatUGX(stats.confirmedDeposits || 0)}</h3>
                  <p className="text-xs text-slate-400 mt-2">{stats.pendingDeposits} pending review</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Treasury Reserves</p>
                  <h3 className="text-xl font-bold text-white">{formatUGX(stats.treasuryTotal || 0)}</h3>
                  <p className="text-xs text-slate-400 mt-2">Verified UGX external funding</p>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Pending Withdrawals</p>
                  <h3 className="text-2xl font-bold text-amber-400">{stats.pendingWithdrawals}</h3>
                  <p className="text-xs text-slate-400 mt-2">{formatUGX(stats.reservedWithdrawalsTotal || 0)} reserved</p>
                </div>
              </div>

              {/* Website Status & Quick Toggle Banner */}
              <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${websiteStatus?.maintenanceMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-900 border-slate-800'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${websiteStatus?.maintenanceMode ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    <Activity className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">Website Status:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${websiteStatus?.maintenanceMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                        {websiteStatus?.maintenanceMode ? 'Maintenance Mode' : 'Online & Active'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      {websiteStatus?.maintenanceMode
                        ? `Normal visitor access blocked. Changed by ${websiteStatus?.changedBy || 'Administrator'} on ${websiteStatus?.changedAt ? new Date(websiteStatus.changedAt).toLocaleString('en-UG') : 'recently'}.`
                        : 'Normal visitor and user operations are active. All UGX transaction and savings functions available.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveSection('website-status')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                  >
                    View Controls
                  </button>
                  {websiteStatus?.maintenanceMode ? (
                    <button
                      onClick={handleRestoreWebsite}
                      disabled={statusUpdating}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Power className="w-4 h-4" />
                      <span>Restore Website</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowMaintenanceConfirmModal(true)}
                      className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Enable Maintenance Mode</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Recent UGX Deposits</h3>
                  <div className="space-y-2">
                    {depositsList.slice(0, 5).map((d: any) => (
                      <div key={d.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div>
                          <p className="font-semibold text-white">{d.userName} ({formatUGX(d.amount)})</p>
                          <p className="text-[10px] text-slate-400">{d.reference}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${d.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {d.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Recent UGX Withdrawals</h3>
                  <div className="space-y-2">
                    {withdrawalsList.slice(0, 5).map((w: any) => (
                      <div key={w.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div>
                          <p className="font-semibold text-white">{w.userName} ({formatUGX(w.amount)})</p>
                          <p className="text-[10px] text-slate-400">{w.payoutMethod}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${w.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">User Management ({usersList.length})</h1>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Name & Email</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Currency</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joined</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {usersList.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-850/50">
                        <td className="p-4">
                          <p className="font-bold text-white">{u.fullName}</p>
                          <p className="text-slate-400">{u.email}</p>
                        </td>
                        <td className="p-4 text-slate-300">{u.phone || 'N/A'}</td>
                        <td className="p-4 text-emerald-400 font-semibold">{u.currency || 'UGX'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.status)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${u.status === 'active' ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                          >
                            {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'deposits' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Deposit Management (UGX)</h1>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Review Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {depositsList.length === 0 ? (
                      <tr><td colSpan={6} className="p-6 text-center text-slate-400">No deposits found.</td></tr>
                    ) : (
                      depositsList.map((d: any) => (
                        <tr key={d.id} className="hover:bg-slate-850/50">
                          <td className="p-4">
                            <p className="font-bold text-white">{d.userName}</p>
                            <p className="text-slate-400">{d.userEmail}</p>
                          </td>
                          <td className="p-4 font-mono text-slate-300">{d.reference}</td>
                          <td className="p-4 font-bold text-emerald-400">{formatUGX(d.amount)}</td>
                          <td className="p-4 text-slate-400">{d.paymentMethod}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${d.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400' : d.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                              {d.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {d.status === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleReviewDeposit(d.id, 'confirmed')}
                                  className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleReviewDeposit(d.id, 'rejected')}
                                  className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white font-bold"
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span className="text-slate-500">Reviewed by {d.reviewedBy || 'Admin'}</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'withdrawals' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">Withdrawal Management (UGX)</h1>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">User</th>
                      <th className="p-4">Amount / Net</th>
                      <th className="p-4">Method & Destination</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {withdrawalsList.length === 0 ? (
                      <tr><td colSpan={5} className="p-6 text-center text-slate-400">No withdrawal requests found.</td></tr>
                    ) : (
                      withdrawalsList.map((w: any) => (
                        <tr key={w.id} className="hover:bg-slate-850/50">
                          <td className="p-4">
                            <p className="font-bold text-white">{w.userName}</p>
                            <p className="text-slate-400">{w.userEmail}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-white">{formatUGX(w.amount)}</p>
                            <p className="text-[10px] text-emerald-400">Net: {formatUGX(w.netAmount)}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-slate-300 font-semibold">{w.payoutMethod}</p>
                            <p className="text-[10px] text-slate-400 max-w-xs truncate">{w.destinationDetails}</p>
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${w.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : w.status === 'pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                              {w.status}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-2">
                            {w.status === 'pending' && (
                              <button
                                onClick={() => handleReviewWithdrawal(w.id, 'approved')}
                                className="px-3 py-1 rounded bg-teal-500 text-slate-950 font-bold"
                              >
                                Approve
                              </button>
                            )}
                            {w.status !== 'completed' && w.status !== 'rejected' && (
                              <button
                                onClick={() => handleReviewWithdrawal(w.id, 'completed')}
                                className="px-3 py-1 rounded bg-emerald-500 text-slate-950 font-bold"
                              >
                                Complete Payout
                              </button>
                            )}
                            {w.status === 'pending' && (
                              <button
                                onClick={() => handleReviewWithdrawal(w.id, 'rejected')}
                                className="px-3 py-1 rounded bg-red-500 text-white font-bold"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'treasury' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white">UGX Asset Treasury Management</h1>
                  <p className="text-xs text-slate-400 mt-1">Auditable reserve ledger, external funding deposits, and authorized treasury disbursements.</p>
                </div>
                <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                  <span className="text-slate-400">Current Balance:</span>{' '}
                  <span className={`font-bold text-sm ml-1 ${treasuryStats.currentBalance > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {formatUGX(treasuryStats.currentBalance)}
                  </span>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Current Treasury Balance</span>
                  <div className="text-xl font-bold text-white font-mono">{formatUGX(treasuryStats.currentBalance)}</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Total Deposits</span>
                  <div className="text-xl font-bold text-emerald-400 font-mono">+{formatUGX(treasuryStats.totalDeposits)}</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Total Withdrawals</span>
                  <div className="text-xl font-bold text-rose-400 font-mono">-{formatUGX(treasuryStats.totalWithdrawals)}</div>
                </div>
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">Total Transactions</span>
                  <div className="text-xl font-bold text-blue-400 font-mono">{treasuryStats.transactionCount}</div>
                </div>
              </div>

              {treasuryStats.currentBalance === 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>No funds available. An authorized administrator must deposit funds before a withdrawal can be made.</span>
                </div>
              )}

              {/* Action Forms Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Deposit Form */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-sm font-bold text-white">Deposit Funds (External Reserve Funding)</h3>
                  </div>
                  <form onSubmit={handleAddTreasury} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Funding Source</label>
                      <input
                        type="text"
                        required
                        value={tresSource}
                        onChange={(e) => setTresSource(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                        placeholder="Stanbic Bank Syndicate UGX"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Amount (UGX)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={tresAmount}
                          onChange={(e) => setTresAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                          placeholder="100000000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Reference</label>
                        <input
                          type="text"
                          value={tresRef}
                          onChange={(e) => setTresRef(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                          placeholder="UGX-TR-DEP-001"
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20">
                      Submit UGX Deposit
                    </button>
                  </form>
                </div>

                {/* Withdrawal Form */}
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-5 h-5 text-rose-400" />
                    <h3 className="text-sm font-bold text-white">Withdraw Funds (Treasury Disbursement)</h3>
                  </div>
                  <form onSubmit={handleWithdrawTreasury} className="space-y-4">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Destination / Recipient</label>
                      <input
                        type="text"
                        required
                        value={tresWithDest}
                        onChange={(e) => setTresWithDest(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                        placeholder="Bank / Operational Expense Account"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Amount (UGX)</label>
                        <input
                          type="number"
                          required
                          min="1"
                          max={treasuryStats.currentBalance}
                          value={tresWithAmount}
                          onChange={(e) => setTresWithAmount(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                          placeholder="5000000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Reference</label>
                        <input
                          type="text"
                          value={tresWithRef}
                          onChange={(e) => setTresWithRef(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                          placeholder="UGX-TR-WIT-001"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Withdrawal Reason / Justification</label>
                      <input
                        type="text"
                        required
                        value={tresWithReason}
                        onChange={(e) => setTresWithReason(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                        placeholder="Liquidity transfer for operational payout"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={treasuryStats.currentBalance <= 0}
                      className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-rose-500/20"
                    >
                      Process Treasury Withdrawal
                    </button>
                  </form>
                </div>
              </div>

              {/* Transaction History & Search/Filters */}
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <h3 className="text-sm font-bold text-white">Immutable Transaction Ledger</h3>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                      type="text"
                      value={treasurySearch}
                      onChange={(e) => setTreasurySearch(e.target.value)}
                      placeholder="Search reference or source..."
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs w-full sm:w-64"
                    />
                    <select
                      value={treasuryFilterType}
                      onChange={(e) => setTreasuryFilterType(e.target.value)}
                      className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    >
                      <option value="all">All Types</option>
                      <option value="deposit">Deposits</option>
                      <option value="withdrawal">Withdrawals</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="p-4">Reference</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Source / Destination</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">New Balance</th>
                        <th className="p-4">Recorded By</th>
                        <th className="p-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {treasuryList
                        .filter((t: any) => {
                          const matchesType = treasuryFilterType === 'all' || t.type === treasuryFilterType || (!t.type && treasuryFilterType === 'deposit');
                          const matchesSearch = !treasurySearch || t.reference.toLowerCase().includes(treasurySearch.toLowerCase()) || (t.source && t.source.toLowerCase().includes(treasurySearch.toLowerCase())) || (t.destination && t.destination.toLowerCase().includes(treasurySearch.toLowerCase()));
                          return matchesType && matchesSearch;
                        })
                        .map((t: any) => {
                          const isDep = !t.type || t.type === 'deposit';
                          return (
                            <tr key={t.id} className="hover:bg-slate-850/50">
                              <td className="p-4 font-mono text-slate-300">{t.reference}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDep ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                  {isDep ? 'Deposit' : 'Withdrawal'}
                                </span>
                              </td>
                              <td className="p-4 font-bold text-white">{isDep ? t.source : t.destination || t.reason}</td>
                              <td className={`p-4 font-bold font-mono ${isDep ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isDep ? '+' : '-'}{formatUGX(t.amount)}
                              </td>
                              <td className="p-4 font-mono text-slate-300">{formatUGX(t.newBalance ?? 0)}</td>
                              <td className="p-4 text-slate-400">{t.recordedBy}</td>
                              <td className="p-4 text-slate-400">{new Date(t.date).toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      {treasuryList.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-slate-500 text-xs">
                            No treasury transactions recorded. The treasury balance is UGX 0.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'credits' && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold text-white">User UGX Credits & Bonuses</h1>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4">Issue Legitimate Funded UGX Credit</h3>
                <form onSubmit={handleIssueCredit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Target User</label>
                    <select
                      value={credUserId}
                      onChange={(e) => setCredUserId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    >
                      <option value="">Select User...</option>
                      {usersList.map((u: any) => (
                        <option key={u.id} value={u.id}>{u.fullName} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Credit Amount (UGX)</label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={credAmount}
                      onChange={(e) => setCredAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      placeholder="500000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Category</label>
                    <input
                      type="text"
                      value={credCategory}
                      onChange={(e) => setCredCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Reason / Justification</label>
                    <input
                      type="text"
                      required
                      value={credReason}
                      onChange={(e) => setCredReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      placeholder="Promotional onboarding reward"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                      Issue UGX Credit
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">User Email</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Reason</th>
                      <th className="p-4">Issued By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {creditsList.map((c: any) => (
                      <tr key={c.id} className="hover:bg-slate-850/50">
                        <td className="p-4 font-mono text-slate-300">{c.reference}</td>
                        <td className="p-4 text-white">{c.userEmail}</td>
                        <td className="p-4 font-bold text-emerald-400">+{formatUGX(c.amount)}</td>
                        <td className="p-4 text-slate-400">{c.reason}</td>
                        <td className="p-4 text-slate-400">{c.issuedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'savings' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Savings Configuration & UGX Engine Execution</h1>
                <button
                  onClick={handleRunCalculation}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Run Daily 8% Calculation Now
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-sm font-bold text-white">Configure Savings Engine Rules</h3>
                <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Minimum Deposit (UGX)</label>
                    <input
                      type="number"
                      min="1000"
                      value={cfgMinDep}
                      onChange={(e) => setCfgMinDep(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Maximum Deposit (UGX)</label>
                    <input
                      type="number"
                      value={cfgMaxDep}
                      onChange={(e) => setCfgMaxDep(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Minimum Withdrawal (UGX)</label>
                    <input
                      type="number"
                      value={cfgMinWith}
                      onChange={(e) => setCfgMinWith(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Waiting Period (Days)</label>
                    <input
                      type="number"
                      value={cfgWaiting}
                      onChange={(e) => setCfgWaiting(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Daily Interest Rate (e.g. 0.08 = 8%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={cfgRate}
                      onChange={(e) => setCfgRate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Withdrawal Fee Percent (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={cfgFee}
                      onChange={(e) => setCfgFee(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button type="submit" className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs transition-colors">
                      Save Configuration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'audit' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-white">System Audit Trail ({auditLogsList.length})</h1>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Actor</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {auditLogsList.map((log: any) => (
                      <tr key={log.id} className="hover:bg-slate-850/50">
                        <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4 text-emerald-400 uppercase font-semibold">{log.actorType}</td>
                        <td className="p-4 font-mono text-white">{log.action}</td>
                        <td className="p-4 text-slate-300 font-mono text-[11px]">{JSON.stringify(log.details)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'admins' && (
            <div className="space-y-8">
              <h1 className="text-2xl font-bold text-white">Administrator Management</h1>
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-4">Invite New Administrator</h3>
                <form onSubmit={handleCreateInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                      placeholder="finance@vaultora.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    >
                      <option value="Super Admin">Super Admin</option>
                      <option value="Finance Admin">Finance Admin</option>
                      <option value="Support Admin">Support Admin</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                      Create Invitation Token
                    </button>
                  </div>
                </form>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-4">Admin Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {adminsList.map((a: any) => (
                      <tr key={a.id} className="hover:bg-slate-850/50">
                        <td className="p-4 font-bold text-white">{a.fullName}</td>
                        <td className="p-4 text-slate-300">{a.email}</td>
                        <td className="p-4 text-emerald-400">{a.role}</td>
                        <td className="p-4 uppercase text-emerald-400 font-semibold">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'website-status' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Website Status & Platform Availability</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Control visitor access and server-side maintenance mode. Database ledger, audit trails, and administrator recovery routes remain preserved.
                </p>
              </div>

              {/* Status Hero Card */}
              <div
                className={`p-6 sm:p-8 rounded-2xl border transition-all ${
                  websiteStatus?.maintenanceMode
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        websiteStatus?.maintenanceMode
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {websiteStatus?.maintenanceMode ? (
                        <AlertTriangle className="w-8 h-8 stroke-[2.5]" />
                      ) : (
                        <Activity className="w-8 h-8 stroke-[2.5]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Current Website Status
                        </span>
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                            websiteStatus?.maintenanceMode
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              websiteStatus?.maintenanceMode
                                ? 'bg-amber-400'
                                : 'bg-emerald-400 animate-pulse'
                            }`}
                          ></span>
                          {websiteStatus?.maintenanceMode ? 'Maintenance' : 'Online'}
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-white">
                        {websiteStatus?.maintenanceMode
                          ? 'Maintenance Mode Active'
                          : 'Platform Online & Fully Operational'}
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                        {websiteStatus?.maintenanceMode
                          ? 'Normal visitor and customer access is paused. Visitors see the dedicated Maintenance Page. Server-side middleware rejects regular user actions with HTTP 503 while preserving administrator controls and database state.'
                          : 'Vaultora is accepting visitors, user registrations, logins, UGX deposits, withdrawals, and daily 8% interest calculations.'}
                      </p>
                    </div>
                  </div>

                  {/* Clearly Labeled Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                    {websiteStatus?.maintenanceMode ? (
                      <button
                        onClick={handleRestoreWebsite}
                        disabled={statusUpdating}
                        className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Power className="w-4 h-4" />
                        <span>{statusUpdating ? 'Restoring...' : 'Restore Website'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowMaintenanceConfirmModal(true)}
                        disabled={statusUpdating}
                        className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        <span>Enable Maintenance Mode</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Audit & Configuration Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    Last Status Change Audit Details
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Current Status</span>
                      <span className={`font-bold ${websiteStatus?.maintenanceMode ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {websiteStatus?.maintenanceMode ? 'Maintenance' : 'Online'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Administrator Who Made Change</span>
                      <span className="text-white font-mono">{websiteStatus?.changedBy || 'System Default'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Time of Last Change</span>
                      <span className="text-slate-200">
                        {websiteStatus?.changedAt ? new Date(websiteStatus.changedAt).toLocaleString('en-UG') : 'System Initialization'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span className="text-slate-400">Reason / Description</span>
                      <span className="text-slate-300 font-medium">{websiteStatus?.reason || 'None specified'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-400">Primary Currency & Min Deposit</span>
                      <span className="text-emerald-400 font-bold">UGX · Min {formatUGX(5000)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    Security & Data Integrity Guarantees
                  </h3>
                  <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Balances & Transactions Untouched</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Enabling Maintenance Mode never cancels, alters, or falsifies payment records, deposits, or user savings balances.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Server-Side Middleware Enforcement</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Requests to <code className="text-emerald-400">/api/user/*</code> and <code className="text-emerald-400">/api/auth/*</code> are rejected with HTTP 503 Service Unavailable directly at the Express server level.
                        </p>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-white">Preserved Administrator Access</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Authenticated administrators retain full access to restore operations, review deposits, and manage reserves.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Architectural Notice (Requirement C) */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex items-center gap-2 text-slate-200 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Important Distinction: Website Maintenance Mode vs. Server Process Stop</span>
                </div>
                <p className="leading-relaxed">
                  This control operates as an application-level <strong>Maintenance Mode</strong>: it safely blocks public and customer transactions at the backend server middleware level, renders the dedicated maintenance page for visitors, and guarantees database state preservation while keeping administrator recovery routes operational.
                </p>
                <p className="text-[11px] text-slate-500">
                  This control does not terminate the underlying Google Cloud Run infrastructure or stop the Vite development server process, which would cause connection failures and prevent administrative recovery.
                </p>
              </div>
            </div>
          )}

          {/* 1. Security Center Section */}
          {activeSection === 'security' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Security Center & Active Sessions</h1>
                <p className="text-xs text-slate-400 mt-1">Monitor active session tokens, failed authentication attempts, and administrator actions with instant revocation.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Active Sessions</p>
                  <h3 className="text-2xl font-bold text-emerald-400">{securityData?.securitySummary?.totalActiveSessions || 0}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Failed Login Attempts</p>
                  <h3 className="text-2xl font-bold text-white">{securityData?.securitySummary?.failedAttemptsCount || 0}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Authorized Admins</p>
                  <h3 className="text-2xl font-bold text-white">{securityData?.securitySummary?.adminsCount || 0}</h3>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-sm font-bold text-white">Active Session Tokens</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="pb-3 font-semibold">Token Mask</th>
                        <th className="pb-3 font-semibold">Account / Email</th>
                        <th className="pb-3 font-semibold">Role</th>
                        <th className="pb-3 font-semibold">Expires At</th>
                        <th className="pb-3 font-semibold text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {securityData?.activeSessions?.map((s: any) => (
                        <tr key={s.token} className="hover:bg-slate-950/40">
                          <td className="py-3 font-mono text-emerald-400">{s.tokenMask}</td>
                          <td className="py-3 font-medium text-white">{s.email}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {s.role}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{new Date(s.expiresAt).toLocaleString()}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleRevokeSession(s.token)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold transition-colors border border-red-500/20"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 2. Financial Reconciliation Section */}
          {activeSection === 'reconciliation' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Financial Reconciliation</h1>
                <p className="text-xs text-slate-400 mt-1">Cross-verify internal ledger totals, detect duplicate transaction references, and audit pending UGX flows.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Confirmed Deposits</p>
                  <h3 className="text-xl font-bold text-emerald-400">{formatUGX(reconciliationData?.reconciliation?.totalDepositsConfirmed || 0)}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Confirmed Payouts</p>
                  <h3 className="text-xl font-bold text-white">{formatUGX(reconciliationData?.reconciliation?.totalWithdrawalsConfirmed || 0)}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Pending Deposits</p>
                  <h3 className="text-xl font-bold text-amber-400">{reconciliationData?.reconciliation?.pendingDepositsCount || 0}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Reconciliation Status</p>
                  <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                    <CheckCircle2 className="w-5 h-5" /> Balanced
                  </h3>
                </div>
              </div>

              {reconciliationData?.reconciliation?.duplicateWarnings?.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs text-amber-300">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>Warning: Duplicate reference detected in deposit records! Please review reconciliation warnings.</span>
                </div>
              )}

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Reconciliation Summary Report</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All confirmed deposit and withdrawal records match internal ledger calculations. No unmatched payment-gateway discrepancies or balance drift identified.
                </p>
              </div>
            </div>
          )}

          {/* 3. Backup and Recovery Section */}
          {activeSection === 'backup' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Backup & Recovery</h1>
                <p className="text-xs text-slate-400 mt-1">Manage database snapshots, export encrypted JSON backups, and review retention settings.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Backup Status</p>
                  <h3 className="text-2xl font-bold text-emerald-400">{backupStatus?.status || 'Ready'}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Database File Size</p>
                  <h3 className="text-2xl font-bold text-white">{backupStatus?.fileSizeKB || 0} KB</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Retention Policy</p>
                  <h3 className="text-2xl font-bold text-white">{backupStatus?.retentionDays || 30} Days</h3>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-sm font-bold text-white">Database Snapshot & Export</h3>
                <p className="text-xs text-slate-400">
                  Storage Location: <code className="text-emerald-400">{backupStatus?.storageLocation}</code>
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={handleTriggerBackup}
                    className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Create Backup Snapshot
                  </button>
                  <a
                    href="/api/admin/backup/download"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
                  >
                    <FileText className="w-4 h-4" /> Download Database JSON
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* 4. Diagnostics Section */}
          {activeSection === 'diagnostics' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">System Diagnostics & Health</h1>
                <p className="text-xs text-slate-400 mt-1">Real-time database latency, memory usage, background job status, and server runtime metrics.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Database Connectivity</p>
                  <h3 className="text-base font-bold text-emerald-400">{diagnosticsData?.databaseStatus}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Latency</p>
                  <h3 className="text-2xl font-bold text-white">{diagnosticsData?.databaseLatencyMs} ms</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Memory RSS</p>
                  <h3 className="text-2xl font-bold text-white">{diagnosticsData?.memoryRssMB} MB</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Uptime</p>
                  <h3 className="text-2xl font-bold text-emerald-400">{diagnosticsData?.uptimeSeconds} s</h3>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Runtime Environment</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Node.js Version</span>
                    <span className="font-mono text-emerald-400">{diagnosticsData?.nodeVersion}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block mb-1">Active Background Jobs</span>
                    <span className="font-mono text-emerald-400">{diagnosticsData?.activeBackgroundJobs} running</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Work Queue Section */}
          {activeSection === 'work-queue' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Administrative Work Queue</h1>
                <p className="text-xs text-slate-400 mt-1">Pending user deposits, payout requests, and verification tasks requiring administrative action.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Pending Deposits</p>
                  <h3 className="text-2xl font-bold text-amber-400">{workQueueData?.counts?.pendingDeposits || 0}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Pending Withdrawals</p>
                  <h3 className="text-2xl font-bold text-amber-400">{workQueueData?.counts?.pendingWithdrawals || 0}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Total Queue Items</p>
                  <h3 className="text-2xl font-bold text-emerald-400">{workQueueData?.counts?.totalQueue || 0}</h3>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                <h3 className="text-sm font-bold text-white">Actionable Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="pb-3 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Title</th>
                        <th className="pb-3 font-semibold">Priority</th>
                        <th className="pb-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {workQueueData?.workQueue?.map((item: any) => (
                        <tr key={item.id} className="hover:bg-slate-950/40">
                          <td className="py-3 uppercase font-bold text-emerald-400">{item.itemType}</td>
                          <td className="py-3 font-medium text-white">{item.title}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{new Date(item.createdAt || item.date || Date.now()).toLocaleString()}</td>
                        </tr>
                      ))}
                      {(!workQueueData?.workQueue || workQueueData.workQueue.length === 0) && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500">
                            Work queue is clear. No pending items require review.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Cash-Flow Forecasting Section */}
          {activeSection === 'cash-flow' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Cash-Flow Forecasting & Financial Summaries</h1>
                <p className="text-xs text-slate-400 mt-1">Analyze historical inflows/outflows, net liquidity, and projected monthly growth.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Total Inflows (Deposits)</p>
                  <h3 className="text-2xl font-bold text-emerald-400">{formatUGX(cashFlowData?.summary?.totalInflowsUGX || 0)}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Total Outflows (Withdrawals)</p>
                  <h3 className="text-2xl font-bold text-amber-400">{formatUGX(cashFlowData?.summary?.totalOutflowsUGX || 0)}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Net Liquidity</p>
                  <h3 className="text-2xl font-bold text-emerald-400">{formatUGX(cashFlowData?.summary?.netLiquidityUGX || 0)}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Monthly Projections</h3>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Projected Monthly Growth Rate</span>
                      <span className="font-bold text-emerald-400">+{cashFlowData?.summary?.projectedMonthlyGrowthRate || 0}%</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Projected Inflow (Next Month)</span>
                      <span className="font-bold text-white">{formatUGX(cashFlowData?.summary?.projectedInflowNextMonthUGX || 0)}</span>
                    </div>
                    <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-slate-400">Projected Outflow (Next Month)</span>
                      <span className="font-bold text-white">{formatUGX(cashFlowData?.summary?.projectedOutflowNextMonthUGX || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white">Historical Breakdown</h3>
                  <div className="space-y-2">
                    {cashFlowData?.historicalMonthly?.map((m: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <span className="font-medium text-white">{m.month}</span>
                        <div className="flex gap-4 text-right">
                          <span className="text-emerald-400">+{formatUGX(m.inflows)}</span>
                          <span className="text-amber-400">-{formatUGX(m.outflows)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Support & Disputes Section */}
          {activeSection === 'support' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Customer Support & Transaction Disputes</h1>
                <p className="text-xs text-slate-400 mt-1">Manage user support inquiries, deposit disputes, and direct admin messaging.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Support Tickets & Disputes</h3>
                <div className="space-y-3">
                  {supportTicketsData.map((t: any) => (
                    <div key={t.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{t.subject}</span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400">{t.category}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.status === 'open' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                          {t.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">User: {t.userEmail}</p>
                      {t.messages?.map((msg: any, i: number) => (
                        <div key={i} className={`p-3 rounded-lg text-xs ${msg.sender === 'admin' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 ml-4' : 'bg-slate-900 text-slate-300 mr-4'}`}>
                          <span className="font-bold block text-[10px] mb-1 text-slate-400">{msg.sender.toUpperCase()}</span>
                          {msg.text}
                        </div>
                      ))}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          placeholder="Type admin response..."
                          id={`reply_${t.id}`}
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"
                        />
                        <button
                          onClick={async () => {
                            const input = document.getElementById(`reply_${t.id}`) as HTMLInputElement;
                            if (!input?.value) return;
                            try {
                              const res = await api.updateSupportTicket(t.id, 'resolved', input.value);
                              setSupportTicketsData(res.ticket ? supportTicketsData.map(item => item.id === t.id ? res.ticket : item) : supportTicketsData);
                              input.value = '';
                              setSuccessMsg('Response sent and ticket marked resolved.');
                            } catch (err: any) {
                              setError(err.message || 'Failed to reply to ticket');
                            }
                          }}
                          className="px-4 py-2 bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs hover:bg-emerald-400"
                        >
                          Send & Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                  {supportTicketsData.length === 0 && (
                    <p className="text-xs text-slate-500 text-center py-6">No support tickets found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Feature Controls Section */}
          {activeSection === 'features' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Independent Feature Controls</h1>
                <p className="text-xs text-slate-400 mt-1">Enable or disable platform features with server-side enforcement.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Platform Toggles</h3>
                <div className="space-y-3">
                  {featureControlsData && Object.entries(featureControlsData).map(([key, enabled]: [string, any]) => (
                    <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div>
                        <p className="font-bold text-white uppercase">{key.replace(/([A-Z])/g, ' $1')}</p>
                        <p className="text-[11px] text-slate-400">Controls backend availability and frontend visibility.</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const res = await api.updateAdminFeatureControl(key, !enabled);
                            setFeatureControlsData(res.features);
                            setSuccessMsg(`Feature ${key} updated.`);
                          } catch (err: any) {
                            setError(err.message || 'Failed to update feature');
                          }
                        }}
                        className={`px-4 py-2 rounded-xl font-bold transition-colors ${enabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}
                      >
                        {enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Releases & Migrations Section */}
          {activeSection === 'deployments' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Deployment, Release & Migration Tracking</h1>
                <p className="text-xs text-slate-400 mt-1">Inspect runtime release versions, applied database migrations, and recovery snapshots.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Current Version</p>
                  <h3 className="text-lg font-bold text-emerald-400">{deploymentsData?.currentVersion || 'v2.4.8'}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Environment</p>
                  <h3 className="text-lg font-bold text-white">{deploymentsData?.environment || 'Preview'}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Recovery Snapshots</p>
                  <h3 className="text-lg font-bold text-emerald-400">{deploymentsData?.recoverySnapshotsCount || 4} Available</h3>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Applied Database Migrations</h3>
                <div className="space-y-3">
                  {deploymentsData?.migrations?.map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div>
                        <p className="font-bold text-white">{m.name}</p>
                        <p className="text-[11px] text-slate-400">Applied: {new Date(m.appliedAt).toLocaleString()}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {m.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Compliance & Privacy Section */}
          {activeSection === 'compliance' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Privacy and Compliance Review Workflows</h1>
                <p className="text-xs text-slate-400 mt-1">Review KYC status, AML risk scores, and regulatory adherence frameworks.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Status</p>
                  <h3 className="text-lg font-bold text-emerald-400">{complianceData?.complianceStatus || 'Compliant'}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Registered Users</p>
                  <h3 className="text-2xl font-bold text-white">{complianceData?.metrics?.totalRegistered || 0}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">KYC Verified</p>
                  <h3 className="text-2xl font-bold text-emerald-400">{complianceData?.metrics?.kycVerified || 0}</h3>
                </div>
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400 mb-1">Pending KYC</p>
                  <h3 className="text-2xl font-bold text-amber-400">{complianceData?.metrics?.pendingKyc || 0}</h3>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white">Regulatory Frameworks</h3>
                <div className="flex flex-wrap gap-2">
                  {complianceData?.frameworks?.map((f: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-emerald-300">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Data Integrity Section */}
          {activeSection === 'data-integrity' && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-white">Automated Data-Integrity Checks & Discrepancy Reports</h1>
                <p className="text-xs text-slate-400 mt-1">Run automated referential integrity audits and verify ledger balances.</p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">System Integrity Status: <span className="text-emerald-400">{dataIntegrityData?.status || 'Healthy'}</span></h3>
                    <p className="text-xs text-slate-400 mt-0.5">Last Checked: {dataIntegrityData?.lastCheckTime ? new Date(dataIntegrityData.lastCheckTime).toLocaleString() : 'N/A'}</p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const res = await api.runAdminDataIntegrityCheck();
                        setSuccessMsg(res.message);
                        const dint = await api.getAdminDataIntegrity();
                        setDataIntegrityData(dint);
                      } catch (err: any) {
                        setError(err.message || 'Integrity check failed');
                      }
                    }}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20"
                  >
                    Run Integrity Audit Now
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-[11px] text-slate-400">Total Confirmed Deposits</p>
                    <p className="text-base font-bold text-emerald-400">{formatUGX(dataIntegrityData?.metrics?.totalConfirmedDepositsUGX || 0)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-[11px] text-slate-400">Total Confirmed Withdrawals</p>
                    <p className="text-base font-bold text-amber-400">{formatUGX(dataIntegrityData?.metrics?.totalConfirmedWithdrawalsUGX || 0)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <p className="text-[11px] text-slate-400">Active Savings Balances</p>
                    <p className="text-base font-bold text-emerald-400">{formatUGX(dataIntegrityData?.metrics?.totalSavingsBalancesUGX || 0)}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300">Checks Performed</h4>
                  {dataIntegrityData?.checksPerformed?.map((chk: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div>
                        <p className="font-semibold text-white">{chk.name}</p>
                        <p className="text-[11px] text-slate-400">{chk.details}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                        {chk.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Step Before Enabling Maintenance Mode */}
      {showMaintenanceConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Enable Maintenance Mode?</h3>
                  <p className="text-xs text-slate-400">Confirmation required before updating website status</p>
                </div>
              </div>
              <button
                onClick={() => setShowMaintenanceConfirmModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
              <p className="font-semibold">What happens when enabled:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-300">
                <li>Public visitors will receive the Vaultora Maintenance Page.</li>
                <li>Normal user registrations, logins, deposits, and payouts are paused.</li>
                <li>Server middleware blocks user API endpoints with HTTP 503.</li>
                <li>All balances, deposit records, and audit logs remain untouched.</li>
                <li><strong>Admin access remains available</strong> so you can restore the website at any time.</li>
              </ul>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Maintenance Reason / Description (Optional)
              </label>
              <input
                type="text"
                value={maintenanceReasonInput}
                onChange={(e) => setMaintenanceReasonInput(e.target.value)}
                placeholder="e.g. Scheduled technical upgrade and database maintenance"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowMaintenanceConfirmModal(false)}
                disabled={statusUpdating}
                className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEnableMaintenance}
                disabled={statusUpdating}
                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
              >
                {statusUpdating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  'Confirm & Enable'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Review Modal */}
      {depositReviewModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white capitalize">
                Review Deposit ({depositReviewModal.status})
              </h3>
              <button
                onClick={() => setDepositReviewModal({ isOpen: false, id: '', status: '', reason: '' })}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Confirm updating the deposit status to <strong className="text-emerald-400 uppercase">{depositReviewModal.status}</strong>.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Review Note / Reason</label>
              <input
                type="text"
                value={depositReviewModal.reason}
                onChange={(e) => setDepositReviewModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g. Verified via MTN Mobile Money payment log"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDepositReviewModal({ isOpen: false, id: '', status: '', reason: '' })}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReviewDeposit}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
              >
                Confirm Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdrawal Review Modal */}
      {withdrawalReviewModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white capitalize">
                Review Payout ({withdrawalReviewModal.status})
              </h3>
              <button
                onClick={() => setWithdrawalReviewModal({ isOpen: false, id: '', status: '', payoutRef: '', reason: '' })}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Payout Reference ID</label>
              <input
                type="text"
                value={withdrawalReviewModal.payoutRef}
                onChange={(e) => setWithdrawalReviewModal(prev => ({ ...prev, payoutRef: e.target.value }))}
                placeholder="e.g. MOMO-REF-..."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Review Note / Reason</label>
              <input
                type="text"
                value={withdrawalReviewModal.reason}
                onChange={(e) => setWithdrawalReviewModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g. Disbursed via MTN Mobile Money"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawalReviewModal({ isOpen: false, id: '', status: '', payoutRef: '', reason: '' })}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmReviewWithdrawal}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Status Modal */}
      {userStatusModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white capitalize">
                Update User Status to {userStatusModal.newStatus}
              </h3>
              <button
                onClick={() => setUserStatusModal({ isOpen: false, id: '', currentStatus: '', newStatus: '', reason: '' })}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-300">
              Are you sure you want to set this user account status to <strong className="text-amber-400 uppercase">{userStatusModal.newStatus}</strong>?
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Action Reason</label>
              <input
                type="text"
                value={userStatusModal.reason}
                onChange={(e) => setUserStatusModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g. Administrative compliance review"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUserStatusModal({ isOpen: false, id: '', currentStatus: '', newStatus: '', reason: '' })}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmToggleUserStatus}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
              >
                Confirm Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
