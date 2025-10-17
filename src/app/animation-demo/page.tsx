"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { IPFSLoadingAnimation, IPFSErrorAnimation } from "@/components/common";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertTriangle } from "lucide-react";
import { toastSuccess } from "@/utils/toast.utils";

export default function AnimationDemo() {
  const [showLoading, setShowLoading] = useState(false);
  const [showError, setShowError] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#CA4A87] to-[#b13e74] bg-clip-text text-transparent">
            IPFS Animation Showcase
          </h1>
          <p className="text-muted-foreground">
            Preview the loading and error animations for IPFS data fetching
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#CA4A87]" />
              Loading Animation
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Shows progressive loading steps when fetching data from IPFS
              network with animated nodes, connection lines, and progress bar.
            </p>
            <Button
              onClick={() => {
                setShowError(false);
                setShowLoading(true);
              }}
              className="w-full bg-gradient-to-r from-[#CA4A87] to-[#b13e74] hover:from-[#b13e74] hover:to-[#a0335f]"
            >
              Show Loading Animation
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Error Animation
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Displays when IPFS connection fails with broken network
              visualization, glitch effects, and troubleshooting tips.
            </p>
            <Button
              onClick={() => {
                setShowLoading(false);
                setShowError(true);
              }}
              variant="destructive"
              className="w-full"
            >
              Show Error Animation
            </Button>
          </div>
        </div>

        {showLoading && (
          <div className="bg-card border-2 border-[#CA4A87]/30 rounded-xl p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Loading State Preview</h3>
              <Button
                onClick={() => setShowLoading(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            <IPFSLoadingAnimation />
          </div>
        )}

        {showError && (
          <div className="bg-card border-2 border-red-500/30 rounded-xl p-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Error State Preview</h3>
              <Button
                onClick={() => setShowError(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            <IPFSErrorAnimation
              errorMessage="Failed to connect to IPFS gateway. The network might be experiencing high traffic or your internet connection is unstable."
              onRetry={() => {
                toastSuccess("Retrying IPFS connection...");
                setShowError(false);
              }}
            />
          </div>
        )}

        {!showLoading && !showError && (
          <div className="bg-muted/50 border border-border rounded-xl p-12 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#CA4A87] to-[#b13e74] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">
                Select an animation to preview
              </h3>
              <p className="text-muted-foreground">
                Choose from the options above to see the animations in action
              </p>
            </div>
          </div>
        )}

        <div className="mt-8 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-[#CA4A87] mb-2">
                Loading Animation
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>✨ Rotating IPFS node visualization</li>
                <li>🔄 6 orbiting network nodes</li>
                <li>📡 Animated connection lines</li>
                <li>📊 Progressive step indicators</li>
                <li>📈 Real-time progress bar</li>
                <li>🔐 Simulated IPFS hash display</li>
                <li>📡 Live network statistics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-500 mb-2">
                Error Animation
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>⚠️ Broken network visualization</li>
                <li>💥 Dynamic glitch effects</li>
                <li>🔴 Disconnecting node animations</li>
                <li>📉 Error status indicators</li>
                <li>🔄 Retry functionality</li>
                <li>💡 Troubleshooting tips</li>
                <li>↩️ Go back navigation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
