"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Coins, FileImage, Upload, Shield, CheckCircle } from "lucide-react";

const loadingSteps = [
  {
    icon: <FileImage className="w-6 h-6" />,
    text: "Uploading badge image to IPFS...",
  },
  {
    icon: <Upload className="w-6 h-6" />,
    text: "Generating IPFS hash...",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    text: "Creating task on blockchain...",
  },
  {
    icon: <Coins className="w-6 h-6" />,
    text: "Minting NFT badge...",
  },
  {
    icon: <CheckCircle className="w-6 h-6" />,
    text: "Finalizing task creation...",
  },
];

export const BlockchainLoadingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 1 : prev));
    }, 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[500px]">
      <div className="w-full max-w-md space-y-8">
        {/* Animated Badge Icon */}
        <div className="relative h-48 flex items-center justify-center">
          {/* Central Badge */}
          <motion.div
            className="absolute z-10 w-24 h-24 rounded-2xl bg-gradient-to-br from-[#CA4A87] to-[#b13e74] flex items-center justify-center"
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Coins className="w-12 h-12 text-white" />
          </motion.div>

          {/* Orbiting Particles */}
          {[0, 1, 2, 3].map((i) => {
            const angle = (i * Math.PI * 2) / 4;
            const radius = 70;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            return (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full bg-gradient-to-br from-[#CA4A87] to-[#b13e74]"
                style={{
                  left: "50%",
                  top: "50%",
                }}
                animate={{
                  x: [0, x, 0],
                  y: [0, y, 0],
                  scale: [0.8, 1.5, 0.8],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeInOut",
                }}
              />
            );
          })}

          {/* Pulse Rings */}
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`ring-${i}`}
              className="absolute rounded-full border-2 border-[#CA4A87]"
              style={{
                width: 100,
                height: 100,
              }}
              animate={{
                scale: [1, 2.5],
                opacity: [0.5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.6,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Creating Task & Badge</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#CA4A87] to-[#b13e74]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="bg-card border border-border rounded-lg p-4">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#CA4A87] to-[#b13e74] flex items-center justify-center text-white flex-shrink-0">
              {loadingSteps[currentStep].icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {loadingSteps[currentStep].text}
              </p>
            </div>
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              className="w-5 h-5 border-2 border-[#CA4A87] border-t-transparent rounded-full"
            />
          </motion.div>
        </div>

        {/* Network Info */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-muted-foreground mb-1">IPFS</div>
            <div className="font-semibold text-[#CA4A87]">Uploading</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-muted-foreground mb-1">Blockchain</div>
            <div className="font-semibold text-[#CA4A87]">Pending</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="text-muted-foreground mb-1">NFT Badge</div>
            <div className="font-semibold text-[#CA4A87]">Minting</div>
          </div>
        </div>
      </div>
    </div>
  );
};
