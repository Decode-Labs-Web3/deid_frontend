"use client";

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
  Key,
  Zap,
  BookOpen,
  Terminal,
  Shield,
  Clock,
  Users,
  Database,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function DeveloperPortal() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [avgResponse, setAvgResponse] = useState(50);
  const [isUpdating, setIsUpdating] = useState(false);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Update average response time every 2-3 seconds
  useEffect(() => {
    const updateResponseTime = () => {
      setIsUpdating(true);

      // Show updating flash for 200ms
      setTimeout(() => {
        const newResponseTime = Math.floor(Math.random() * 51) + 50; // 50-100ms
        setAvgResponse(newResponseTime);
        setIsUpdating(false);
      }, 200);

      // Schedule next update in 2-3 seconds
      const nextUpdate = Math.floor(Math.random() * 1000) + 2000; // 2-3 seconds
      setTimeout(updateResponseTime, nextUpdate);
    };

    // Start the first update after 2-3 seconds
    const initialDelay = Math.floor(Math.random() * 1000) + 2000;
    const timeoutId = setTimeout(updateResponseTime, initialDelay);

    return () => clearTimeout(timeoutId);
  }, []);

  const codeExamples = {
    auth: `// Authentication Example
const response = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    walletAddress: '0x...',
    signature: '0x...'
  })
});

const { token } = await response.json();`,

    profile: `// Get User Profile
const profile = await fetch('/api/v1/profile/me', {
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});

const userData = await profile.json();`,

    nft: `// Mint NFT Badge
const mintResponse = await fetch('/api/v1/badge/mint', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${token}\`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    badgeType: 'verification',
    metadata: {
      title: 'Verified Developer',
      description: 'Certified blockchain developer'
    }
  })
});`,
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
                API documentation and developer resources for DEiD platform
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Status Banner */}
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                    Developer API - Coming Soon
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    We're building a comprehensive API for developers. Stay
                    tuned for updates!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Database className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">
                      API Endpoints
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">1,200</p>
                    <p className="text-sm text-muted-foreground">
                      Active Developers
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">99.9%</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-8 h-8 text-primary" />
                  <div>
                    <p
                      className={`text-2xl font-bold transition-all duration-200 ${
                        isUpdating
                          ? "text-blue-500 animate-pulse"
                          : "text-foreground"
                      }`}
                    >
                      {avgResponse}ms
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Avg Response
                      {isUpdating && (
                        <span className="ml-2 text-blue-500 text-xs animate-pulse">
                          Updating...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="authentication">Auth</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    API Overview
                  </CardTitle>
                  <CardDescription>
                    Comprehensive REST API for DEiD platform integration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    The DEiD API provides developers with powerful tools to
                    integrate decentralized identity functionality into their
                    applications. Build on top of blockchain technology with our
                    easy-to-use REST endpoints.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Core Features</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>User authentication & profile management</li>
                        <li>NFT badge minting & verification</li>
                        <li>Blockchain transaction handling</li>
                        <li>IPFS metadata storage</li>
                        <li>Social account verification</li>
                        <li>Trust scoring algorithms</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Technical Specs</h4>
                      <ul className="list-disc pl-6 space-y-1 text-sm">
                        <li>RESTful API design</li>
                        <li>JSON request/response format</li>
                        <li>JWT-based authentication</li>
                        <li>Rate limiting & throttling</li>
                        <li>Comprehensive error handling</li>
                        <li>Webhook support (coming soon)</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Getting Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        1
                      </Badge>
                      <div>
                        <h4 className="font-semibold">
                          Register for API Access
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Sign up for a developer account and get your API keys
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        2
                      </Badge>
                      <div>
                        <h4 className="font-semibold">
                          Authenticate Your Requests
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Use JWT tokens to authenticate API calls
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">
                        3
                      </Badge>
                      <div>
                        <h4 className="font-semibold">Start Building</h4>
                        <p className="text-sm text-muted-foreground">
                          Integrate our endpoints into your application
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="authentication" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Authentication
                  </CardTitle>
                  <CardDescription>
                    Secure your API requests with JWT authentication
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    All API requests require authentication using JWT tokens.
                    Tokens are obtained through wallet-based authentication.
                  </p>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Authentication Flow</h4>
                    <ol className="list-decimal pl-6 space-y-2 text-sm">
                      <li>User connects wallet to your application</li>
                      <li>Generate a signature challenge</li>
                      <li>User signs the challenge with their wallet</li>
                      <li>Submit signature to our auth endpoint</li>
                      <li>Receive JWT token for API access</li>
                    </ol>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Request Headers</h4>
                    <div className="bg-muted p-4 rounded-lg font-mono text-sm">
                      Authorization: Bearer {"{your-jwt-token}"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Endpoints</CardTitle>
                  <CardDescription>
                    Complete list of available API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/v1/auth/login</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Authenticate user with wallet signature
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">GET</Badge>
                        <code className="text-sm">/api/v1/profile/me</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get current user profile information
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/v1/badge/mint</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mint a new NFT badge for user
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">GET</Badge>
                        <code className="text-sm">/api/v1/nft/owned</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Get user's owned NFT badges
                      </p>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">POST</Badge>
                        <code className="text-sm">/api/v1/ipfs/upload</code>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Upload metadata to IPFS
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="examples" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Code Examples
                  </CardTitle>
                  <CardDescription>
                    Practical examples for common API operations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Authentication</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(codeExamples.auth, "auth")
                          }
                        >
                          {copiedCode === "auth" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{codeExamples.auth}</code>
                      </pre>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Get User Profile</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(codeExamples.profile, "profile")
                          }
                        >
                          {copiedCode === "profile" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{codeExamples.profile}</code>
                      </pre>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">Mint NFT Badge</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(codeExamples.nft, "nft")
                          }
                        >
                          {copiedCode === "nft" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                        <code>{codeExamples.nft}</code>
                      </pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="support" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Developer Support
                  </CardTitle>
                  <CardDescription>
                    Get help with API integration and development
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Documentation</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Complete API reference</li>
                        <li>• Integration guides</li>
                        <li>• Best practices</li>
                        <li>• SDK documentation</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Support Channels</h4>
                      <ul className="space-y-1 text-sm">
                        <li>• Email: dev-support@deid.network</li>
                        <li>• Discord: DEiD Developers</li>
                        <li>• GitHub: Issues & Discussions</li>
                        <li>• Stack Overflow: #deid-api</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Rate Limits</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <strong>Free Tier:</strong>
                        <br />
                        1,000 requests/day
                      </div>
                      <div>
                        <strong>Pro Tier:</strong>
                        <br />
                        10,000 requests/day
                      </div>
                      <div>
                        <strong>Enterprise:</strong>
                        <br />
                        Custom limits
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Developer Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button asChild>
                      <a href="mailto:dev-support@deid.network">
                        <Shield className="w-4 h-4 mr-2" />
                        Email Support
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a
                        href="https://discord.gg/deid"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Join Discord
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
