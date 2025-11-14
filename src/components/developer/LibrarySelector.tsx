"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Code } from "lucide-react";

export type Library = "ethers" | "viem" | "web3";

interface LibrarySelectorProps {
  value: Library;
  onChange: (library: Library) => void;
}

const libraries: { value: Library; label: string; version: string }[] = [
  { value: "ethers", label: "ethers.js", version: "v6" },
  { value: "viem", label: "viem", version: "v1" },
  { value: "web3", label: "web3.js", version: "v4" },
];

export function LibrarySelector({ value, onChange }: LibrarySelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const saved = localStorage.getItem("deid-dev-library");
    if (saved && libraries.some((lib) => lib.value === saved)) {
      onChange(saved as Library);
    }
  }, [onChange]);

  const handleChange = (library: Library) => {
    onChange(library);
    localStorage.setItem("deid-dev-library", library);
  };

  if (!mounted) {
    return (
      <div className="flex gap-2">
        {libraries.map((lib) => (
          <Button key={lib.value} variant="outline" disabled>
            {lib.label}
          </Button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Code className="w-4 h-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Library:</span>
      {libraries.map((lib) => (
        <Button
          key={lib.value}
          variant={value === lib.value ? "default" : "outline"}
          size="sm"
          onClick={() => handleChange(lib.value)}
          className="relative"
        >
          {lib.label}
          <span className="ml-1 text-xs opacity-70">{lib.version}</span>
        </Button>
      ))}
    </div>
  );
}
