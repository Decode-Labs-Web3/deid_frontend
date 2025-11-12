"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { getSessionId } from "@/utils/session.utils";

interface PrimaryWallet {
  _id: string;
  address: string;
  user_id: string;
  name_service: string | null;
  is_primary: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ProfileData {
  _id: string;
  email: string | null;
  username: string;
  display_name: string;
  bio: string;
  avatar_ipfs_hash: string;
  role: string;
  last_login: string;
  is_active: boolean;
  primary_wallet: PrimaryWallet;
  wallets: unknown;
  following_number: number;
  followers_number: number;
  is_following: boolean;
  is_follower: boolean;
  is_blocked: boolean;
  is_blocked_by: boolean;
  mutual_followers_number: number;
  mutual_followers_list: unknown[];
  __v: number;
}

interface ApiResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ProfileData;
  requestId: string | null;
}

export const WalletValidator = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [primaryWalletAddress, setPrimaryWalletAddress] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidWallet, setIsValidWallet] = useState<boolean | null>(null);

  // Fetch primary wallet address from backend
  const fetchPrimaryWallet = async () => {
    try {
      setIsLoading(true);
      const sessionId = getSessionId();

      if (!sessionId) {
        console.log("❌ No session found for wallet validation");
        return;
      }

      // Use the same backend URL pattern as the profile page
      const backendUrl =
        process.env.NEXT_PUBLIC_DEID_AUTH_BACKEND || "http://localhost:8000";
      const apiUrl = `${backendUrl}/api/v1/decode/my-profile`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: `deid_session_id=${sessionId}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const apiResponse: ApiResponse = await response.json();
        if (apiResponse.success && apiResponse.data.primary_wallet?.address) {
          setPrimaryWalletAddress(
            apiResponse.data.primary_wallet.address.toLowerCase()
          );
          console.log(
            "✅ Primary wallet fetched:",
            apiResponse.data.primary_wallet.address
          );
        }
      }
    } catch (error) {
      console.error("❌ Error fetching primary wallet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if connected wallet matches primary wallet
  useEffect(() => {
    if (isConnected && connectedAddress && primaryWalletAddress) {
      const isMatch =
        connectedAddress.toLowerCase() === primaryWalletAddress.toLowerCase();
      setIsValidWallet(isMatch);
      console.log("🔍 Wallet validation:", {
        connected: connectedAddress,
        primary: primaryWalletAddress,
        isMatch,
      });
    } else if (!isConnected) {
      setIsValidWallet(null);
    }
  }, [isConnected, connectedAddress, primaryWalletAddress]);

  // Fetch primary wallet when component mounts
  useEffect(() => {
    fetchPrimaryWallet();
  }, []);

  // Don't show validation if wallet is not connected or still loading
  if (!isConnected || isLoading || !primaryWalletAddress) {
    return (
      <div className="flex items-center gap-4">
        <ConnectButton
          chainStatus="icon"
          accountStatus={{
            smallScreen: "avatar",
            largeScreen: "full",
          }}
          showBalance={{
            smallScreen: false,
            largeScreen: true,
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {/* Wallet validation alert */}
      {isValidWallet === false && (
        <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
          <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          <AlertDescription className="text-orange-800 dark:text-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                Please connect your primary wallet:{" "}
                <span className="font-mono">
                  {primaryWalletAddress.slice(0, 6)}...
                  {primaryWalletAddress.slice(-6)}
                </span>
              </span>
              <Button
                size="sm"
                variant="outline"
                className="ml-2 text-orange-600 border-orange-300 hover:bg-orange-100 dark:text-orange-400 dark:border-orange-600 dark:hover:bg-orange-900/30"
                onClick={() => {
                  // Disconnect current wallet to allow user to connect the correct one
                  disconnect();
                }}
              >
                Switch Wallet
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success indicator */}
      {isValidWallet === true && (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Primary Wallet Connected</span>
        </div>
      )}

      <ConnectButton
        chainStatus="icon"
        accountStatus={{
          smallScreen: "avatar",
          largeScreen: "full",
        }}
        showBalance={{
          smallScreen: false,
          largeScreen: true,
        }}
      />
    </div>
  );
};
