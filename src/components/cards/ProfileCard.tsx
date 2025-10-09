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
    const fetchAvatarFromIPFS = async () => {
      if (!avatar_ipfs_hash) return;

      try {
        setLoading(true);

        // Fetch avatar directly from custom IPFS node
        console.log("🌐 Fetching avatar directly from custom IPFS node");
        const ipfsUrl = `http://35.247.142.76:8080/ipfs/${avatar_ipfs_hash}`;

        const response = await fetch(ipfsUrl, {
          method: "GET",
          signal: AbortSignal.timeout(5000),
        });

        if (response.ok) {
          setAvatarUrl(ipfsUrl);
          console.log("✅ Avatar loaded successfully:", ipfsUrl);
        } else {
          console.log("Avatar not found on IPFS, using default");
        }
      } catch (error) {
        console.error("Error fetching avatar from IPFS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvatarFromIPFS();
  }, [avatar_ipfs_hash]);

  // Helper to check if the avatarUrl is an external URL (e.g., IPFS)
  const isExternalUrl = (url: string) => /^https?:\/\//.test(url);

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex items-start gap-6">
      <div className="relative">
        {isExternalUrl(avatarUrl) ? (
          // Use <img> for external URLs (e.g., IPFS) to avoid next/image config issues
          <img
            src={avatarUrl}
            alt="Profile"
            width={112}
            height={112}
            className="w-28 h-28 rounded-2xl object-cover"
            style={{ objectFit: "cover" }}
          />
        ) : (
          // Use next/image for local/static images
          <Image
            src={avatarUrl}
            alt="Profile"
            width={112}
            height={112}
            className="w-28 h-28 rounded-2xl object-cover"
          />
        )}
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
