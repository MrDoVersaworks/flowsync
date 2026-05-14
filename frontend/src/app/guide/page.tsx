'use client';

import { motion } from 'framer-motion';
import { Sparkles, Users, Layout, Zap, ShieldCheck, Cpu, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function GuidePage() {
  const sections = [
    {
      id: 'orchestrate',
      icon: Sparkles,
      color: 'text-accent-blue',
      bg: 'bg-accent-blue/5',
      border: 'border-accent-blue/20',
      title: 'Orchestrate',
      subtitle: 'Building your Technical Command Center',
      content: 'Every mission begins with a sanctuary. Use the command bar to initialize a new workspace. This creates a dedicated, real-time environment where your goals are grounded in our sovereign database. You can manage multiple sanctuaries, each representing a unique project or domain.'
    },
    {
      id: 'collaborate',
      icon: Users,
      color: 'text-accent-purple',
      bg: 'bg-accent-purple/5',
      border: 'border-accent-purple/20',
      title: 'Collaborate',
      subtitle: 'Synchronizing Distributed Minds',
      content: 'FlowSync is built for convergence. Share your unique 8-character invite code with team members to bring them into the sanctuary. Once joined, every action - from task moves to specification edits - is broadcasted in near-real-time across the WebSocket nerve system. No manual refreshing is required.'
    },
    {
      id: 'synchronize',
      icon: Layout,
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/5',
      border: 'border-accent-cyan/20',
      title: 'Synchronize',
      subtitle: 'AI-Driven Goal Decomposition',
      content: 'Transform high-level vision into an actionable technical roadmap using our AI Inception engine. Simply input a technical goal, and the system will call upon your configured AI model to architect a detailed blueprint of Kanban tasks. These tasks serve as a structured guide for your own implementation, providing the strategic framework needed to build complex systems.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-accent-purple/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-16"
        >
          <header className="space-y-6">
            <Link href="/workspaces" className="inline-flex items-center gap-2 text-text-dim hover:text-foreground transition-smooth group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Back to Sanctuary</span>
            </Link>
            <h1 className="text-6xl font-bold text-foreground font-display tracking-tight">User Manual</h1>
            <p className="text-text-secondary text-xl font-light leading-relaxed">
              Master the orchestration of your technical sanctuaries and the power of sovereign AI.
            </p>
          </header>

          <div className="space-y-20">
            {sections.map((section, idx) => (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`glass-card p-12 ${section.border} ${section.bg} relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                    <section.icon className="w-48 h-48" />
                  </div>
                  
                  <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 bg-bg-secondary rounded-2xl flex items-center justify-center`}>
                        <section.icon className={`w-8 h-8 ${section.color}`} />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-foreground font-display tracking-tight">{section.title}</h2>
                        <p className={`text-xs font-bold uppercase tracking-[0.2em] mt-1 ${section.color}`}>{section.subtitle}</p>
                      </div>
                    </div>

                    <p className="text-text-secondary text-lg leading-relaxed max-w-2xl">
                      {section.content}
                    </p>

                    <div className="pt-8 border-t border-border-color grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-bold italic">
                          <Zap className="w-4 h-4 text-accent-blue" />
                          <span>Key Protocol</span>
                        </div>
                        <p className="text-xs text-text-dim leading-relaxed">
                          All actions are physically grounded in the database and synchronized via Socket.io.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-foreground font-bold italic">
                          <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                          <span>Sovereignty</span>
                        </div>
                        <p className="text-xs text-text-dim leading-relaxed">
                          Your data is yours. Protected by AES-256 and your own Gemini API keys.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </section>
            ))}
          </div>

          <footer className="pt-20 border-t border-border-color text-center">
            <p className="text-text-dim text-sm uppercase tracking-widest font-bold">
              FlowSync Infrastructure • v1.0.0 Sovereign Release
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
