'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

export default function NeuralNetwork() {
  const [neurons, setNeurons] = useState<{ id: number; x: number; y: number }[]>([]);
  const [synapses, setSynapses] = useState<{ from: number; to: number }[]>([]);
  const [pulseNodes, setPulseNodes] = useState<{ id: number; x: number; y: number; delay: number }[]>([]);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Generate a fixed set of neurons
    const newNeurons = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));
    setNeurons(newNeurons);

    // Connect close neurons
    const newSynapses: { from: number; to: number }[] = [];
    for (let i = 0; i < newNeurons.length; i++) {
      for (let j = i + 1; j < newNeurons.length; j++) {
        const dist = Math.sqrt(
          Math.pow(newNeurons[i].x - newNeurons[j].x, 2) + 
          Math.pow(newNeurons[i].y - newNeurons[j].y, 2)
        );
        if (dist < 15) {
          newSynapses.push({ from: i, to: j });
        }
      }
    }
    setSynapses(newSynapses);

    // Generate pulse nodes
    const newPulseNodes = Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      delay: Math.random() * 3
    }));
    setPulseNodes(newPulseNodes);
  }, []);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40">
      <svg className="w-full h-full">
        {synapses.map((syn, i) => {
          const from = neurons[syn.from];
          const to = neurons[syn.to];
          if (!from || !to) return null;

          return (
            <motion.line
              key={`syn-${i}`}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke="var(--accent-blue)"
              strokeWidth="1"
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{ 
                duration: 3 + Math.random() * 3, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          );
        })}
      </svg>

      {neurons.map((neuron) => (
        <motion.div
          key={neuron.id}
          className="absolute w-[3px] h-[3px] bg-accent-blue rounded-full shadow-[0_0_12px_rgba(59,130,246,0.8)]"
          style={{ left: `${neuron.x}%`, top: `${neuron.y}%` }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 4,
          }}
        />
      ))}

      {/* Pulsing Neural Nodes (Atmosphere) */}
      {pulseNodes.map((node) => (
        <motion.div
          key={`pulse-${node.id}`}
          className="absolute w-80 h-80 bg-accent-blue/10 rounded-full blur-[100px]"
          style={{ 
            left: `${node.x}%`, 
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8 + node.id * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: node.delay
          }}
        />
      ))}
    </div>
  );
}

