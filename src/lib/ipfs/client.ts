/**
 * @title IPFS Client
 * @description Self-hosted IPFS node integration for DEiD system
 */

/**
 * Upload JSON data to IPFS
 * @param jsonData - Data to upload
 * @returns IPFS CID (hash)
 */
export async function uploadToIPFS(jsonData: any): Promise<string> {
  const postUrl =
    process.env.NEXT_IPFS_GATEWAY_URL_POST ||
    "http://35.247.142.76:5001/api/v0/add";

  console.log("📤 Uploading data to IPFS:", postUrl);

  try {
    // Convert JSON to string
    const dataString = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([dataString], { type: "application/json" });

    // Create FormData with the file
    const formData = new FormData();
    formData.append("file", blob, "snapshot.json");

    // Upload to IPFS node
    const response = await fetch(postUrl, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IPFS upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ IPFS upload successful:", result);

    // IPFS API returns { Name, Hash, Size }
    return result.Hash;
  } catch (error) {
    console.error("❌ IPFS upload error:", error);
    throw error;
  }
}

/**
 * Fetch data from IPFS with fallback gateways
 * @param cid - IPFS CID to fetch
 * @returns Parsed JSON data
 */
export async function fetchFromIPFS(cid: string): Promise<any> {
  const gateways = [
    // Primary gateway from environment
    process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL
      ? `${process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL}/${cid}`
      : `http://35.247.142.76:8080/ipfs/${cid}`,
    // Public fallback gateways
    `https://ipfs.io/ipfs/${cid}`,
    `https://gateway.pinata.cloud/ipfs/${cid}`,
    `https://cloudflare-ipfs.com/ipfs/${cid}`,
    `https://dweb.link/ipfs/${cid}`,
  ];

  console.log(`🌐 Fetching from IPFS: ${cid}`);

  let lastError: Error | null = null;

  for (const gateway of gateways) {
    try {
      console.log(`  Trying gateway: ${gateway}`);
      const response = await fetch(gateway, {
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched from ${gateway}`);
      return data;
    } catch (error) {
      console.warn(`⚠️ Failed to fetch from ${gateway}:`, error);
      lastError = error as Error;
      continue;
    }
  }

  throw new Error(
    `Failed to fetch from all IPFS gateways. Last error: ${lastError?.message}`
  );
}

/**
 * Pin a CID on the IPFS node (optional)
 * @param cid - CID to pin
 */
export async function pinCID(cid: string): Promise<void> {
  const pinUrl =
    process.env.NEXT_IPFS_GATEWAY_URL_POST?.replace("/add", "/pin/add") ||
    "http://35.247.142.76:5001/api/v0/pin/add";

  console.log(`📌 Pinning CID: ${cid}`);

  try {
    const response = await fetch(`${pinUrl}?arg=${cid}`, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(`Pin failed: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Pin successful:", result);
  } catch (error) {
    console.warn("⚠️ Pin failed (non-critical):", error);
    // Don't throw - pinning is optional
  }
}

/**
 * Upload and pin JSON data to IPFS
 * @param jsonData - Data to upload
 * @returns IPFS CID
 */
export async function uploadAndPin(jsonData: any): Promise<string> {
  const cid = await uploadToIPFS(jsonData);
  await pinCID(cid);
  return cid;
}
