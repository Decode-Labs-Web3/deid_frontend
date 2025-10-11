import { AppLayout } from "@/components/layout/AppLayout";
import { BadgeCard } from "@/components/cards/BadgeCard";
import { X, Fingerprint } from "lucide-react";
import Image from "next/image";

const Identity = () => {
  const walletAddresses = [
    "0x000000...000000",
    "0x000000...000000",
    "0x000000...000000",
  ];

  const socialAccounts = [
    { id: "10294234", username: "Pasonnn", followers: 25, age: "1y 2m 25d" },
    { id: "10294234", username: "Pasonnn", followers: 25, age: "1y 2m 25d" },
    { id: "10294234", username: "Pasonnn", followers: 25, age: "1y 2m 25d" },
    { id: "10294234", username: "Pasonnn", followers: 25, age: "1y 2m 25d" },
    { id: "10294234", username: "Pasonnn", followers: 25, age: "1y 2m 25d" },
    { id: "10294234", username: "Pasonnn", followers: 25, age: "1y 2m 25d" },
    { id: "10294234", username: "Pasonnn", followers: 25, age: "1y 2m 25d" },
  ];

  const badges = Array(9).fill({
    title: "Golden Bitcoin Holder",
    description: "Hold >1 BTC",
  });

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Decode Information */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-4">
              Decode Information
            </h2>

            <div className="flex items-start gap-6">
              <Image
                src="/deid_logo.png"
                alt="Profile"
                width={112}
                height={112}
                className="w-28 h-28 rounded-2xl object-cover"
              />
              <div>
                <h3 className="text-3xl font-bold mb-1">Son Nguyen</h3>
                <p className="text-muted-foreground">@PasonDev</p>
              </div>
            </div>

            <div className="space-y-3">
              {walletAddresses.map((address, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-primary transition-colors"
                >
                  <Fingerprint className="w-5 h-5 text-primary" />
                  <span className="font-mono text-sm">{address}</span>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-6 border-b border-border pb-4">
                Badges
              </h3>
              <div className="grid grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                {badges.map((badge, i) => (
                  <BadgeCard
                    key={i}
                    title={badge.title}
                    description={badge.description}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Social Accounts */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold border-b border-border pb-4">
              Social Accounts
            </h2>

            <div className="space-y-3 max-h-[900px] overflow-y-auto pr-2">
              {socialAccounts.map((account, i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-lg p-4 flex items-center justify-between hover:border-primary transition-colors group"
                >
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      account id: {account.id}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      username: {account.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      followers: {account.followers}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      account age: {account.age}
                    </p>
                  </div>
                  <div className="bg-foreground text-background rounded-lg w-16 h-16 flex items-center justify-center group-hover:bg-destructive transition-colors cursor-pointer">
                    <X className="w-8 h-8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Identity;
