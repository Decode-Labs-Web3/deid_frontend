# DEiD Frontend

A modern Next.js application for managing decentralized identity, badges, scores, and social verifications on the blockchain.

## Overview

DEiD Frontend is the user interface for the DEiD (Decentralized Identity) system, part of The Decode Network. It provides a seamless Web3 experience for users to manage their on-chain identity, earn verifiable badges, track reputation scores, and verify social media accounts.

## Features

- **Wallet Connection**: Connect with MetaMask, WalletConnect, and other Web3 wallets via RainbowKit
- **Profile Management**: View and manage your decentralized identity profile
- **Badge System**: Browse, earn, and display NFT badges earned through task completion
- **Score System**: Track your reputation score calculated from badges, social links, chain activity, and streaks
- **Social Verification**: Link and verify social media accounts (Discord, Twitter, GitHub, Telegram) with cryptographic attestation
- **Task Management**: Browse and complete on-chain verification tasks to earn badges
- **Leaderboard**: View top users ranked by reputation score
- **IPFS Integration**: Decentralized metadata storage and retrieval for badges and profiles

## Technology Stack

- **Framework**: Next.js 16.0.1 (App Router)
- **React**: 19.1.0
- **TypeScript**: 5.9.3
- **Styling**: Tailwind CSS 4
- **Web3 Libraries**:
  - Wagmi 2.17.5 - React hooks for Ethereum
  - Viem 2.38.0 - TypeScript Ethereum library
  - Ethers.js 6.15.0 - Ethereum library
  - RainbowKit 2.2.8 - Wallet connection UI
- **State Management**: TanStack Query 5.90.2
- **UI Components**: Radix UI primitives
- **Forms**: React Hook Form 7.66.0 with Zod validation
- **Testing**: Vitest 2.1.8

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager
- A Web3 wallet (MetaMask recommended)
- Access to the DEiD backend API
- Access to IPFS gateway

## Installation

1. Clone the repository and navigate to the frontend directory:

```bash
cd deid_frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

4. Configure environment variables (see [Environment Variables](#environment-variables))

5. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Environment Variables

Create a `.env.local` file with the following variables:

```bash
# Backend API
NEXT_PUBLIC_DEID_AUTH_BACKEND=http://localhost:8000

# Smart Contract Configuration
NEXT_PUBLIC_PROXY_ADDRESS=0xYourProxyContractAddress
NEXT_PUBLIC_TESTNET_RPC_URL=https://eth-sepolia.public.blastapi.io
NEXT_PUBLIC_CHAIN_ID=11155111

# IPFS Configuration
NEXT_PUBLIC_IPFS_GATEWAY_URL=http://35.247.142.76:8080/ipfs
NEXT_IPFS_GATEWAY_URL_POST=http://35.247.142.76:5001/api/v0/add

# Validator Configuration (Server-side only)
VALIDATOR_PRIVATE_KEY=0xYourValidatorPrivateKey

# Cron Security (for automated score updates)
CRON_SECRET=your-random-secret-key

# Decode Portal SSO (if applicable)
NEXT_PUBLIC_DECODE_PORTAL_URL=https://portal.decode.com
```

### Environment Variable Descriptions

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_DEID_AUTH_BACKEND` | Backend API base URL | Yes |
| `NEXT_PUBLIC_PROXY_ADDRESS` | Smart contract proxy address | Yes |
| `NEXT_PUBLIC_TESTNET_RPC_URL` | Ethereum RPC endpoint | Yes |
| `NEXT_PUBLIC_CHAIN_ID` | Network chain ID (11155111 for Sepolia) | Yes |
| `NEXT_PUBLIC_IPFS_GATEWAY_URL` | IPFS gateway for reading content | Yes |
| `NEXT_IPFS_GATEWAY_URL_POST` | IPFS node for uploading content | Yes |
| `VALIDATOR_PRIVATE_KEY` | Private key for signing score snapshots | Server only |
| `CRON_SECRET` | Secret for cron job authentication | Server only |

## Development

### Available Scripts

```bash
# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Run tests
npm test
```

### Project Structure

```
deid_frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes (score system, etc.)
│   │   ├── profile/      # Profile pages
│   │   └── ...
│   ├── components/       # React components
│   │   ├── ui/          # UI primitives (Radix UI)
│   │   └── ...
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   ├── contracts/       # Smart contract ABIs and types
│   ├── utils/           # Helper functions
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── next.config.ts       # Next.js configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## Key Integrations

### Smart Contracts

The frontend interacts with several smart contracts deployed using the EIP-2535 Diamond Standard:

- **DEiDProfile**: User profile management
- **BadgeSystem**: NFT badge minting and management
- **ScoreFacet**: Reputation score snapshots
- **SocialLinkFacet**: Social account verification
- **TaskRegistry**: Task creation and completion

Contract addresses and ABIs are stored in `src/contracts/`.

### Backend API

The frontend communicates with the FastAPI backend for:

- User authentication and session management
- Profile synchronization
- Social link OAuth flows
- Task management
- Score computation triggers

API endpoints are prefixed with `/api/v1/`.

### IPFS

IPFS is used for decentralized storage of:

- Badge metadata (NFT metadata JSON)
- Score snapshots (Merkle tree data)
- Profile images and avatars

The application supports multiple IPFS gateways for redundancy.

## Features in Detail

### Score System

The DEiD Score System calculates user reputation based on:

1. **Badge Score**: Points from earned badges (default: 10 points per badge)
2. **Social Score**: 5 points per verified social account
3. **Streak Score**: 1 point per consecutive day (from StreakTracker contract)
4. **Chain Score**: Based on ETH balance, transaction count, and contract interactions
5. **Contribution Score**: 1 point per score update trigger

Scores are stored as Merkle tree snapshots on IPFS and verified on-chain. See [README_SCORE_SYSTEM.md](./README_SCORE_SYSTEM.md) for details.

### Badge System

Users can earn NFT badges by completing verification tasks:

- Browse available tasks filtered by type (token/NFT) and network (Ethereum/BSC/Base)
- Complete tasks by meeting requirements (e.g., holding tokens, owning NFTs)
- Mint badges on-chain after validation
- Display badges in profile with metadata from IPFS

### Social Verification

Link social media accounts with cryptographic verification:

- OAuth flow for Discord, Twitter, GitHub, Telegram
- EIP-712 signature verification
- On-chain attestation of linked accounts
- Status tracking (pending → verified → onchain)

See [AUTHENTICATION_HANDLING.md](./AUTHENTICATION_HANDLING.md) for authentication details.

## Testing

The project uses Vitest for testing:

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

Test files are located alongside source files with `.test.ts` or `.test.tsx` extensions.

## Building for Production

1. Set all environment variables in your production environment
2. Build the application:

```bash
npm run build
```

3. Start the production server:

```bash
npm start
```

Or deploy to a platform like Vercel:

```bash
vercel deploy --prod
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed deployment instructions.

## Deployment

The application can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Self-hosted** with Node.js

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

The application includes Vercel cron jobs for automated score updates (see `vercel.json`).

## Troubleshooting

### Wallet Connection Issues

- Ensure MetaMask or your wallet is installed
- Check that you're on the correct network (Sepolia testnet)
- Clear browser cache and cookies
- Check browser console for errors

### API Connection Issues

- Verify `NEXT_PUBLIC_DEID_AUTH_BACKEND` is correct
- Check CORS settings on backend
- Ensure backend is running and accessible
- Check network tab in browser DevTools

### IPFS Issues

- Verify IPFS gateway URLs are correct
- Check IPFS node is accessible
- Try alternative IPFS gateways (ipfs.io, pinata.cloud, cloudflare-ipfs.com)

## Related Documentation

- [Score System Implementation](./README_SCORE_SYSTEM.md)
- [Authentication Handling](./AUTHENTICATION_HANDLING.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Cross-Origin Cookies](./CROSS_ORIGIN_COOKIES.md)
- [Backend Badge Minting Guide](./BACKEND_BADGE_MINTING_GUIDE.md)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Check existing documentation in the `docs/` directory
- Review the [REPORT.md](../REPORT.md) for architecture details

---

**Built with ❤️ for The Decode Network**
