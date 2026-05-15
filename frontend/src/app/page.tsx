'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Boxes, ShieldCheck, Globe, Cpu, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import NeuralNetwork from '@/components/layout/NeuralNetwork';

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
    { icon: Zap, color: 'text-accent-blue', title: 'Nerve System', desc: 'Production-grade Socket.io convergence for high-performance sync.' },
    { icon: Sparkles, color: 'text-accent-purple', title: 'Sovereign AI', desc: 'Atomic goal decomposition and blueprinting via Gemini AI orchestration.' },
    { icon: Share2, color: 'text-accent-cyan', title: 'Collaborative Chat', desc: 'Task-anchored reconciliation feed for persistent technical discussion.' },
    { icon: ShieldCheck, color: 'text-accent-blue', title: 'Atomic Permissions', desc: 'Granular Role-Based Access Control: Owners, Contributors, and Viewers.' },
    { icon: Boxes, color: 'text-accent-purple', title: 'Inception Engine', desc: 'Orchestrate entire technical stacks with a single sovereign goal.' },
    { icon: Cpu, color: 'text-accent-cyan', title: 'Sovereign Vault', desc: 'Secure technical sanctuary with AES-256 local encryption standards.' }
  ];

  return (
    <div ref={containerRef} className="min-h-[200vh] bg-background text-foreground overflow-x-hidden relative selection:bg-accent-blue/30">
      {/* High Fidelity Neural Environment */}
      <div className="fixed inset-0 z-0">
        <NeuralNetwork />
        
        {/* Parallax Backdrop */}
        <motion.div 
          style={{ y: y1 }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent-blue/5 rounded-full blur-[150px]" 
        />
        <motion.div 
          style={{ y: y2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-accent-purple/5 rounded-full blur-[150px]" 
        />
      </div>

      {/* Hero Section */}
      <section className="min-h-[80vh] md:min-h-screen flex flex-col justify-center items-center px-6 pt-4 pb-4 md:pt-0 md:pb-0 relative z-10">
        <motion.div 
          style={{ opacity }}
          className="text-center space-y-4 md:space-y-12 max-w-6xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-3 glass px-6 md:px-8 py-2 md:py-3 rounded-full text-sm font-bold text-accent-blue border-accent-blue/20"
          >
            <Sparkles className="w-4 md:w-5 h-4 md:h-5" />
            <span className="uppercase tracking-[0.3em] text-[8px] md:text-[10px]">Production-Grade Orchestration</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl md:text-[9vw] lg:text-[8rem] font-bold tracking-tighter font-display leading-[0.9] text-foreground px-2 break-words"
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
            className="text-sm sm:text-base md:text-3xl text-text-secondary max-w-4xl mx-auto font-light leading-relaxed tracking-tight px-4 md:px-0"
          >
            The sovereign technical sanctuary for elite engineering teams. 
            AI-driven blueprinting meets deterministic live-sync orchestration.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 pt-4 md:pt-10 w-full px-4 md:px-0"
          >
            <Link 
              href={isAuthenticated ? "/workspaces" : "/register"} 
              className="w-full sm:w-auto bg-accent-blue hover:bg-accent-blue/90 text-foreground font-bold py-4 md:py-6 px-8 md:px-16 rounded-2xl transition-smooth flex items-center justify-center space-x-4 group shadow-2xl shadow-accent-blue/30 text-base md:text-xl"
            >
              <span>{isAuthenticated ? 'Enter Sanctuary' : 'Initialize Infrastructure'}</span>
              <ArrowRight className="w-5 md:w-6 h-5 md:h-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </motion.div>

        {/* Bottom Connector Bridge (Initialize -> Features) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-20 bg-gradient-to-t from-accent-purple/50 to-transparent md:hidden" />
      </section>

      {/* Feature Convergence Section */}
      <section className="relative z-10 py-12 md:py-40 px-6">
        <div className="max-w-7xl mx-auto">
          <header className="mb-12 md:mb-24 text-center">
            <h2 className="text-4xl md:text-7xl font-bold text-foreground font-display mb-4 md:mb-6 leading-tight">Sovereign Performance</h2>
            <p className="text-text-secondary text-base md:text-xl max-w-2xl mx-auto">
              Every technical card is grounded in real-time, secured by AES-256 encryption, and orchestrated by the Gemini intelligence engine.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {features.map((feature, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass-card p-8 md:p-10 space-y-4 md:space-y-6 group border-border-color hover:border-accent-blue/40 transition-smooth relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-accent-blue/10 transition-smooth" />
                
                <div className="w-12 h-12 md:w-16 md:h-16 bg-bg-secondary rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-accent-blue/10 transition-smooth relative z-10">
                  <feature.icon className={`w-6 h-6 md:w-8 md:h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold font-display text-foreground relative z-10">{feature.title}</h3>
                <p className="text-sm md:text-base text-text-secondary leading-relaxed relative z-10">{feature.desc}</p>
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
                   <span className="text-5xl md:text-9xl font-black text-foreground/5 hover:text-accent-blue/20 transition-smooth cursor-default font-display uppercase italic">
                     {text}
                   </span>
                   <Zap className="w-8 md:w-12 h-8 md:h-12 text-accent-blue/20" />
                 </div>
               ))}
            </div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
