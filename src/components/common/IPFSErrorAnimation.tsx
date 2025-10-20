"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  ServerCrash,
  Clock,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface IPFSErrorAnimationProps {
  errorMessage?: string;
  onRetry?: () => void;
}

export const IPFSErrorAnimation = ({
  errorMessage = "Failed to load data from Blockchain or IPFS",
  onRetry,
}: IPFSErrorAnimationProps) => {
  const [glitchEffect, setGlitchEffect] = useState(false);
  const [disconnectedNodes, setDisconnectedNodes] = useState<number[]>([]);

  useEffect(() => {
    // Glitch effect interval
    const glitchInterval = setInterval(() => {
      setGlitchEffect(true);
      setTimeout(() => setGlitchEffect(false), 200);
    }, 3000);

    // Randomly disconnect nodes
    const nodeInterval = setInterval(() => {
      const randomNodes = Array.from(
        { length: Math.floor(Math.random() * 4) + 2 },
        () => Math.floor(Math.random() * 6)
      );
      setDisconnectedNodes(randomNodes);
    }, 1500);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(nodeInterval);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[500px] px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Broken Network Visualization */}
        <div className="relative h-64 flex items-center justify-center">
          {/* Central Error Icon */}
          <motion.div
            className="absolute z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center"
            animate={{
              scale: glitchEffect ? [1, 0.9, 1.1, 1] : 1,
              rotate: glitchEffect ? [0, -5, 5, 0] : 0,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            <AlertTriangle className="w-12 h-12 text-white" />
          </motion.div>

          {/* Broken Network Nodes */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI * 2) / 6;
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            const isDisconnected = disconnectedNodes.includes(i);

            return (
              <motion.div
                key={i}
                className={`absolute w-6 h-6 rounded-full ${
                  isDisconnected
                    ? "bg-gray-500 opacity-30"
                    : "bg-gradient-to-br from-red-500 to-red-700"
                }`}
                style={{
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: isDisconnected ? x * 1.2 : x,
                  y: isDisconnected ? y * 1.2 : y,
                  scale: isDisconnected ? [1, 0.8, 1] : [1, 1.1, 1],
                  opacity: isDisconnected ? 0.3 : [0.6, 1, 0.6],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            );
          })}

          {/* Broken Connection Lines with SVG */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ filter: glitchEffect ? "blur(2px)" : "blur(0px)" }}
          >
            <defs>
              <linearGradient
                id="errorLineGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#dc2626" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const angle = (i * Math.PI * 2) / 6;
              const radius = 100;
              const x = Math.cos(angle) * radius + 128;
              const y = Math.sin(angle) * radius + 128;
              const isDisconnected = disconnectedNodes.includes(i);

              return (
                <motion.line
                  key={i}
                  x1="128"
                  y1="128"
                  x2={x}
                  y2={y}
                  stroke={
                    isDisconnected ? "#6b7280" : "url(#errorLineGradient)"
                  }
                  strokeWidth="2"
                  strokeDasharray={isDisconnected ? "5,5" : "0"}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: isDisconnected ? [1, 0.5, 1] : [0, 1, 0],
                    opacity: isDisconnected ? 0.2 : [0, 0.8, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              );
            })}
          </svg>

          {/* Warning Pulse Rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`error-ring-${i}`}
              className="absolute inset-0 rounded-full border-2 border-red-500"
              initial={{ scale: 0.5, opacity: 0.8 }}
              animate={{
                scale: [0.5, 2.5, 3],
                opacity: [0.8, 0.2, 0],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 0.8,
                ease: "easeOut",
              }}
              style={{
                width: "96px",
                height: "96px",
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}
        </div>

        {/* Error Message Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border-2 border-red-500/30 rounded-2xl p-8"
        >
          <div className="text-center space-y-4">
            {/* Animated Error Title */}
            <motion.div
              animate={{
                scale: glitchEffect ? [1, 0.98, 1.02, 1] : 1,
              }}
              className="space-y-2"
            >
              <h2 className="text-3xl font-bold text-red-500 flex items-center justify-center gap-3">
                <ServerCrash className="w-8 h-8" />
                Connection Failed
              </h2>
              <p className="text-xl text-muted-foreground">
                Unable to reach Blockchain or IPFS network
              </p>
            </motion.div>

            {/* Error Details */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <p className="text-sm text-muted-foreground break-words">
                {errorMessage}
              </p>
            </div>

            {/* Network Status Indicators */}
            <div className="grid grid-cols-3 gap-4 py-4">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-xl"
              >
                <WifiOff className="w-6 h-6 text-red-500" />
                <span className="text-xs text-muted-foreground">
                  Network Down
                </span>
              </motion.div>

              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-xl"
              >
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
                <span className="text-xs text-muted-foreground">0 Peers</span>
              </motion.div>

              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                className="flex flex-col items-center gap-2 p-4 bg-muted/50 rounded-xl"
              >
                <ServerCrash className="w-6 h-6 text-red-500" />
                <span className="text-xs text-muted-foreground">
                  IPFS Offline
                </span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          {onRetry && (
            <Button
              onClick={onRetry}
              size="lg"
              className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white font-semibold group relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-white"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
                style={{ opacity: 0.1 }}
              />
              <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </Button>
          )}
        </motion.div>

        {/* Helpful Tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Try again later or check your connection</span>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Wifi className="w-4 h-4 text-primary" />
              Troubleshooting Tips
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Check your internet connection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Verify that IPFS gateway is accessible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>The network might be experiencing high traffic</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Try refreshing the page or come back later</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Glitch Effect Text */}
        <AnimatePresence>
          {glitchEffect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              className="text-center text-red-500 font-mono text-xs"
              style={{
                textShadow: "2px 2px 4px rgba(239, 68, 68, 0.5)",
              }}
            >
              [NETWORK_ERROR] :: IPFS_CONNECTION_TIMEOUT :: RETRY_INITIATED
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
