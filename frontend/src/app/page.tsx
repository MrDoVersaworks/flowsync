'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Boxes, ShieldCheck, Globe, Cpu, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';

export default function Home() {
  const { isAuthenticated } = useAuthStore();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const features = [
    { icon: Zap, color: 'text-accent-blue', title: 'Nerve System', desc: 'Production-grade Socket.io convergence for zero-latency sync.' },
    { icon: Sparkles, color: 'text-accent-purple', title: 'Sovereign AI', desc: 'Atomic goal decomposition via sovereign AI orchestration.' },
    { icon: ShieldCheck, color: 'text-accent-cyan', title: 'AES-256 Vault', desc: 'Sovereign key management with GCM-mode local encryption.' },
    { icon: Cpu, color: 'text-accent-blue', title: 'BYOK Logic', desc: 'Anchor your own Gemini API keys for absolute data sovereignty.' },
    { icon: Share2, color: 'text-accent-purple', title: 'Collaborative Sync', desc: 'Unique invite code identifiers for secure workspace joining.' },
    { icon: Globe, color: 'text-accent-cyan', title: 'Global Edge', desc: 'Optimized for high-performance distributed technical orchestration.' }
  ];

  return (
    <div ref={containerRef} className="min-h-[200vh] bg-background text-foreground overflow-hidden relative selection:bg-accent-blue/30">
      {/* Parallax Backdrop */}
      <div className="fixed inset-0 z-0">
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-blue/5 rounded-full blur-[150px]" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-purple/5 rounded-full blur-[150px]" 
        />
        
        {/* Floating Technical Shards */}
        <motion.div 
          style={{ y: y1, rotate: rotate1 }}
          className="absolute top-[20%] right-[10%] w-64 h-64 glass-card border-border-color opacity-20 hidden lg:block"
        >
           <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 to-transparent" />
        </motion.div>
        
        <motion.div 
          style={{ y: y2, rotate: -20 }}
          className="absolute bottom-[20%] left-[5%] w-96 h-96 glass rounded-full border-border-color opacity-10 hidden lg:block"
        />
      </div>

      {/* Hero Section */}
      <section className="h-screen flex flex-col justify-center items-center px-6 relative z-10">
        <motion.div 
          style={{ opacity }}
          className="text-center space-y-12 max-w-6xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-3 glass px-8 py-3 rounded-full text-sm font-bold text-accent-blue border-accent-blue/20"
          >
            <Sparkles className="w-5 h-5" />
            <span className="uppercase tracking-[0.3em] text-[10px]">Production-Grade Orchestration</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-8xl md:text-[12rem] font-bold tracking-tighter font-display leading-[0.9] text-foreground"
          >
            Synchronize <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-foreground via-foreground/80 to-foreground/20">
              Your Reality
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-3xl text-text-secondary max-w-4xl mx-auto font-light leading-relaxed tracking-tight"
          >
            The sovereign technical sanctuary for elite engineering teams. 
            AI-driven blueprinting meets deterministic live-sync orchestration.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10"
          >
            <Link 
              href={isAuthenticated ? "/workspaces" : "/register"} 
              className="w-full sm:w-auto bg-accent-blue hover:bg-accent-blue/90 text-foreground font-bold py-6 px-16 rounded-2xl transition-smooth flex items-center justify-center space-x-4 group shadow-2xl shadow-accent-blue/30 text-xl"
            >
              <span>{isAuthenticated ? 'Enter Sanctuary' : 'Initialize Infrastructure'}</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-accent-blue to-transparent" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Scroll to Explore Depth</span>
        </motion.div>
      </section>

      {/* Feature Convergence Section */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-24 text-center">
            <h2 className="text-5xl md:text-7xl font-bold text-foreground font-display mb-6">Sovereign Performance</h2>
            <p className="text-text-secondary text-xl max-w-2xl mx-auto">
              Every technical card is grounded in real-time, secured by AES-256 encryption, and orchestrated by the Gemini intelligence engine.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass-card p-10 space-y-6 group border-border-color hover:border-accent-blue/40 transition-smooth relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-blue/10 transition-smooth" />
                
                <div className="w-16 h-16 bg-bg-secondary rounded-2xl flex items-center justify-center group-hover:bg-accent-blue/10 transition-smooth relative z-10">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-3xl font-bold font-display text-foreground relative z-10">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed relative z-10">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Infinite Convergence Slider (High Fidelity) */}
      <section className="relative z-10 pb-40 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-[20%] bg-gradient-to-r from-background to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-[20%] bg-gradient-to-l from-background to-transparent z-20 pointer-events-none" />
        
        <motion.div 
          animate={{ x: [0, -2000] }}
          transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 50, ease: "linear" } }}
          className="flex gap-12 whitespace-nowrap pl-20"
        >
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-12">
               {['Atomic Inception', 'Socket Alignment', 'AES-256 Vaulting', 'Sovereign BYOK', 'Quantum Convergence', 'Technical Grounding'].map((text, idx) => (
                 <div key={idx} className="flex items-center gap-6">
                   <span className="text-7xl md:text-9xl font-black text-foreground/5 hover:text-accent-blue/20 transition-smooth cursor-default font-display uppercase italic">
                     {text}
                   </span>
                   <Zap className="w-12 h-12 text-accent-blue/20" />
                 </div>
               ))}
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
