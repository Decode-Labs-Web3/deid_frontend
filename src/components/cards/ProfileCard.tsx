import { Globe, Github, Linkedin } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

interface ProfileCardProps {
  username?: string;
  display_name?: string;
  bio?: string;
  avatar_ipfs_hash?: string;
}

export const ProfileCard = ({
  username,
  display_name,
  bio,
  avatar_ipfs_hash,
}: ProfileCardProps) => {
  const [avatarUrl, setAvatarUrl] = useState<string>("/deid_logo.png");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAvatarFromPinata = async () => {
      if (!avatar_ipfs_hash) return;

      try {
        setLoading(true);

        // Use authenticated Pinata API if credentials are available
        const pinataAccessToken = process.env.NEXT_PUBLIC_PINATA_ACCESS_TOKEN;
        const pinataApiSecret = process.env.NEXT_PUBLIC_PINATA_API_SECRET;

        let pinataUrl: string;
        let headers: Record<string, string> = {};

        if (pinataAccessToken && pinataApiSecret) {
          // Use authenticated Pinata API to check if pin exists
          const apiUrl = `https://api.pinata.cloud/data/pinList?hashContains=${avatar_ipfs_hash}`;
          headers = {
            Authorization: `Bearer ${pinataAccessToken}`,
            "Content-Type": "application/json",
          };

          console.log("🔐 Using authenticated Pinata API for avatar check");

          const apiResponse = await fetch(apiUrl, {
            method: "GET",
            headers,
            signal: AbortSignal.timeout(5000),
          });

          console.log("🔍 API Response:", apiResponse);

          if (apiResponse.ok) {
            const pinataResponse = await apiResponse.json();
            if (pinataResponse.rows && pinataResponse.rows.length > 0) {
              // Pin exists, use the gateway URL
              pinataUrl = `https://gateway.pinata.cloud/ipfs/${avatar_ipfs_hash}`;
              console.log("✅ Avatar pin found via authenticated API");
            } else {
              console.log("ℹ️ Avatar pin not found in Pinata");
              return;
            }
          } else {
            console.log(
              "⚠️ Failed to check pin via API, falling back to public gateway"
            );
            pinataUrl = `https://gateway.pinata.cloud/ipfs/${avatar_ipfs_hash}`;
          }
        } else {
          // Fallback to public gateway
          pinataUrl = `https://gateway.pinata.cloud/ipfs/${avatar_ipfs_hash}`;
          console.log(
            "⚠️ Using public Pinata gateway for avatar (no auth credentials)"
          );
        }

        // Test if the image exists
        const response = await fetch(pinataUrl, {
          method: "HEAD",
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          setAvatarUrl(pinataUrl);
          console.log("✅ Avatar loaded successfully");
        } else {
          console.log("Avatar not found on Pinata, using default");
        }
      } catch (error) {
        console.error("Error fetching avatar from Pinata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarFromPinata();
  }, [avatar_ipfs_hash]);

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-start gap-6">
      <div className="relative">
        <Image
          src={avatarUrl}
          alt="Profile"
          width={112}
          height={112}
          className="w-28 h-28 rounded-2xl object-cover"
        />
        {loading && (
          <div className="absolute inset-0 w-28 h-28 rounded-2xl bg-background/50 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      <div className="flex-1">
        <h2 className="text-3xl font-bold mb-1">{display_name || "User"}</h2>
        <p className="text-muted-foreground mb-3">@{username || "username"}</p>

        <div className="flex gap-3 mb-4">
          <Globe className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition" />
          <Github className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition" />
          <Linkedin className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer transition" />
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          {bio || "No bio available"}
        </p>
      </div>
    </div>
  );
};
