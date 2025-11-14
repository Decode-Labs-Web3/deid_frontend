"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { Library } from "./LibrarySelector";

interface CodeExampleProps {
  ethers?: string;
  viem?: string;
  web3?: string;
  library: Library;
  title?: string;
}

export function CodeExample({
  ethers,
  viem,
  web3,
  library,
  title,
}: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const getCode = () => {
    switch (library) {
      case "ethers":
        return ethers || "";
      case "viem":
        return viem || "";
      case "web3":
        return web3 || "";
      default:
        return ethers || "";
    }
  };

  const code = getCode();

  const copyToClipboard = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code) {
    return (
      <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
        Code example not available for {library}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
      )}
      <div className="relative">
        <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
          <code>{code}</code>
        </pre>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2"
          onClick={copyToClipboard}
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
