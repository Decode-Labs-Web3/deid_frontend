import nftPlaceholder from "@/assets/nft-placeholder.png";

export const NFTCard = () => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all cursor-pointer group">
      <img
        src={nftPlaceholder}
        alt="NFT"
        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
      />
    </div>
  );
};
