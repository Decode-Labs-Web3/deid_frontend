"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { isAdmin } from "@/utils/session.utils";
import { Shield, Users, Database, Activity, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const checkAdminAccess = () => {
      const adminStatus = isAdmin();
      setUserIsAdmin(adminStatus);

      if (!adminStatus) {
        // Redirect to profile if not admin
        router.push("/profile");
      } else {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [router]);

  if (loading || !userIsAdmin) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-pink-500 mx-auto mb-4 animate-pulse" />
            <p className="text-muted-foreground">Verifying admin access...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-pink-500" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-pink-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage and monitor the DEiD platform
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-pink-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-pink-500" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">1,234</p>
            <p className="text-sm text-muted-foreground">Registered Users</p>
          </div>

          {/* On-Chain Profiles */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-pink-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Database className="w-8 h-8 text-pink-500" />
              <span className="text-xs text-muted-foreground">On-Chain</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">856</p>
            <p className="text-sm text-muted-foreground">Active Profiles</p>
          </div>

          {/* Verified Accounts */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-pink-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-pink-500" />
              <span className="text-xs text-muted-foreground">Verified</span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">3,421</p>
            <p className="text-sm text-muted-foreground">Social Accounts</p>
          </div>

          {/* System Health */}
          <div className="bg-card border border-border rounded-xl p-6 hover:border-pink-500 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <Settings className="w-8 h-8 text-pink-500" />
              <span className="text-xs text-green-500 font-semibold">
                ONLINE
              </span>
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">99.9%</p>
            <p className="text-sm text-muted-foreground">System Uptime</p>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="bg-card border border-border rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6 text-pink-500" />
            Admin Actions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-start gap-2 hover:border-pink-500 hover:bg-pink-500/10"
            >
              <Users className="w-6 h-6 text-pink-500" />
              <div className="text-left">
                <p className="font-semibold">Manage Users</p>
                <p className="text-xs text-muted-foreground">
                  View and manage user accounts
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-start gap-2 hover:border-pink-500 hover:bg-pink-500/10"
            >
              <Database className="w-6 h-6 text-pink-500" />
              <div className="text-left">
                <p className="font-semibold">On-Chain Data</p>
                <p className="text-xs text-muted-foreground">
                  Monitor blockchain data
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-start gap-2 hover:border-pink-500 hover:bg-pink-500/10"
            >
              <Activity className="w-6 h-6 text-pink-500" />
              <div className="text-left">
                <p className="font-semibold">System Analytics</p>
                <p className="text-xs text-muted-foreground">
                  View platform analytics
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-start gap-2 hover:border-pink-500 hover:bg-pink-500/10"
            >
              <Settings className="w-6 h-6 text-pink-500" />
              <div className="text-left">
                <p className="font-semibold">System Settings</p>
                <p className="text-xs text-muted-foreground">
                  Configure platform settings
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-start gap-2 hover:border-pink-500 hover:bg-pink-500/10"
            >
              <Shield className="w-6 h-6 text-pink-500" />
              <div className="text-left">
                <p className="font-semibold">Access Control</p>
                <p className="text-xs text-muted-foreground">
                  Manage roles and permissions
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 px-6 flex flex-col items-start gap-2 hover:border-pink-500 hover:bg-pink-500/10"
            >
              <Activity className="w-6 h-6 text-pink-500" />
              <div className="text-left">
                <p className="font-semibold">Audit Logs</p>
                <p className="text-xs text-muted-foreground">
                  View system audit logs
                </p>
              </div>
            </Button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="flex-1">
                <p className="font-medium">New user registration</p>
                <p className="text-sm text-muted-foreground">
                  user@example.com joined the platform
                </p>
              </div>
              <span className="text-xs text-muted-foreground">2 min ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <div className="flex-1">
                <p className="font-medium">Profile updated on-chain</p>
                <p className="text-sm text-muted-foreground">
                  0x1234...5678 synced their profile
                </p>
              </div>
              <span className="text-xs text-muted-foreground">5 min ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 border border-border rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <div className="flex-1">
                <p className="font-medium">Social account verified</p>
                <p className="text-sm text-muted-foreground">
                  Twitter account linked and verified
                </p>
              </div>
              <span className="text-xs text-muted-foreground">10 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
