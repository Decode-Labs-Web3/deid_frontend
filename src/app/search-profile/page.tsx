"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { SearchResultCard } from "@/components/cards/SearchResultCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, AlertCircle, Users, Wallet } from "lucide-react";
import { searchUsers } from "@/utils/backend.utils";
import {
  resolveAddressToProfile,
  resolveUsernameToAddress,
} from "@/utils/onchain.utils";

interface SearchResultItem {
  id?: string; // For wallet address results
  _id: string; // From backend API
  username: string;
  display_name?: string;
  avatar_ipfs_hash?: string;
  avatar_url?: string; // Legacy field
  hasOnChainProfile: boolean;
  onChainProfileData?: unknown;
  walletAddress?: string;
  created_at: string;
  updated_at: string;
}

const SearchProfile = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<"username" | "wallet" | null>(
    null
  );

  const observerRef = useRef<HTMLDivElement>(null);

  // Wallet address detection regex
  const isWalletAddress = (query: string) => /^0x[a-fA-F0-9]{40}$/.test(query);

  // Search function (no debouncing)
  const performSearch = useCallback(
    async (query: string, page: number = 0, append: boolean = false) => {
      if (!query.trim()) {
        setSearchResults([]);
        setError(null);
        setSearchType(null);
        return;
      }

      try {
        if (page === 0) {
          setIsLoading(true);
          setError(null);
        } else {
          setIsLoadingMore(true);
        }

        const isWallet = isWalletAddress(query);
        setSearchType(isWallet ? "wallet" : "username");

        if (isWallet) {
          // Search by wallet address - resolve on-chain
          console.log("🔍 Searching by wallet address:", query);

          const { username, hasProfile, profileData } =
            await resolveAddressToProfile(query);

          if (hasProfile && profileData) {
            const result: SearchResultItem = {
              _id: query,
              id: query,
              username: username,
              display_name:
                profileData.profile_metadata?.display_name || username,
              avatar_ipfs_hash: profileData.profile_metadata?.avatar_ipfs_hash,
              hasOnChainProfile: true,
              onChainProfileData: profileData,
              walletAddress: query,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            setSearchResults(append ? [...searchResults, result] : [result]);
            setHasMore(false); // Single result for wallet search
          } else {
            // Show warning card for wallet with no DEiD profile
            const warningResult: SearchResultItem = {
              _id: `warning-${query}`,
              id: `warning-${query}`,
              username: "No DEiD Profile",
              display_name: "This wallet has no DEiD on-chain account",
              hasOnChainProfile: false,
              walletAddress: query,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            setSearchResults(
              append ? [...searchResults, warningResult] : [warningResult]
            );
            setHasMore(false);
          }
        } else {
          // Search by username/email - use backend API
          console.log("🔍 Searching by username/email:", query);
          console.log("📄 Page:", page, "Append:", append);

          const response = await searchUsers(query, page, 20);
          console.log("📡 Backend API response:", response);

          if (
            response.success &&
            response.data &&
            Array.isArray(response.data)
          ) {
            console.log(`👥 Found ${response.data.length} users from backend`);

            // Check on-chain status for each result
            const resultsWithOnChainStatus: SearchResultItem[] =
              await Promise.all(
                response.data.map(async (result, index) => {
                  console.log(
                    `\n🔍 [${index + 1}/${
                      response.data.length
                    }] Processing user: ${result.username}`
                  );
                  let hasOnChainProfile = false;
                  let onChainProfileData = null;
                  let walletAddress: string | undefined;

                  // Try to get wallet address from user data or resolve on-chain
                  try {
                    console.log(
                      `  ⛓️ Resolving username "${result.username}" to wallet address...`
                    );
                    // First try to resolve username to get wallet address
                    const resolvedAddress = await resolveUsernameToAddress(
                      result.username
                    );

                    if (resolvedAddress) {
                      console.log(
                        `  ✅ Resolved to address: ${resolvedAddress}`
                      );
                      walletAddress = resolvedAddress;

                      console.log(
                        `  📋 Checking on-chain profile for ${resolvedAddress}...`
                      );
                      const { hasProfile, profileData } =
                        await resolveAddressToProfile(resolvedAddress);

                      hasOnChainProfile = hasProfile;
                      onChainProfileData = profileData;
                      console.log(
                        `  ${hasProfile ? "✅" : "❌"} On-chain profile ${
                          hasProfile ? "found" : "not found"
                        }`
                      );
                    } else {
                      console.log(
                        `  ❌ Username "${result.username}" not found on-chain`
                      );
                    }
                  } catch (error) {
                    console.error(
                      `  ❌ Failed to check on-chain status for "${result.username}":`,
                      error
                    );
                  }

                  const mappedResult: SearchResultItem = {
                    _id: result._id,
                    id: result._id,
                    username: result.username,
                    display_name: result.display_name,
                    avatar_ipfs_hash: result.avatar_ipfs_hash,
                    hasOnChainProfile,
                    onChainProfileData,
                    walletAddress,
                    created_at: result.last_login || new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };

                  console.log(`  ✅ Mapped result:`, {
                    username: mappedResult.username,
                    hasOnChain: mappedResult.hasOnChainProfile,
                    walletAddress: mappedResult.walletAddress,
                  });

                  return mappedResult;
                })
              );

            console.log(
              `\n✅ Processed ${resultsWithOnChainStatus.length} results`
            );
            console.log(
              "📊 Results summary:",
              resultsWithOnChainStatus.map((r) => ({
                username: r.username,
                hasOnChain: r.hasOnChainProfile,
              }))
            );

            const newResults = append
              ? [...searchResults, ...resultsWithOnChainStatus]
              : resultsWithOnChainStatus;

            console.log(
              "🎯 Setting search results:",
              newResults.length,
              "total results"
            );
            setSearchResults(newResults);
            setHasMore(!response.meta.is_last_page);
            console.log("📄 Has more pages:", !response.meta.is_last_page);
          } else {
            console.log("❌ No users found or invalid response");
            setSearchResults(append ? searchResults : []);
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("❌ Search error:", error);
        setError(error instanceof Error ? error.message : "Search failed");
        if (page === 0) {
          setSearchResults([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [searchResults]
  );

  // Handle search on Enter key or search button click
  const handleSearch = () => {
    performSearch(searchQuery, 0, false);
    setCurrentPage(0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Infinite scroll effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoading &&
          !isLoadingMore &&
          searchType === "username"
        ) {
          const nextPage = currentPage + 1;
          setCurrentPage(nextPage);
          performSearch(searchQuery, nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [
    hasMore,
    isLoading,
    isLoadingMore,
    currentPage,
    searchQuery,
    searchType,
    performSearch,
  ]);

  const handleResultClick = (result: SearchResultItem) => {
    if (result.hasOnChainProfile && result.walletAddress) {
      router.push(`/profile/${result.walletAddress}`);
    } else if (result.walletAddress) {
      // Still navigate to profile page even if no on-chain profile
      router.push(`/profile/${result.walletAddress}`);
    } else {
      // For backend-only results without wallet address, try to resolve username
      router.push(`/profile/${result.username}`);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Search Users</h1>
          <p className="text-muted-foreground">
            Search for users by username, email, or wallet address
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search user by username or wallet address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 pr-20 h-12 text-lg"
            />
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              size="sm"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Search Type Indicator */}
          {searchType && (
            <div className="mt-2 flex items-center gap-2">
              {searchType === "wallet" ? (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Wallet className="w-3 h-3" />
                  Wallet Address
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Username
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-destructive">{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Searching...</span>
          </div>
        )}

        {/* Results */}
        {!isLoading && searchResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {searchType === "wallet" ? "Wallet Profile" : "Search Results"}
              </h2>
              <span className="text-sm text-muted-foreground">
                {searchResults.length} result
                {searchResults.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Two-column grid for results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  username={result.username}
                  displayName={result.display_name}
                  avatarUrl={result.avatar_url}
                  avatarIpfsHash={result.avatar_ipfs_hash}
                  hasOnChainProfile={result.hasOnChainProfile}
                  walletAddress={result.walletAddress}
                  onClick={() => handleResultClick(result)}
                />
              ))}
            </div>

            {/* Load More Indicator */}
            {isLoadingMore && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">
                  Loading more...
                </span>
              </div>
            )}

            {/* Intersection Observer Target */}
            {hasMore && searchType === "username" && (
              <div ref={observerRef} className="h-4" />
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && searchQuery && searchResults.length === 0 && !error && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No users found</h3>
              <p className="text-muted-foreground">
                Try searching with a different username, email, or wallet
                address
              </p>
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!searchQuery && (
          <Card className="py-12">
            <CardContent className="text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start searching</h3>
              <p className="text-muted-foreground">
                Enter a username, email, or wallet address to find users
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default SearchProfile;
