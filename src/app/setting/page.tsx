"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/context/ThemeContext";
import { logout } from "@/utils/session.utils";
import {
  Moon,
  Sun,
  LogOut,
  Mail,
  ExternalLink,
  Code,
  Shield,
  FileText,
  Info,
  Smartphone,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

const pinkButton =
  "transition-all duration-200 bg-pink-500/90 text-white border-pink-600 hover:bg-pink-600 hover:border-pink-700 hover:shadow-lg hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2";
const pinkOutlineButton =
  "transition-all duration-200 border-pink-400 text-pink-600 hover:bg-pink-50 hover:border-pink-600 hover:shadow focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2";
const pinkOutlineDangerButton =
  "transition-all duration-200 border-pink-400 text-pink-600 hover:bg-pink-100 hover:border-pink-600 hover:text-pink-700";

const Setting = () => {
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      logout();
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-8 space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your preferences and account settings
          </p>
        </div>

        <div className="grid gap-6">
          {/* Appearance Section */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-pink-500 transition-colors duration-200 group-hover:text-pink-700" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize how DEiD looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Theme</span>
                    {mounted && theme === "dark" ? (
                      <Moon className="w-4 h-4 text-pink-500 transition-colors duration-200 group-hover:text-pink-700" />
                    ) : (
                      <Sun className="w-4 h-4 text-yellow-500 transition-colors duration-200 group-hover:text-pink-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark themes
                  </p>
                </div>
                <Switch
                  checked={mounted ? theme === "dark" : false}
                  onCheckedChange={
                    mounted
                      ? (checked) => {
                          if (checked !== (theme === "dark")) {
                            toggleTheme();
                          }
                        }
                      : () => {}
                  }
                  disabled={!mounted}
                  className={
                    mounted
                      ? theme === "dark"
                        ? "data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600 data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-300 transition-colors duration-200"
                        : "data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600 data-[state=unchecked]:bg-gray-300 data-[state=unchecked]:border-gray-300 transition-colors duration-200"
                      : "bg-pink-200 border-pink-200"
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* App Information Section */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-pink-500 transition-colors duration-200 group-hover:text-pink-700" />
                App Information
              </CardTitle>
              <CardDescription>Version and build information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Version</span>
                    <Badge variant="secondary">v1.0.0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Build</span>
                    <span className="text-sm text-muted-foreground">
                      2024.1.0
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge variant="outline">Production</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Framework</span>
                    <span className="text-sm text-muted-foreground">
                      Next.js 14
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Blockchain</span>
                    <span className="text-sm text-muted-foreground">
                      Ethereum
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support Section */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-pink-500 transition-colors duration-200 group-hover:text-pink-700" />
                Support & Contact
              </CardTitle>
              <CardDescription>Get help and contact our team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-sm font-medium">Email Support</span>
                  <p className="text-sm text-muted-foreground">
                    decodenetwork.web3@gmail.com
                  </p>
                </div>
                <Button
                  className={`${pinkOutlineButton} flex items-center space-x-2 group`}
                  size="sm"
                  asChild
                >
                  <a href="mailto:decodenetwork.web3@gmail.com">
                    <Mail className="w-4 h-4 mr-2 group-hover:text-pink-700 transition-colors duration-200" />
                    Contact
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Legal Section */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-pink-500 transition-colors duration-200 group-hover:text-pink-700" />
                Legal & Privacy
              </CardTitle>
              <CardDescription>
                Terms of service and privacy policy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <Button
                  className={`${pinkOutlineButton} justify-start group`}
                  asChild
                >
                  <Link href="/terms">
                    <FileText className="w-4 h-4 mr-2 group-hover:text-pink-700 transition-colors duration-200" />
                    Terms of Service
                    <ExternalLink className="w-4 h-4 ml-auto group-hover:text-pink-700 transition-colors duration-200" />
                  </Link>
                </Button>
                <Button
                  className={`${pinkOutlineButton} justify-start group`}
                  asChild
                >
                  <Link href="/privacy">
                    <Shield className="w-4 h-4 mr-2 group-hover:text-pink-700 transition-colors duration-200" />
                    Privacy Policy
                    <ExternalLink className="w-4 h-4 ml-auto group-hover:text-pink-700 transition-colors duration-200" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Developer Portal Section */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5 text-pink-500 transition-colors duration-200 group-hover:text-pink-700" />
                Developer Portal
              </CardTitle>
              <CardDescription>
                API documentation and developer resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className={`${pinkOutlineButton} w-full justify-start group`}
                asChild
              >
                <Link href="/developer">
                  <Code className="w-4 h-4 mr-2 group-hover:text-pink-700 transition-colors duration-200" />
                  View Developer Documentation
                  <ExternalLink className="w-4 h-4 ml-auto group-hover:text-pink-700 transition-colors duration-200" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Separator className="transition-all duration-200 hover:shadow-pink-100" />

          {/* Account Section */}
          <Card className="border-pink-500/20 transition-all duration-200 hover:shadow-pink-200 hover:shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <LogOut className="w-5 h-5 text-pink-600 transition-all duration-200 group-hover:text-pink-800" />
                Account
              </CardTitle>
              <CardDescription>Manage your account and session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`${pinkOutlineDangerButton} w-full flex items-center group`}
              >
                <LogOut className="w-4 h-4 mr-2 group-hover:text-pink-700 transition-colors duration-200" />
                {isLoggingOut ? "Logging out..." : "Logout"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Setting;
