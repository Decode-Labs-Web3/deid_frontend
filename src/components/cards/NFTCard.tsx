import Image from "next/image";

export const NFTCard = () => {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary transition-all cursor-pointer group">
      <Image
        src="/deid_logo.png"
        alt="NFT"
        width={200}
        height={200}
        className="w-full aspect-square object-cover group-hover:scale-105 transition-transform"
      />
    </div>
  );
};
