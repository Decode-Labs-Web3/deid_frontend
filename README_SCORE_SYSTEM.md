# DEiD Score System

## Overview

The DEiD Score System is a comprehensive scoring and ranking mechanism that calculates user scores based on multiple factors and stores snapshots on IPFS with on-chain verification.

## Architecture

```
User → Next.js Frontend → API Routes → IPFS Upload → Smart Contract → Blockchain
                          ↓
                    Score Calculation
                          ↓
                    Merkle Tree Generation
                          ↓
                    Validator Signature
```

## Score Calculation

Scores are calculated based on five factors:

### 1. Badge Score
- Points from badge IPFS metadata attributes
- Each badge has a `points` or `score` attribute
- Default: 10 points per badge if no attribute exists

### 2. Social Score
- 5 points per linked social account
- Platforms: Twitter, Discord, GitHub, etc.

### 3. Streak Score
- 1 point per consecutive day
- Tracked via StreakTracker contract (integration TODO)

### 4. Chain Score
- **ETH Balance**: 100 points per ETH
- **Transaction Count**: 2 points per transaction (capped at 500)
- **Contract Interactions**: 3 points per interaction (estimated as 30% of total txs)

### 5. Contribution Score
- 1 point per score update trigger
- Incentivizes users to keep the system updated

## API Endpoints

### POST /api/score/recompute
Trigger a global score recalculation.

**Request:**
```json
{
  "triggerAddress": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "cid": "QmXXX...",
  "root": "0xABC...",
  "snapshotId": 1234567890,
  "timestamp": 1234567890,
  "signature": "0x...",
  "userCount": 100,
  "triggerBonus": true,
  "userScore": { ... }
}
```

### GET /api/score/user?address=0x...
Get a specific user's score from the latest snapshot.

### GET /api/score/fetch?cid=Qm...
Fetch a snapshot's full data from IPFS.

### GET /api/score/history?limit=10&offset=0
Get historical snapshot metadata.

### POST /api/score/cron
Automated daily score update (requires auth header).

## Smart Contract Integration

### Functions Used

**ScoreFacet:**
- `updateSnapshot(cid, root, snapshotId, timestamp, signature)` - Submit new snapshot
- `getLatestSnapshot()` - Get latest snapshot metadata
- `getSnapshot(id)` - Get specific snapshot
- `getCooldown()` - Get cooldown period
- `getLastUpdate()` - Get last update timestamp

**DEiDProfile:**
- `getAllProfiles()` - Fetch all users
- `getProfile(address)` - Get user profile
- `getSocialAccounts(address)` - Get social accounts

**BadgeSystem:**
- `getUserBadges(address)` - Get user's badges

## Frontend Components

### `<ScoreCard />`
Display user's total score and breakdown by category.

### `<RefreshScoreButton />`
Trigger score update with cooldown enforcement.

### `<Leaderboard />`
Show top users ranked by score.

### `<SnapshotHistory />`
Display historical snapshots.

## React Hooks

### `useScore(address)`
Fetch and cache user's current score.

```typescript
const { score, rank, breakdown, loading, error, refresh } = useScore(address);
```

### `useSnapshot(snapshotId?)`
Fetch snapshot data from IPFS.

```typescript
const { snapshot, metadata, loading, error, refresh } = useSnapshot();
```

### `useScoreUpdate()`
Trigger score updates with transaction handling.

```typescript
const { updateScore, loading, error, success, canUpdate, timeUntilNext } = useScoreUpdate();
```

## Environment Variables

Required variables in `.env.local`:

```bash
# Smart Contract
NEXT_PUBLIC_PROXY_ADDRESS=0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF
NEXT_PUBLIC_TESTNET_RPC_URL=https://sepolia.infura.io/v3/...

# IPFS Node
NEXT_PUBLIC_IPFS_GATEWAY_URL=http://35.247.142.76:8080/ipfs
NEXT_IPFS_GATEWAY_URL_POST=http://35.247.142.76:5001/api/v0/add

# Validator (SERVER ONLY)
VALIDATOR_PRIVATE_KEY=0x...

# Cron Security
CRON_SECRET=random_secret

# Backend API
DEID_AUTH_BACKEND=http://localhost:8000
```

## IPFS Integration

### Upload Flow
1. Calculate scores for all users
2. Generate GlobalSnapshot JSON object
3. Calculate Merkle root
4. Upload JSON to IPFS node
5. Pin CID
6. Return CID for on-chain storage

### Fetch Flow
1. Get CID from smart contract
2. Try primary gateway first
3. Fallback to public gateways (ipfs.io, pinata, cloudflare)
4. Parse and return JSON data

## Signature Verification

Signatures match the simulation pattern exactly:

```typescript
messageHash = keccak256(snapshotId, root, keccak256(cid), timestamp)
signature = wallet.signMessage(messageHash)
```

Contract verifies:
1. Signature is from valid validator
2. Snapshot ID is increasing
3. Cooldown period has passed
4. Data integrity via merkle root

## Automated Updates

Configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/score/cron",
      "schedule": "0 0 * * *"
    }
  ]
}
```

Runs daily at midnight UTC. Calculates scores for all users and submits transaction automatically.

## Security Considerations

1. **Private Key**: Validator private key is only in server environment
2. **Signature Replay**: Protected by contract's signature tracking
3. **Cooldown**: Prevents spam updates
4. **Rate Limiting**: Should be added to API routes
5. **IPFS Auth**: Configure CORS on IPFS node
6. **Input Validation**: All addresses validated with `ethers.isAddress()`

## Gas Costs

Approximate gas costs:
- updateSnapshot(): ~150,000 gas (~$5 on mainnet, $0.01 on Sepolia)
- User pays gas (or can be subsidized)

## Future Improvements

1. **StreakTracker Integration**: Add real streak data
2. **Database Storage**: Replace in-memory update counts
3. **Caching Layer**: Redis for snapshot data
4. **Merkle Proofs**: Allow users to verify inclusion without full snapshot
5. **Score History Charts**: Track user's score over time
6. **Notifications**: Alert users of major rank changes
7. **Export Functions**: CSV export for leaderboard
8. **Advanced Filters**: Filter by badges, social accounts, etc.

## Testing

1. Test score calculation with mock data
2. Test IPFS upload/fetch
3. Test signature generation
4. Test contract interaction on testnet
5. Test full flow end-to-end
6. Test with multiple concurrent users
7. Test error scenarios

## Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Configure IPFS node CORS settings
- [ ] Set up Vercel cron job
- [ ] Fund validator wallet with test ETH
- [ ] Test score update flow on testnet
- [ ] Verify signatures match contract requirements
- [ ] Monitor IPFS pinning
- [ ] Set up error alerting
- [ ] Document API for frontend team

## Support

For questions or issues:
1. Check logs in Vercel dashboard
2. Verify IPFS node is accessible
3. Check contract events on block explorer
4. Review signature format matches simulation
5. Ensure validator wallet has ETH for gas
