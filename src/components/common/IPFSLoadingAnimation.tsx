"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Globe, Lock, Shield, Boxes, Network } from "lucide-react";

interface LoadingStep {
  icon: React.ReactNode;
  text: string;
  delay: number;
}

const loadingSteps: LoadingStep[] = [
  {
    icon: <Database className="w-6 h-6" />,
    text: "Connecting to IPFS network...",
    delay: 0,
  },
  {
    icon: <Network className="w-6 h-6" />,
    text: "Resolving decentralized storage...",
    delay: 800,
  },
  {
    icon: <Boxes className="w-6 h-6" />,
    text: "Fetching blockchain data...",
    delay: 1600,
  },
  {
    icon: <Shield className="w-6 h-6" />,
    text: "Verifying cryptographic signatures...",
    delay: 2400,
  },
  {
    icon: <Lock className="w-6 h-6" />,
    text: "Decrypting profile metadata...",
    delay: 3200,
  },
  {
    icon: <Globe className="w-6 h-6" />,
    text: "Syncing with distributed nodes...",
    delay: 4000,
  },
];

export const IPFSLoadingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Initialize random values with fixed values to prevent hydration mismatch
  const [ipfsHash, setIpfsHash] = useState(
    "qm1234567890abcdefghijklmnopqrstuvwxyz012345"
  );
  const [nodesCount, setNodesCount] = useState(125);
  const [peersCount, setPeersCount] = useState(25);
  const [latencyMs, setLatencyMs] = useState(750);

  useEffect(() => {
    // Generate random values only on client
    const generateRandomHash = () => {
      return Array.from({ length: 46 })
        .map(
          () =>
            "abcdefghijklmnopqrstuvwxyz0123456789"[
              Math.floor(Math.random() * 36)
            ]
        )
        .join("");
    };

    setIpfsHash(generateRandomHash());
    setNodesCount(Math.floor(Math.random() * 50 + 100));
    setPeersCount(Math.floor(Math.random() * 10 + 20));
    setLatencyMs(Math.floor(Math.random() * 500 + 500));

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 300);

    // Step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 800);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="w-full max-w-md space-y-8">
        {/* Animated Hexagon Network */}
        <div className="relative h-48 flex items-center justify-center">
          {/* Central IPFS Icon */}
          <motion.div
            className="absolute z-10 w-20 h-20 rounded-2xl bg-gradient-to-br from-[#CA4A87] to-[#b13e74] flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1.2, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Database className="w-10 h-10 text-white" />
          </motion.div>

          {/* Orbiting Nodes */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI * 2) / 6;
            const radius = 80;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full bg-gradient-to-br from-[#CA4A87] to-[#b13e74]"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: [0, x, 0],
                  y: [0, y, 0],
                  scale: [0.8, 1.2, 0.8],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            );
          })}

          {/* Connecting Lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ filter: "blur(1px)" }}
          >
            <defs>
              <linearGradient
                id="lineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#CA4A87" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#b13e74" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * Math.PI * 2) / 6;
              const radius = 80;
              const x = Math.cos(angle) * radius + 96; // center + offset
              const y = Math.sin(angle) * radius + 96;

              return (
                <motion.line
                  key={i}
                  x1="96"
                  y1="96"
                  x2={x}
                  y2={y}
                  stroke="url(#lineGradient)"
                  strokeWidth="2"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0, 1, 0],
                    opacity: [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                    ease: "easeInOut",
                  }}
                />
              );
            })}
          </svg>

          {/* Pulse Rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute inset-0 rounded-full border-2 border-[#CA4A87]"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{
                scale: [0.5, 2, 2.5],
                opacity: [0.8, 0.3, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeOut",
              }}
              style={{
                width: "80px",
                height: "80px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* Loading Steps */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-3 p-3 rounded-lg transition-all bg-gradient-to-r from-[#CA4A87]/20 to-[#b13e74]/20 border border-[#CA4A87]/30"
            >
              <motion.div
                className="p-2 rounded-lg bg-gradient-to-br from-[#CA4A87] to-[#b13e74] text-white"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                }}
              >
                {loadingSteps[currentStep].icon}
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {loadingSteps[currentStep].text}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Loading from IPFS...</span>
            <span>{Math.min(progress, 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#CA4A87] to-[#b13e74]"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Blockchain Hash Simulation */}
        <div className="bg-card border border-border rounded-lg p-4 font-mono text-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground">IPFS Hash:</span>
          </div>
          <motion.div
            className="text-[#CA4A87] break-all"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            {ipfsHash}
          </motion.div>
        </div>

        {/* Decentralized Network Info */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-card border border-border rounded-lg p-3">
            <motion.div
              className="text-2xl font-bold text-[#CA4A87]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {nodesCount}
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1">Nodes</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <motion.div
              className="text-2xl font-bold text-[#CA4A87]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
            >
              {peersCount}
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1">Peers</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <motion.div
              className="text-2xl font-bold text-[#CA4A87]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
            >
              {latencyMs}
            </motion.div>
            <div className="text-xs text-muted-foreground mt-1">ms</div>
          </div>
        </div>
      </div>
    </div>
  );
};
