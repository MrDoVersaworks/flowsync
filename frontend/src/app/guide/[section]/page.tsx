'use client';

import { motion } from 'framer-motion';
import { Sparkles, Users, Layout, Zap, ShieldCheck, Cpu, ArrowLeft, ChevronRight, Compass } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function GuideSectionPage() {
  const { section } = useParams();
  const router = useRouter();

  const sections = [
    {
      id: 'orchestrate',
      icon: Sparkles,
      color: 'text-accent-blue',
      bg: 'bg-accent-blue/5',
      border: 'border-accent-blue/20',
      title: 'Orchestrate',
      subtitle: 'Building your Technical Command Center',
      content: 'Every mission begins with a sanctuary. Use the command bar to initialize a new workspace. This creates a dedicated, real-time environment where your goals are grounded in our sovereign database. You can manage multiple sanctuaries, each representing a unique project or domain.',
      protocols: [
        'Initialize workspaces via the Dashboard command bar.',
        'Name your sanctuary based on the technical domain.',
        'Purge infrastructure using the secure password gate.'
      ]
    },
    {
      id: 'collaborate',
      icon: Users,
      color: 'text-accent-purple',
      bg: 'bg-accent-purple/5',
      border: 'border-accent-purple/20',
      title: 'Collaborate',
      subtitle: 'Synchronizing Distributed Minds',
      content: 'FlowSync is built for convergence. Share your unique 8-character invite code with team members to bring them into the sanctuary. Once joined, every action - from task moves to specification edits - is broadcasted in near-real-time across the WebSocket nerve system. No manual refreshing is required.',
      protocols: [
        'Generate invite codes via the Workspace Share menu.',
        'Real-time presence tracking via neural tokens.',
        'Role-based access control (Admin, Contributor, Viewer).'
      ]
    },
    {
      id: 'synchronize',
      icon: Layout,
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/5',
      border: 'border-accent-cyan/20',
      title: 'Synchronize',
      subtitle: 'AI-Driven Goal Decomposition',
      content: 'Transform high-level vision into an actionable technical roadmap using our AI Inception engine. Simply input a technical goal, and the system will call upon your configured AI model to architect a detailed blueprint of Kanban tasks. These tasks serve as a structured guide for your own implementation, providing the strategic framework needed to build complex systems.',
      protocols: [
        'Incept goals via the dynamic orchestration bar.',
        'Automatic task decomposition into Kanban columns.',
        'Deterministic state updates via Socket.io synchronization.'
      ]
    },
    {
      id: 'reconciliation',
      icon: Zap,
      color: 'text-accent-cyan',
      bg: 'bg-accent-cyan/5',
      border: 'border-accent-cyan/20',
      title: 'Reconciliation',
      subtitle: 'Technical Context & Notifications',
      content: 'Every task serves as an anchor for collaborative reconciliation. Engage in dedicated chat threads to align on technical details. Our intelligent notification system tracks your interaction, highlighting unread intelligence with pulsing indicators at both the task and dashboard levels. Notifications are personalized, ensuring you only see alerts for intelligence you haven\'t yet processed.',
      protocols: [
        'Anchored chat threads for every technical card.',
        'Intelligent unread tracking with zero-noise filtering.',
        'Global dashboard alerts for cross-workspace awareness.'
      ]
    },
    {
      id: 'sovereignty',
      icon: ShieldCheck,
      color: 'text-accent-red',
      bg: 'bg-red-500/5',
      border: 'border-red-500/20',
      title: 'Atomic Permissions',
      subtitle: 'Role-Based Access & Sovereignty',
      content: 'Maintain absolute control over your sanctuary. Assign roles like Contributor or Viewer to manage interaction depth. Owners hold ultimate sovereignty, with the power to purge members or destroy infrastructure entirely. Viewers have read-only access to technical plans, ensuring that observers cannot disrupt the mission-critical flow.',
      protocols: [
        'Granular role assignment via Member Management.',
        'Sovereign owner authority for destructive actions.',
        'Viewer-mode gating for observers and stakeholders.'
      ]
    }
  ];

  const activeSection = sections.find(s => s.id === section) || sections[0];

  return (
    <div className="min-h-screen bg-background text-foreground pt-12 pb-20 px-6 relative overflow-hidden">
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
            <div className="flex items-center justify-between">
              <Link href="/workspaces" className="inline-flex items-center gap-2 text-text-dim hover:text-foreground transition-smooth group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Sanctuary</span>
              </Link>
              
              <div className="flex items-center gap-2">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => router.push(`/guide/${s.id}`)}
                    className={`w-2.5 h-2.5 rounded-full transition-smooth ${s.id === section ? activeSection.color.replace('text-', 'bg-') : 'bg-bg-secondary'}`}
                    title={s.title}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-bg-secondary rounded-2xl flex items-center justify-center border ${activeSection.border}`}>
                <activeSection.icon className={`w-8 h-8 ${activeSection.color}`} />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-bold text-foreground font-display tracking-tight leading-none mb-2">
                  {activeSection.title}
                </h1>
                <p className={`text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] ${activeSection.color}`}>
                  {activeSection.subtitle}
                </p>
              </div>
            </div>
          </header>

          <main className="space-y-12">
            <motion.div 
              key={activeSection.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card p-10 md:p-16 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <activeSection.icon className="w-64 h-64" />
              </div>
              
              <div className="relative z-10 space-y-12">
                <div className="space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-text-dim flex items-center gap-2">
                    <Compass className="w-4 h-4" />
                    Technical Briefing
                  </h3>
                  <p className="text-text-secondary text-xl md:text-2xl font-light leading-relaxed">
                    {activeSection.content}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-foreground font-bold italic flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${activeSection.color}`} />
                      Operating Protocols
                    </h4>
                    <ul className="space-y-4">
                      {activeSection.protocols.map((p, i) => (
                        <li key={i} className="flex items-start gap-3 text-text-dim text-sm leading-relaxed">
                          <ChevronRight className={`w-4 h-4 mt-1 shrink-0 ${activeSection.color}`} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-6">
                    <h4 className="text-foreground font-bold italic flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-accent-cyan" />
                      Infrastructure Integrity
                    </h4>
                    <div className="p-6 bg-bg-secondary/50 rounded-2xl border border-border-color space-y-4">
                      <p className="text-xs text-text-dim leading-relaxed">
                        Every action in the <span className="text-foreground font-bold">FlowSync Sanctuary</span> is deterministic and physically grounded in your sovereign database.
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-accent-blue uppercase tracking-tighter">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-blue animate-pulse" />
                        Live AES-256 Encryption
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation controls */}
            <div className="flex items-center justify-between pt-8">
              {sections.indexOf(activeSection) > 0 ? (
                <button 
                  onClick={() => router.push(`/guide/${sections[sections.indexOf(activeSection) - 1].id}`)}
                  className="flex items-center gap-3 text-text-dim hover:text-foreground transition-smooth group font-bold text-sm"
                >
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                  Previous Module
                </button>
              ) : <div />}

              {sections.indexOf(activeSection) < sections.length - 1 ? (
                <button 
                  onClick={() => router.push(`/guide/${sections[sections.indexOf(activeSection) + 1].id}`)}
                  className="flex items-center gap-3 text-foreground hover:text-accent-blue transition-smooth group font-bold text-sm"
                >
                  Next Module
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link 
                  href="/workspaces"
                  className="px-8 py-4 bg-accent-blue text-foreground rounded-2xl font-bold hover:bg-accent-blue/80 transition-smooth shadow-lg shadow-accent-blue/20"
                >
                  Return to Sanctuary
                </Link>
              )}
            </div>
          </main>

          <footer className="pt-20 border-t border-border-color text-center">
            <p className="text-text-dim text-[10px] uppercase tracking-[0.4em] font-bold">
              FlowSync Infrastructure • v1.0.0 Sovereign Guide
            </p>
          </footer>
        </motion.div>
      </div>
    </div>
  );
}
