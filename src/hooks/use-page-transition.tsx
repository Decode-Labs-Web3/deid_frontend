"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UsePageTransitionOptions {
  delay?: number;
  transitionDuration?: number;
}

export const usePageTransition = (options: UsePageTransitionOptions = {}) => {
  const { delay = 1500, transitionDuration = 500 } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fade in on mount
    const fadeInTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(fadeInTimer);
  }, []);

  const navigateWithTransition = (path: string) => {
    setIsTransitioning(true);
    setIsVisible(false);

    setTimeout(() => {
      router.push(path);
    }, transitionDuration);
  };

  const autoNavigateWithTransition = (path: string) => {
    setIsTransitioning(true);
    setIsVisible(false);

    setTimeout(() => {
      router.push(path);
    }, delay);
  };

  return {
    isVisible,
    isTransitioning,
    navigateWithTransition,
    autoNavigateWithTransition,
  };
};
