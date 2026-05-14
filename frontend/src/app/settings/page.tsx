'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { 
  User, 
  Mail, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  Trash2, 
  Zap,
  Moon,
  Sun, 
  Save,
  ShieldCheck,
  RotateCcw,
  Key,
  ShieldPlus
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [apiKey, setApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-1.5-flash');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await api.get('/settings');
        if (data.data.gemini_model_config) {
          setGeminiModel(data.data.gemini_model_config);
        }
        setHasApiKey(data.data.has_api_key);
      } catch (error) {
        toast.error('Failed to sync sovereign settings');
      } finally {
        setIsLoadingSettings(false);
      }
    };

    if (mounted && isAuthenticated) {
      fetchSettings();
    }
  }, [mounted, isAuthenticated]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.post('/settings', { 
        geminiKey: apiKey || undefined, 
        modelConfig: geminiModel
      });
      toast.success('Sovereign Settings Anchored');
      setApiKey('');
      setHasApiKey(data.data.has_api_key);
    } catch (error) {
      toast.error('Failed to anchor settings');
    } finally {
      setIsSaving(false);
    }
  };

  const resetApiKey = async () => {
    if (!confirm('Are you sure you want to purge your API key?')) return;
    try {
      await api.delete('/settings/key');
      setHasApiKey(false);
      setApiKey('');
      toast.success('API Key Purged');
    } catch (error) {
      toast.error('Failed to purge API key');
    }
  };

  const resetModel = async () => {
    if (!confirm('Reset model to system default?')) return;
    try {
      await api.delete('/settings/model');
      setGeminiModel('gemini-1.5-flash');
      toast.success('Model Configuration Reset');
    } catch (error) {
      toast.error('Failed to reset model');
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error('Password required for sovereign purge');
      return;
    }
    setIsDeleting(true);
    try {
      await api.delete('/auth/profile', { data: { password: deletePassword } });
      toast.success('Identity Purged');
      window.location.href = '/';
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Purge failed');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8 md:space-y-12"
        >
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground font-display tracking-tight mb-2 md:mb-3">System Configuration</h1>
              <p className="text-text-secondary text-base md:text-lg">Manage your sovereign AI gateways and account identity.</p>
            </div>
            <button 
              onClick={toggleTheme}
              className="w-full md:w-auto p-3 glass hover:bg-bg-secondary rounded-xl transition-smooth flex items-center justify-center md:justify-start gap-2 border border-border-color"
            >
              {theme === 'dark' ? <Moon className="w-5 h-5 text-accent-blue" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              <span className="text-xs font-bold uppercase tracking-widest">{theme} Mode</span>
            </button>
          </header>

          {/* Contact Details */}
          <section className="glass-card p-10 space-y-8">
            <div className="flex items-center space-x-4 pb-6 border-b border-border-color">
              <div className="w-12 h-12 bg-accent-blue/10 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Contact Details</h2>
                <p className="text-text-dim text-sm">Your verified identity in FlowSync.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">Display Name</label>
                <div className="flex items-center space-x-3 text-foreground text-lg font-medium">
                  <span>{user?.name}</span>
                  <CheckCircle2 className="w-4 h-4 text-accent-cyan" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">Email Address</label>
                <div className="flex items-center space-x-3 text-text-secondary text-lg">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
              </div>
            </div>
          </section>

          {/* AI Configuration */}
          <section className="glass-card p-10 space-y-8">
            <div className="flex items-center space-x-4 pb-6 border-b border-border-color">
              <div className="w-12 h-12 bg-accent-purple/10 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-accent-purple" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-foreground">AI Orchestration</h2>
                  <p className="text-text-dim text-sm">Agnostic Model Configuration & BYOK Architecture.</p>
                </div>
                {isLoadingSettings && <Loader2 className="w-5 h-5 animate-spin text-text-dim" />}
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">Generation Model</label>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-accent-purple/5 border border-accent-purple/10 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent-purple animate-pulse" />
                      <span className="text-[8px] font-bold text-accent-purple uppercase tracking-tighter">Active</span>
                    </div>
                  </div>
                  {geminiModel !== 'gemini-1.5-flash' && (
                    <button 
                      type="button"
                      onClick={resetModel}
                      className="text-[10px] flex items-center gap-1.5 text-accent-blue hover:text-accent-cyan transition-smooth uppercase font-bold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <input 
                    type="text"
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="auth-input pl-12"
                    placeholder="gemini-1.5-flash"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent-purple transition-smooth">
                    <ShieldPlus className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-text-dim font-bold">Gemini API Key</label>
                    {hasApiKey && (
                      <div className="flex items-center gap-2 text-[8px] font-bold text-accent-cyan uppercase tracking-widest bg-accent-cyan/10 px-2 py-0.5 rounded-lg border border-accent-cyan/20">
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>Anchored</span>
                      </div>
                    )}
                  </div>
                  {hasApiKey && (
                    <button 
                      type="button"
                      onClick={resetApiKey}
                      className="text-[10px] flex items-center gap-1.5 text-red-500 hover:text-red-400 transition-smooth uppercase font-bold"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Purge
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <input 
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={hasApiKey ? "••••••••••••••••" : "Enter encrypted API key"}
                    className={`auth-input pl-12 pr-4 ${hasApiKey ? 'border-accent-cyan/30 text-accent-cyan/60' : ''}`}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-accent-blue transition-smooth">
                    <Key className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-[10px] text-text-dim leading-relaxed">
                  Your key is never stored in plain text. It is encrypted with AES-256-GCM before being anchored to your profile.
                </p>
              </div>

              <div className="flex justify-end">
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="bg-accent-blue hover:bg-accent-blue/90 text-foreground font-bold px-10 py-4 rounded-xl transition-smooth shadow-lg shadow-accent-blue/20 flex items-center gap-3"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          </section>

          {/* Danger Zone */}
          <section className="glass-card border-red-500/20 p-10 space-y-8 bg-red-500/5">
            <div className="flex items-center space-x-4 pb-6 border-b border-red-500/10">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Sovereign Purge</h2>
                <p className="text-text-dim text-sm">Purge your identity and data permanently.</p>
              </div>
            </div>

            <div className="p-6 rounded-2xl">
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                Proceed with extreme caution. Deleting your account will physically remove all your workspaces, columns, and tasks from our infrastructure. This action is deterministic and irreversible.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-foreground font-bold rounded-xl transition-smooth border border-red-500/20"
                >
                  Initiate Sovereign Purge
                </button>
              ) : (
                <form onSubmit={handleDeleteAccount} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-red-500 uppercase tracking-widest">Verify Identity (Password Required)</label>
                    <input 
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="auth-input border-red-500/30 focus:border-red-500"
                      placeholder="Enter your password to confirm"
                      required
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      type="submit"
                      disabled={isDeleting}
                      className="flex-1 py-4 bg-red-500 text-foreground font-bold rounded-xl hover:bg-red-600 transition-smooth flex items-center justify-center gap-2"
                    >
                      {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      Confirm Purge
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                      className="flex-1 py-4 bg-bg-secondary text-foreground font-bold rounded-xl hover:bg-border-color transition-smooth border border-border-color"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
