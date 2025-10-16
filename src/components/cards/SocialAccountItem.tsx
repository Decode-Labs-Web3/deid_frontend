import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";

interface SocialAccountItemProps {
  platform: string;
  username: string;
  account_id: string;
  created_at: string;
  onValidate?: () => void;
  isValidating?: boolean;
}

const getPlatformIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "discord":
      return "/discord-icon.png";
    case "twitter":
    case "x":
      return "/x-icon.png";
    case "github":
      return "/github-icon.png";
    case "google":
      return "/google_logo.png";
    case "facebook":
      return "/facebook-icon.png";
    case "telegram":
      return "/telegram-logo.png";
    default:
      return "/discord-icon.png"; // fallback
  }
};

const getPlatformName = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "discord":
      return "Discord";
    case "twitter":
    case "x":
      return "Twitter";
    case "github":
      return "GitHub";
    case "google":
      return "Google";
    case "facebook":
      return "Facebook";
    case "telegram":
      return "Telegram";
    default:
      return platform;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const SocialAccountItem = ({
  platform,
  username,
  account_id,
  created_at,
  onValidate,
  isValidating = false,
}: SocialAccountItemProps) => {
  const platformIcon = getPlatformIcon(platform);
  const platformName = getPlatformName(platform);
  const verificationDate = formatDate(created_at);

  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary transition-colors group">
      <div className="flex items-center gap-4">
        {/* Platform Icon */}
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-black flex items-center justify-center">
          <Image
            src={platformIcon}
            alt={platformName}
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </div>

        {/* Account Details */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">{username}</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-sm text-muted-foreground">ID: {account_id}</p>
          <p className="text-xs text-muted-foreground">
            Verified: {verificationDate}
          </p>
        </div>
      </div>

      {/* Validate Button */}
      <Button
        onClick={onValidate}
        disabled={isValidating}
        className="bg-gradient-to-r from-[#CA4A87] to-[#b13e74] hover:from-[#b13e74] hover:to-[#a0335f] text-white font-semibold"
        size="sm"
      >
        {isValidating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2" />
            Validating...
          </>
        ) : (
          <>
            <ExternalLink className="w-4 h-4 mr-2" />
            Validate
          </>
        )}
      </Button>
    </div>
  );
};
