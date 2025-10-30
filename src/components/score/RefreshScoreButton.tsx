/**
 * @title Refresh Score Button
 * @description User-triggered score update component
 */

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Clock } from "lucide-react";
import { useScoreUpdate } from "@/hooks/useScoreUpdate";
import { toast } from "sonner";

interface RefreshScoreButtonProps {
  onSuccess?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export function RefreshScoreButton({
  onSuccess,
  variant = "default",
  size = "default",
}: RefreshScoreButtonProps) {
  const {
    updateScore,
    loading,
    error,
    success,
    canUpdate: canUpdateNow,
    timeUntilNext,
    checkCooldown,
  } = useScoreUpdate();

  const [formattedTime, setFormattedTime] = useState("");

  // Check cooldown on mount
  useEffect(() => {
    checkCooldown();
  }, [checkCooldown]);

  // Format remaining time
  useEffect(() => {
    if (timeUntilNext > 0) {
      const hours = Math.floor(timeUntilNext / 3600);
      const minutes = Math.floor((timeUntilNext % 3600) / 60);
      const seconds = timeUntilNext % 60;

      if (hours > 0) {
        setFormattedTime(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setFormattedTime(`${minutes}m ${seconds}s`);
      } else {
        setFormattedTime(`${seconds}s`);
      }

      // Update countdown every second
      const interval = setInterval(() => {
        checkCooldown();
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setFormattedTime("");
    }
  }, [timeUntilNext, checkCooldown]);

  // Handle success
  useEffect(() => {
    if (success) {
      toast.success("Score Updated!", {
        description:
          "Your score has been recalculated and updated on the blockchain. You earned +1 contribution point! 🎉",
      });
      if (onSuccess) {
        onSuccess();
      }
    }
  }, [success, onSuccess]);

  // Handle error
  useEffect(() => {
    if (error) {
      toast.error("Update Failed", {
        description: error,
      });
    }
  }, [error]);

  const handleClick = async () => {
    if (!canUpdateNow) {
      toast.warning("Cooldown Active", {
        description: `Please wait ${formattedTime} before updating again.`,
      });
      return;
    }

    const result = await updateScore();

    if (result.success) {
      console.log("✅ Score updated successfully!");
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading || !canUpdateNow}
      variant={variant}
      size={size}
      className="relative"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Updating Scores...
        </>
      ) : !canUpdateNow ? (
        <>
          <Clock className="mr-2 h-4 w-4" />
          Wait {formattedTime}
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Update Scores
        </>
      )}
    </Button>
  );
}
