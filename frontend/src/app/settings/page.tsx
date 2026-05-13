'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { Key, Cpu, ShieldCheck, ChevronLeft, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState({ geminiKey: '', modelConfig: '', hasKey: false });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        setConfig({
          geminiKey: '',
          modelConfig: data.data.gemini_model_config || 'gemini-1.5-flash',
          hasKey: data.data.has_api_key,
        });
      } catch (error) {
        toast.error('Failed to load security settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await api.post('/settings', {
        geminiKey: config.geminiKey || undefined,
        modelConfig: config.modelConfig,
      });
      
      updateUser({ gemini_model_config: data.data.gemini_model_config });
      setConfig(prev => ({ ...prev, geminiKey: '', hasKey: data.data.has_api_key }));
      toast.success('Sovereign configuration updated');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="w-8 h-8 text-accent-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto animate-fade-in">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-text-dim hover:text-white transition-smooth mb-8 group"
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-2">Sovereign Settings</h1>
        <p className="text-text-secondary">Configure your private AI credentials and model preferences.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* API Key Section */}
        <section className="glass-panel p-6 border-accent-gold/10">
          <div className="flex items-center gap-3 mb-6">
            <Key className="w-6 h-6 text-accent-gold" />
            <h2 className="text-xl font-bold text-white">Gemini API Key</h2>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input 
                type="password"
                placeholder={config.hasKey ? "••••••••••••••••" : "Paste your Google AI API Key here"}
                className="w-full bg-bg-primary border border-border-color rounded-md px-4 py-3 focus:outline-none focus:border-accent-gold transition-smooth"
                value={config.geminiKey}
                onChange={e => setConfig({ ...config, geminiKey: e.target.value })}
              />
              {config.hasKey && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-green-400 text-xs font-bold uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" />
                  Secured
                </div>
              )}
            </div>
            <p className="text-xs text-text-dim leading-relaxed">
              Your key is encrypted with AES-256-GCM before being stored. It is only decrypted in-memory during AI task generation.
            </p>
          </div>
        </section>

        {/* Model Section */}
        <section className="glass-panel p-6 border-accent-gold/10">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-6 h-6 text-accent-gold" />
            <h2 className="text-xl font-bold text-white">Model Configuration</h2>
          </div>
          
          <div className="space-y-4">
            <input 
              type="text"
              placeholder="e.g. gemini-1.5-flash"
              className="w-full bg-bg-primary border border-border-color rounded-md px-4 py-3 focus:outline-none focus:border-accent-gold transition-smooth"
              value={config.modelConfig}
              onChange={e => setConfig({ ...config, modelConfig: e.target.value })}
            />
            <p className="text-xs text-text-dim">
              Specify the exact Gemini model string you wish to use for task breakdowns.
            </p>
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={isSaving}
            className="bg-accent-gold hover:bg-accent-gold-hover text-bg-primary font-bold px-10 py-3 rounded-md transition-smooth flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
