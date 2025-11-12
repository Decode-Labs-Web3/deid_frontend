import { NextRequest, NextResponse } from "next/server";

interface MoralisNFTResponse {
  token_address: string;
  token_id: string;
  token_uri?: string;
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
  };
  name?: string;
  symbol?: string;
  contract_type: string;
  owner_of: string;
  block_number: string;
  block_number_minted: string;
  token_hash: string;
  amount: string;
  possible_spam: boolean;
  last_token_uri_sync?: string;
  last_metadata_sync?: string;
}

interface TokenMetadata {
  name?: string;
  description?: string;
  image?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get("wallet");

    console.log("🔍 NFT API called with wallet:", walletAddress);

    if (!walletAddress) {
      console.log("❌ No wallet address provided");
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const moralisApiKey = process.env.MORALIST_API_KEY;
    console.log("🔑 Moralis API key exists:", !!moralisApiKey);

    if (!moralisApiKey) {
      console.log("❌ Moralis API key not configured");
      return NextResponse.json(
        { error: "Moralis API key not configured" },
        { status: 500 }
      );
    }

    console.log("🔍 Fetching NFTs for wallet:", walletAddress);

    // Try Sepolia first, then fallback to Ethereum mainnet
    const chains = ["eth"];
    let nfts: MoralisNFTResponse[] = [];
    let usedChain = "";

    for (const chain of chains) {
      try {
        const moralisUrl = `https://deep-index.moralis.io/api/v2.2/${walletAddress}/nft?chain=${chain}&format=decimal&limit=20`;
        console.log(`🌐 Trying Moralis API URL for ${chain}:`, moralisUrl);

        const moralisResponse = await fetch(moralisUrl, {
          headers: {
            "X-API-Key": moralisApiKey,
            "Content-Type": "application/json",
          },
        });

        console.log(
          `🔍 Moralis API response status for ${chain}:`,
          moralisResponse.status
        );
        console.log(
          `🔍 Moralis API response ok for ${chain}:`,
          moralisResponse.ok
        );

        if (moralisResponse.ok) {
          const moralisData = await moralisResponse.json();
          console.log(`📊 Moralis API data for ${chain}:`, moralisData);

          nfts = moralisData.result || [];
          usedChain = chain;

          if (nfts.length > 0) {
            console.log(`✅ Found ${nfts.length} NFTs on ${chain}`);
            break;
          } else {
            console.log(`⚠️ No NFTs found on ${chain}, trying next chain...`);
          }
        } else {
          const errorText = await moralisResponse.text();
          console.error(
            `❌ Moralis API error for ${chain}:`,
            moralisResponse.status,
            errorText
          );

          // If it's a 404 or similar, continue to next chain
          if (
            moralisResponse.status === 404 ||
            moralisResponse.status === 400
          ) {
            console.log(
              `⚠️ Chain ${chain} not available or invalid, trying next chain...`
            );
            continue;
          }

          // For other errors, return the error
          return NextResponse.json(
            {
              error: `Failed to fetch NFTs from Moralis for ${chain}`,
              details: errorText,
              status: moralisResponse.status,
            },
            { status: moralisResponse.status }
          );
        }
      } catch (fetchError) {
        continue;
      }
    }

    if (nfts.length === 0) {
      console.log("⚠️ No NFTs found on any chain");
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
        message: `No NFTs found for wallet ${walletAddress} on Sepolia or Ethereum mainnet`,
        chains_tried: chains,
      });
    }

    console.log(`📊 Found ${nfts.length} NFTs`);

    // Process NFTs and fetch token metadata
    const processedNFTs = await Promise.all(
      nfts.map(async (nft) => {
        let imageUrl = "";
        let metadata: TokenMetadata = {};

        try {
          // If metadata is already available, use it
          if (nft.metadata) {
            console.log("📋 Using existing metadata for NFT:", nft.token_id);
            metadata =
              typeof nft.metadata === "string"
                ? JSON.parse(nft.metadata)
                : nft.metadata;
            imageUrl = metadata.image || "";
          }
          // If token_uri is available, fetch metadata from it
          else if (nft.token_uri) {
            console.log("🔗 Fetching token metadata from:", nft.token_uri);

            try {
              const tokenResponse = await fetch(nft.token_uri, {
                headers: {
                  Accept: "application/json",
                },
                // Add timeout to prevent hanging
                credentials: "include",
                cache: "no-store",
                signal: AbortSignal.timeout(10000),
              });

              if (tokenResponse.ok) {
                metadata = await tokenResponse.json();
                imageUrl = metadata.image || "";
                console.log(
                  "✅ Token metadata fetched successfully for NFT:",
                  nft.token_id
                );
              } else {
                console.log(
                  "⚠️ Failed to fetch token metadata:",
                  tokenResponse.status,
                  "for NFT:",
                  nft.token_id
                );
              }
            } catch (fetchError) {
              console.log(
                "⚠️ Network error fetching token metadata for NFT:",
                nft.token_id,
                fetchError
              );
            }
          } else {
            console.log(
              "⚠️ No metadata or token_uri available for NFT:",
              nft.token_id
            );
          }
        } catch (error) {
          console.log("⚠️ Error processing NFT metadata:", nft.token_id, error);
        }

        return {
          token_address: nft.token_address,
          token_id: nft.token_id,
          name: metadata.name || nft.name || `NFT #${nft.token_id}`,
          description: metadata.description || "",
          image: imageUrl,
          contract_type: nft.contract_type,
          symbol: nft.symbol,
          attributes: metadata.attributes || [],
          possible_spam: nft.possible_spam,
        };
      })
    );

    // Filter out spam NFTs
    const validNFTs = processedNFTs.filter((nft) => !nft.possible_spam);

    console.log(`✅ Processed ${validNFTs.length} valid NFTs`);

    return NextResponse.json({
      success: true,
      data: validNFTs,
      count: validNFTs.length,
      chain: usedChain,
      message: `Found ${validNFTs.length} NFTs on ${usedChain}`,
    });
  } catch (error) {
    console.error("❌ NFT API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
