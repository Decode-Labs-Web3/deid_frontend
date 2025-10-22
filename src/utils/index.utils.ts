// Utility functions for request handling

export const generateRequestId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const apiPathName = (req: Request): string => {
  return new URL(req.url).pathname;
};

// Re-export backend utilities
export {
  handleUnauthorized,
  backendFetch,
  backendFetchJSON,
  backendPost,
  backendGet,
  backendPut,
  backendDelete,
} from "./backend.utils";

// Re-export badge utilities
export {
  getBadgeRarityColor,
  getRarityBadgeClasses,
  getIPFSGateways,
  convertIPFSUrlToHttp,
  fetchIPFSMetadata,
  fetchIPFSImageUrl,
  getUserBadgeTokenIds,
  getBadgeTokenURI,
  fetchBadgeData,
  fetchAllUserBadges,
  type BadgeAttribute,
  type BadgeMetadata,
  type UserBadge,
} from "./badge.utils";
