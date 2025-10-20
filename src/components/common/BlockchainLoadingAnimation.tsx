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

// Generate random hex string
const generateRandomHash = (length: number) => {
  const chars = "0123456789abcdef";
  let hash = "";
  for (let i = 0; i < length; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

export const BlockchainLoadingAnimation = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  // Dynamic hashes that update
  const [ipfsHash, setIpfsHash] = useState("Qm" + generateRandomHash(44));
  const [txHash, setTxHash] = useState("0x" + generateRandomHash(64));
  const [tokenId, setTokenId] = useState(Math.floor(Math.random() * 99999));

  // Dynamic status text
  const [ipfsStatus, setIpfsStatus] = useState("Uploading");
  const [blockchainStatus, setBlockchainStatus] = useState("Pending");
  const [nftStatus, setNftStatus] = useState("Minting");

  useEffect(() => {
    // Fixed values to prevent hydration mismatch
    setIpfsHash("Qm" + generateRandomHash(44));
    setTxHash("0x" + generateRandomHash(64));
    setTokenId(Math.floor(Math.random() * 99999));

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) =>
        prev < loadingSteps.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => (prev < 95 ? prev + 1 : prev));
    }, 100);

    // Update IPFS hash every 800ms
    const ipfsInterval = setInterval(() => {
      setIpfsHash("Qm" + generateRandomHash(44));
    }, 800);

    // Update TX hash every 1200ms
    const txInterval = setInterval(() => {
      setTxHash("0x" + generateRandomHash(64));
    }, 1200);

    // Update Token ID every 1000ms
    const tokenInterval = setInterval(() => {
      setTokenId(Math.floor(Math.random() * 99999));
    }, 1000);

    // Cycle through IPFS statuses
    const ipfsStatusInterval = setInterval(() => {
      const statuses = ["Uploading", "Processing", "Calculating", "Verifying"];
      setIpfsStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 1500);

    // Cycle through blockchain statuses
    const blockchainStatusInterval = setInterval(() => {
      const statuses = ["Pending", "Confirming", "Validating", "Broadcasting"];
      setBlockchainStatus(
        statuses[Math.floor(Math.random() * statuses.length)]
      );
    }, 1300);

    // Cycle through NFT statuses
    const nftStatusInterval = setInterval(() => {
      const statuses = ["Minting", "Encoding", "Generating", "Creating"];
      setNftStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    }, 1100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
      clearInterval(ipfsInterval);
      clearInterval(txInterval);
      clearInterval(tokenInterval);
      clearInterval(ipfsStatusInterval);
      clearInterval(blockchainStatusInterval);
      clearInterval(nftStatusInterval);
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

        {/* Network Info with Dynamic Data */}
        <div className="space-y-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-muted-foreground">IPFS Hash</div>
              <motion.div
                key={ipfsStatus}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-semibold text-[#CA4A87]"
              >
                {ipfsStatus}
              </motion.div>
            </div>
            <motion.div
              key={ipfsHash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-xs text-muted-foreground truncate"
            >
              {ipfsHash}
            </motion.div>
          </div>

          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-muted-foreground">
                Transaction Hash
              </div>
              <motion.div
                key={blockchainStatus}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-semibold text-[#CA4A87]"
              >
                {blockchainStatus}
              </motion.div>
            </div>
            <motion.div
              key={txHash}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-xs text-muted-foreground truncate"
            >
              {txHash}
            </motion.div>
          </div>

          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="text-xs text-muted-foreground">NFT Token ID</div>
              <motion.div
                key={nftStatus}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-semibold text-[#CA4A87]"
              >
                {nftStatus}
              </motion.div>
            </div>
            <motion.div
              key={tokenId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-base font-bold text-foreground"
            >
              #{tokenId.toString().padStart(5, "0")}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
