"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Code,
  BookOpen,
  Terminal,
  ExternalLink,
  Copy,
  Check,
  Info,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  LibrarySelector,
  type Library,
} from "@/components/developer/LibrarySelector";
import { CodeExample } from "@/components/developer/CodeExample";

const PROXY_ADDRESS = "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF";
const IPFS_GATEWAY_URL = "https://ipfs.de-id.xyz/ipfs";
const NETWORK = "Sepolia Testnet";
const RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

export default function DeveloperPortal() {
  const [library, setLibrary] = useState<Library>("ethers");

  // Code examples for Fetch User Profile
  const profileCode = {
    ethers: `import { ethers } from "ethers";
import DEID_PROFILE_ABI from "./DEiDProfile.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";

async function fetchUserProfile(walletAddress: string) {
  // 1. Create provider
  const provider = new ethers.JsonRpcProvider(RPC_URL);

  // 2. Connect to DEiDProfile contract via proxy
  const contract = new ethers.Contract(
    PROXY_ADDRESS,
    DEID_PROFILE_ABI.abi,
    provider
  );

  // 3. Fetch profile data
  const profile = await contract.getProfile(walletAddress);

  // 4. Parse profile data
  const profileData = {
    username: profile.username,
    metadataURI: profile.metadataURI,
    wallets: profile.wallets,
    socialAccounts: profile.socialAccounts,
    createdAt: Number(profile.createdAt),
    lastUpdated: Number(profile.lastUpdated),
    isActive: profile.isActive,
  };

  // 5. Fetch metadata from IPFS if available
  let metadata = null;
  if (profile.metadataURI && profile.metadataURI !== "") {
    const ipfsHash = profile.metadataURI.replace("ipfs://", "");
    const response = await fetch(\`${IPFS_GATEWAY_URL}/\${ipfsHash}\`);
    metadata = await response.json();
  }

  return { profile: profileData, metadata };
}

// Usage
const result = await fetchUserProfile("0x...");
console.log(result);`,

    viem: `import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import DEID_PROFILE_ABI from "./DEiDProfile.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";

async function fetchUserProfile(walletAddress: \`0x\${string}\`) {
  // 1. Create public client
  const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  // 2. Fetch profile data
  const profile = await client.readContract({
    address: PROXY_ADDRESS as \`0x\${string}\`,
    abi: DEID_PROFILE_ABI.abi,
    functionName: "getProfile",
    args: [walletAddress],
  });

  // 3. Parse profile data
  const profileData = {
    username: profile.username,
    metadataURI: profile.metadataURI,
    wallets: profile.wallets,
    socialAccounts: profile.socialAccounts,
    createdAt: Number(profile.createdAt),
    lastUpdated: Number(profile.lastUpdated),
    isActive: profile.isActive,
  };

  // 4. Fetch metadata from IPFS if available
  let metadata = null;
  if (profile.metadataURI && profile.metadataURI !== "") {
    const ipfsHash = profile.metadataURI.replace("ipfs://", "");
    const response = await fetch(\`${IPFS_GATEWAY_URL}/\${ipfsHash}\`);
    metadata = await response.json();
  }

  return { profile: profileData, metadata };
}

// Usage
const result = await fetchUserProfile("0x...");
console.log(result);`,

    web3: `import Web3 from "web3";
import DEID_PROFILE_ABI from "./DEiDProfile.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";

async function fetchUserProfile(walletAddress: string) {
  // 1. Create Web3 instance
  const web3 = new Web3(RPC_URL);

  // 2. Create contract instance
  const contract = new web3.eth.Contract(
    DEID_PROFILE_ABI.abi,
    PROXY_ADDRESS
  );

  // 3. Fetch profile data
  const profile = await contract.methods.getProfile(walletAddress).call();

  // 4. Parse profile data
  const profileData = {
    username: profile.username,
    metadataURI: profile.metadataURI,
    wallets: profile.wallets,
    socialAccounts: profile.socialAccounts,
    createdAt: Number(profile.createdAt),
    lastUpdated: Number(profile.lastUpdated),
    isActive: profile.isActive,
  };

  // 5. Fetch metadata from IPFS if available
  let metadata = null;
  if (profile.metadataURI && profile.metadataURI !== "") {
    const ipfsHash = profile.metadataURI.replace("ipfs://", "");
    const response = await fetch(\`${IPFS_GATEWAY_URL}/\${ipfsHash}\`);
    metadata = await response.json();
  }

  return { profile: profileData, metadata };
}

// Usage
const result = await fetchUserProfile("0x...");
console.log(result);`,
  };

  // Code examples for Fetch Trust Score
  const scoreCode = {
    ethers: `import { ethers } from "ethers";
import SCORE_FACET_ABI from "./ScoreFacet.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";
const IPFS_GATEWAY_URL = "${IPFS_GATEWAY_URL}";

async function fetchUserScore(walletAddress: string) {
  // 1. Create provider and connect to ScoreFacet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    PROXY_ADDRESS,
    SCORE_FACET_ABI.abi,
    provider
  );

  // 2. Get latest snapshot from contract
  const [cid, root, id, timestamp] = await contract.getLatestSnapshot();

  if (!cid || cid.length === 0) {
    throw new Error("No snapshot found");
  }

  // 3. Fetch snapshot data from IPFS
  const normalizedCID = cid.startsWith("ipfs://")
    ? cid.replace("ipfs://", "")
    : cid;
  const response = await fetch(\`\${IPFS_GATEWAY_URL}/\${normalizedCID}\`);
  const snapshotData = await response.json();

  // 4. Find user in snapshot
  const normalizedAddress = walletAddress.toLowerCase();
  const userData = snapshotData.users.find(
    (u: any) => u.address.toLowerCase() === normalizedAddress
  );

  if (!userData) {
    return null;
  }

  // 5. Return user score data
  return {
    address: userData.address,
    username: userData.username,
    totalScore: userData.totalScore,
    breakdown: {
      badgeScore: userData.breakdown.badgeScore,
      socialScore: userData.breakdown.socialScore,
      streakScore: userData.breakdown.streakScore,
      chainScore: userData.breakdown.chainScore,
      contributionScore: userData.breakdown.contributionScore,
    },
    rank: userData.rank,
    badges: userData.badges,
    socialAccounts: userData.socialAccounts,
    streakDays: userData.streakDays,
    lastUpdated: userData.lastUpdated,
  };
}

// Usage
const score = await fetchUserScore("0x...");
console.log(score);`,

    viem: `import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import SCORE_FACET_ABI from "./ScoreFacet.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";
const IPFS_GATEWAY_URL = "${IPFS_GATEWAY_URL}";

async function fetchUserScore(walletAddress: \`0x\${string}\`) {
  // 1. Create public client
  const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  // 2. Get latest snapshot from contract
  const [cid, root, id, timestamp] = await client.readContract({
    address: PROXY_ADDRESS as \`0x\${string}\`,
    abi: SCORE_FACET_ABI.abi,
    functionName: "getLatestSnapshot",
  });

  if (!cid || cid.length === 0) {
    throw new Error("No snapshot found");
  }

  // 3. Fetch snapshot data from IPFS
  const normalizedCID = cid.startsWith("ipfs://")
    ? cid.replace("ipfs://", "")
    : cid;
  const response = await fetch(\`\${IPFS_GATEWAY_URL}/\${normalizedCID}\`);
  const snapshotData = await response.json();

  // 4. Find user in snapshot
  const normalizedAddress = walletAddress.toLowerCase();
  const userData = snapshotData.users.find(
    (u: any) => u.address.toLowerCase() === normalizedAddress
  );

  if (!userData) {
    return null;
  }

  // 5. Return user score data
  return {
    address: userData.address,
    username: userData.username,
    totalScore: userData.totalScore,
    breakdown: {
      badgeScore: userData.breakdown.badgeScore,
      socialScore: userData.breakdown.socialScore,
      streakScore: userData.breakdown.streakScore,
      chainScore: userData.breakdown.chainScore,
      contributionScore: userData.breakdown.contributionScore,
    },
    rank: userData.rank,
    badges: userData.badges,
    socialAccounts: userData.socialAccounts,
    streakDays: userData.streakDays,
    lastUpdated: userData.lastUpdated,
  };
}

// Usage
const score = await fetchUserScore("0x...");
console.log(score);`,

    web3: `import Web3 from "web3";
import SCORE_FACET_ABI from "./ScoreFacet.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";
const IPFS_GATEWAY_URL = "${IPFS_GATEWAY_URL}";

async function fetchUserScore(walletAddress: string) {
  // 1. Create Web3 instance
  const web3 = new Web3(RPC_URL);
  const contract = new web3.eth.Contract(
    SCORE_FACET_ABI.abi,
    PROXY_ADDRESS
  );

  // 2. Get latest snapshot from contract
  const result = await contract.methods.getLatestSnapshot().call();
  const [cid, root, id, timestamp] = result;

  if (!cid || cid.length === 0) {
    throw new Error("No snapshot found");
  }

  // 3. Fetch snapshot data from IPFS
  const normalizedCID = cid.startsWith("ipfs://")
    ? cid.replace("ipfs://", "")
    : cid;
  const response = await fetch(\`\${IPFS_GATEWAY_URL}/\${normalizedCID}\`);
  const snapshotData = await response.json();

  // 4. Find user in snapshot
  const normalizedAddress = walletAddress.toLowerCase();
  const userData = snapshotData.users.find(
    (u: any) => u.address.toLowerCase() === normalizedAddress
  );

  if (!userData) {
    return null;
  }

  // 5. Return user score data
  return {
    address: userData.address,
    username: userData.username,
    totalScore: userData.totalScore,
    breakdown: {
      badgeScore: userData.breakdown.badgeScore,
      socialScore: userData.breakdown.socialScore,
      streakScore: userData.breakdown.streakScore,
      chainScore: userData.breakdown.chainScore,
      contributionScore: userData.breakdown.contributionScore,
    },
    rank: userData.rank,
    badges: userData.badges,
    socialAccounts: userData.socialAccounts,
    streakDays: userData.streakDays,
    lastUpdated: userData.lastUpdated,
  };
}

// Usage
const score = await fetchUserScore("0x...");
console.log(score);`,
  };

  // Code examples for Fetch Badges
  const badgesCode = {
    ethers: `import { ethers } from "ethers";
import BADGE_SYSTEM_ABI from "./BadgeSystem.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";
const IPFS_GATEWAY_URL = "${IPFS_GATEWAY_URL}";

async function fetchUserBadges(walletAddress: string) {
  // 1. Create provider and connect to BadgeSystem
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    PROXY_ADDRESS,
    BADGE_SYSTEM_ABI.abi,
    provider
  );

  // 2. Get user's badge token IDs
  const tokenIds = await contract.getUserBadges(walletAddress);
  const numericTokenIds = tokenIds.map((id: bigint) => Number(id));

  if (numericTokenIds.length === 0) {
    return [];
  }

  // 3. Fetch metadata for each badge
  const badges = [];
  for (const tokenId of numericTokenIds) {
    // Get token URI (IPFS hash)
    const tokenURI = await contract.tokenURI(tokenId);
    const ipfsHash = tokenURI.replace("ipfs://", "");

    // Fetch metadata from IPFS
    const response = await fetch(\`\${IPFS_GATEWAY_URL}/\${ipfsHash}\`);
    const metadata = await response.json();

    // Get image URL
    const imageHash = metadata.image.replace("ipfs://", "");
    const imageUrl = \`\${IPFS_GATEWAY_URL}/\${imageHash}\`;

    badges.push({
      tokenId,
      metadata,
      imageUrl,
    });
  }

  return badges;
}

// Usage
const badges = await fetchUserBadges("0x...");
console.log(badges);`,

    viem: `import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import BADGE_SYSTEM_ABI from "./BadgeSystem.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";
const IPFS_GATEWAY_URL = "${IPFS_GATEWAY_URL}";

async function fetchUserBadges(walletAddress: \`0x\${string}\`) {
  // 1. Create public client
  const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  // 2. Get user's badge token IDs
  const tokenIds = await client.readContract({
    address: PROXY_ADDRESS as \`0x\${string}\`,
    abi: BADGE_SYSTEM_ABI.abi,
    functionName: "getUserBadges",
    args: [walletAddress],
  });

  const numericTokenIds = tokenIds.map((id: bigint) => Number(id));

  if (numericTokenIds.length === 0) {
    return [];
  }

  // 3. Fetch metadata for each badge
  const badges = [];
  for (const tokenId of numericTokenIds) {
    // Get token URI (IPFS hash)
    const tokenURI = await client.readContract({
      address: PROXY_ADDRESS as \`0x\${string}\`,
      abi: BADGE_SYSTEM_ABI.abi,
      functionName: "tokenURI",
      args: [BigInt(tokenId)],
    });

    const ipfsHash = tokenURI.replace("ipfs://", "");

    // Fetch metadata from IPFS
    const response = await fetch(\`\${IPFS_GATEWAY_URL}/\${ipfsHash}\`);
    const metadata = await response.json();

    // Get image URL
    const imageHash = metadata.image.replace("ipfs://", "");
    const imageUrl = \`\${IPFS_GATEWAY_URL}/\${imageHash}\`;

    badges.push({
      tokenId,
      metadata,
      imageUrl,
    });
  }

  return badges;
}

// Usage
const badges = await fetchUserBadges("0x...");
console.log(badges);`,

    web3: `import Web3 from "web3";
import BADGE_SYSTEM_ABI from "./BadgeSystem.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";
const IPFS_GATEWAY_URL = "${IPFS_GATEWAY_URL}";

async function fetchUserBadges(walletAddress: string) {
  // 1. Create Web3 instance
  const web3 = new Web3(RPC_URL);
  const contract = new web3.eth.Contract(
    BADGE_SYSTEM_ABI.abi,
    PROXY_ADDRESS
  );

  // 2. Get user's badge token IDs
  const tokenIds = await contract.methods.getUserBadges(walletAddress).call();
  const numericTokenIds = tokenIds.map((id: string) => Number(id));

  if (numericTokenIds.length === 0) {
    return [];
  }

  // 3. Fetch metadata for each badge
  const badges = [];
  for (const tokenId of numericTokenIds) {
    // Get token URI (IPFS hash)
    const tokenURI = await contract.methods.tokenURI(tokenId).call();
    const ipfsHash = tokenURI.replace("ipfs://", "");

    // Fetch metadata from IPFS
    const response = await fetch(\`\${IPFS_GATEWAY_URL}/\${ipfsHash}\`);
    const metadata = await response.json();

    // Get image URL
    const imageHash = metadata.image.replace("ipfs://", "");
    const imageUrl = \`\${IPFS_GATEWAY_URL}/\${imageHash}\`;

    badges.push({
      tokenId,
      metadata,
      imageUrl,
    });
  }

  return badges;
}

// Usage
const badges = await fetchUserBadges("0x...");
console.log(badges);`,
  };

  // Code examples for Fetch Social Accounts
  const socialAccountsCode = {
    ethers: `import { ethers } from "ethers";
import DEID_PROFILE_ABI from "./DEiDProfile.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";

async function fetchSocialAccounts(walletAddress: string) {
  // 1. Create provider and connect to DEiDProfile
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(
    PROXY_ADDRESS,
    DEID_PROFILE_ABI.abi,
    provider
  );

  // 2. Get social accounts
  const [platforms, accountIds] = await contract.getSocialAccounts(walletAddress);

  // 3. Map results to structured format
  const socialAccounts = platforms.map((platform: string, index: number) => ({
    platform: platform.toLowerCase(),
    accountId: accountIds[index],
  }));

  return socialAccounts;
}

// Usage
const accounts = await fetchSocialAccounts("0x...");
console.log(accounts);
// Output: [{ platform: "discord", accountId: "123456789" }, ...]`,

    viem: `import { createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import DEID_PROFILE_ABI from "./DEiDProfile.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";

async function fetchSocialAccounts(walletAddress: \`0x\${string}\`) {
  // 1. Create public client
  const client = createPublicClient({
    chain: sepolia,
    transport: http(RPC_URL),
  });

  // 2. Get social accounts
  const [platforms, accountIds] = await client.readContract({
    address: PROXY_ADDRESS as \`0x\${string}\`,
    abi: DEID_PROFILE_ABI.abi,
    functionName: "getSocialAccounts",
    args: [walletAddress],
  });

  // 3. Map results to structured format
  const socialAccounts = platforms.map((platform: string, index: number) => ({
    platform: platform.toLowerCase(),
    accountId: accountIds[index],
  }));

  return socialAccounts;
}

// Usage
const accounts = await fetchSocialAccounts("0x...");
console.log(accounts);
// Output: [{ platform: "discord", accountId: "123456789" }, ...]`,

    web3: `import Web3 from "web3";
import DEID_PROFILE_ABI from "./DEiDProfile.json";

const PROXY_ADDRESS = "${PROXY_ADDRESS}";
const RPC_URL = "${RPC_URL}";

async function fetchSocialAccounts(walletAddress: string) {
  // 1. Create Web3 instance
  const web3 = new Web3(RPC_URL);
  const contract = new web3.eth.Contract(
    DEID_PROFILE_ABI.abi,
    PROXY_ADDRESS
  );

  // 2. Get social accounts
  const result = await contract.methods.getSocialAccounts(walletAddress).call();
  const [platforms, accountIds] = result;

  // 3. Map results to structured format
  const socialAccounts = platforms.map((platform: string, index: number) => ({
    platform: platform.toLowerCase(),
    accountId: accountIds[index],
  }));

  return socialAccounts;
}

// Usage
const accounts = await fetchSocialAccounts("0x...");
console.log(accounts);
// Output: [{ platform: "discord", accountId: "123456789" }, ...]`,
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-8">
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/setting">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Settings
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <Code className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Developer Portal</h1>
              <p className="text-muted-foreground mt-2">
                On-chain data fetching tutorials for DEiD platform
              </p>
            </div>
          </div>

          {/* Library Selector */}
          <div className="mb-6">
            <LibrarySelector value={library} onChange={setLibrary} />
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="score">Trust Score</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="social">Social Accounts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Introduction
                </CardTitle>
                <CardDescription>
                  Learn how to fetch on-chain data from DEiD smart contracts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  DEiD uses a Diamond Proxy pattern where all facets
                  (DEiDProfile, ScoreFacet, BadgeSystem) are accessible through
                  a single proxy address. This tutorial shows you how to fetch
                  user data directly from the blockchain.
                </p>

                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <h4 className="font-semibold">Contract Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Proxy Address:</strong>
                      <code className="ml-2 bg-background px-2 py-1 rounded">
                        {PROXY_ADDRESS}
                      </code>
                    </div>
                    <div>
                      <strong>Network:</strong> <span>{NETWORK}</span>
                    </div>
                    <div>
                      <strong>IPFS Gateway:</strong>{" "}
                      <code className="bg-background px-2 py-1 rounded">
                        {IPFS_GATEWAY_URL}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Prerequisites</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm">
                    <li>Node.js 18+ installed</li>
                    <li>
                      Install your preferred library:
                      <ul className="list-disc pl-6 mt-1">
                        <li>
                          <code>npm install ethers</code> (ethers.js v6)
                        </li>
                        <li>
                          <code>npm install viem</code> (viem v1)
                        </li>
                        <li>
                          <code>npm install web3</code> (web3.js v4)
                        </li>
                      </ul>
                    </li>
                    <li>RPC endpoint (Infura, Alchemy, or public RPC)</li>
                    <li>Contract ABIs (available in this repository)</li>
                  </ul>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Important
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        All DEiD facets (DEiDProfile, ScoreFacet, BadgeSystem)
                        are accessed through the same proxy address:{" "}
                        <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                          {PROXY_ADDRESS}
                        </code>
                        . Use the appropriate ABI for each contract function you
                        want to call.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fetch User Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fetch User Profile</CardTitle>
                <CardDescription>
                  Get user profile data from DEiDProfile contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      Fetch basic profile information including username,
                      metadata URI, linked wallets, and social accounts. The
                      metadata URI points to IPFS where additional profile
                      details are stored.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Steps</h4>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                      <li>Connect to the DEiDProfile contract via proxy</li>
                      <li>
                        Call <code>getProfile(walletAddress)</code>
                      </li>
                      <li>Parse the returned profile data</li>
                      <li>
                        Optionally fetch metadata from IPFS using metadataURI
                      </li>
                    </ol>
                  </div>

                  <CodeExample
                    ethers={profileCode.ethers}
                    viem={profileCode.viem}
                    web3={profileCode.web3}
                    library={library}
                    title="Complete Example"
                  />

                  <div>
                    <h4 className="font-semibold mb-2">Response Structure</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`interface OnChainProfile {
  username: string;
  metadataURI: string;
  wallets: string[];
  socialAccounts: string[];
  createdAt: number;
  lastUpdated: number;
  isActive: boolean;
}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fetch Trust Score Tab */}
          <TabsContent value="score" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fetch Trust Score</CardTitle>
                <CardDescription>
                  Get user trust score from ScoreFacet contract and IPFS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      Trust scores are stored in IPFS snapshots. First, get the
                      latest snapshot CID from the ScoreFacet contract, then
                      fetch the snapshot data from IPFS and find the user's
                      score data.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Steps</h4>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                      <li>Connect to ScoreFacet contract via proxy</li>
                      <li>
                        Call <code>getLatestSnapshot()</code> to get CID
                      </li>
                      <li>Fetch snapshot data from IPFS gateway</li>
                      <li>Find user in snapshot by wallet address</li>
                      <li>Parse score breakdown and related data</li>
                    </ol>
                  </div>

                  <CodeExample
                    ethers={scoreCode.ethers}
                    viem={scoreCode.viem}
                    web3={scoreCode.web3}
                    library={library}
                    title="Complete Example"
                  />

                  <div>
                    <h4 className="font-semibold mb-2">Response Structure</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`interface UserScoreData {
  address: string;
  username: string;
  totalScore: number;
  breakdown: {
    badgeScore: number;
    socialScore: number;
    streakScore: number;
    chainScore: number;
    contributionScore: number;
  };
  rank: number;
  badges: Array<{ tokenId: number; ... }>;
  socialAccounts: Array<{ platform: string; accountId: string }>;
  streakDays: number;
  lastUpdated: number;
}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fetch Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fetch User Badges</CardTitle>
                <CardDescription>
                  Get user badges from BadgeSystem contract and IPFS
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      Badges are ERC-721 NFTs. Get the user's badge token IDs,
                      then fetch metadata and images from IPFS for each badge.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Steps</h4>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                      <li>Connect to BadgeSystem contract via proxy</li>
                      <li>
                        Call <code>getUserBadges(walletAddress)</code> to get
                        token IDs
                      </li>
                      <li>
                        For each token ID, call <code>tokenURI(tokenId)</code>{" "}
                        to get IPFS hash
                      </li>
                      <li>Fetch badge metadata from IPFS</li>
                      <li>Construct image URL from metadata</li>
                    </ol>
                  </div>

                  <CodeExample
                    ethers={badgesCode.ethers}
                    viem={badgesCode.viem}
                    web3={badgesCode.web3}
                    library={library}
                    title="Complete Example"
                  />

                  <div>
                    <h4 className="font-semibold mb-2">Response Structure</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`interface UserBadge {
  tokenId: number;
  metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{
      trait_type: string;
      value: string | number;
    }>;
  };
  imageUrl: string;
}`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fetch Social Accounts Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fetch Social Accounts</CardTitle>
                <CardDescription>
                  Get linked social accounts from DEiDProfile contract
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Overview</h4>
                    <p className="text-sm text-muted-foreground">
                      Get all social accounts (Discord, GitHub, Google,
                      Facebook, etc.) linked to a user's wallet address.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Steps</h4>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                      <li>Connect to DEiDProfile contract via proxy</li>
                      <li>
                        Call <code>getSocialAccounts(walletAddress)</code>
                      </li>
                      <li>
                        Map platforms and accountIds arrays to structured format
                      </li>
                    </ol>
                  </div>

                  <CodeExample
                    ethers={socialAccountsCode.ethers}
                    viem={socialAccountsCode.viem}
                    web3={socialAccountsCode.web3}
                    library={library}
                    title="Complete Example"
                  />

                  <div>
                    <h4 className="font-semibold mb-2">Response Structure</h4>
                    <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                      <code>{`interface SocialAccount {
  platform: string;  // "discord", "github", "google", "facebook", etc.
  accountId: string;  // Platform-specific user ID
}

// Example output:
[
  { platform: "discord", accountId: "123456789" },
  { platform: "github", accountId: "username" },
  { platform: "google", accountId: "user@gmail.com" }
]`}</code>
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
