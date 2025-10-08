import { Sidebar } from "@/components/layout/Sidebar";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { StatCard } from "@/components/cards/StatCard";
import { TrustWheel } from "@/components/charts/TrustWheel";
import { MetricCard } from "@/components/cards/MetricCard";
import { NFTCard } from "@/components/cards/NFTCard";

const Profile = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div className="flex-1 ml-52">
        <div className="max-w-7xl mx-auto p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <ProfileCard />

              <div className="bg-card border border-border rounded-xl p-6 grid grid-cols-3 gap-6">
                <StatCard title="Task Score" value={43} total={213} />
                <StatCard title="Social Score" value={24} total={112} />
                <StatCard title="Chain Score" value={26} total={240} />
              </div>
            </div>

            <TrustWheel />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Trust Score"
              value={89}
              change={12}
              status="Above average"
              color="#4F46E5"
            />
            <MetricCard
              title="Weekly Task"
              value={62}
              change={4}
              status="Slightly above average"
              color="#06B6D4"
            />
            <MetricCard
              title="Trust Voted"
              value={31}
              change={-12}
              status="Below average"
              color="#EF4444"
            />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">NFT Collections</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <NFTCard />
              <NFTCard />
              <NFTCard />
              <NFTCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
