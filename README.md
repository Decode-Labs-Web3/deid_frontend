# DeID Frontend

DeID frontend is a decentralized identity system powered by smart contracts.
Built with Next.js and Tailwind CSS for a modern web experience.

This project lets users manage their identity securely and privately on the blockchain.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui
- **Animations**: Framer Motion
- **Blockchain**: Ethers.js, Wagmi, RainbowKit
- **Authentication**: OAuth 2.0 (Facebook, Discord, GitHub, Google)
- **Linting**: ESLint
- **Package Manager**: npm

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm (comes with Node.js)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd deid_frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.

## Project Structure

```
deid_frontend/
├── src/
│   ├── app/                 # App Router pages and layouts
│   ├── components/          # Reusable React components
│   └── lib/                 # Utility functions and configurations
├── public/                  # Static assets
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── next.config.js          # Next.js configuration
```

## Features

- 🎨 **Beautiful Animations**: Progressive IPFS loading and error states with Framer Motion
- 🔐 **Social Login**: OAuth 2.0 integration with Facebook, Discord, GitHub, Google
- ⛓️ **Blockchain Identity**: On-chain profile management with IPFS storage
- 🔄 **Auto-Refresh**: Automatic account verification updates
- 📱 **Responsive Design**: Mobile-first UI with modern aesthetics
- 🛡️ **Secure**: Session-based authentication with cryptographic signatures

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Documentation

### Guides

- 📱 [SOCIAL_LOGIN.md](./SOCIAL_LOGIN.md) - OAuth 2.0 social login implementation
- 🎨 [Animation Components](./src/components/common/README.md) - IPFS loading & error animations
- 📄 [Component Documentation](./src/components/) - UI component library

### Demo Pages

- `/animation-demo` - Interactive animation showcase
- `/identity` - Decentralized identity & social accounts
- `/profile` - User profile with NFT collections
- `/create-account` - On-chain profile creation

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - utility-first CSS framework
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - typed JavaScript
- [Framer Motion](https://www.framer.com/motion/) - animation library
- [Ethers.js](https://docs.ethers.org/) - Ethereum library

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "feat: add your feature"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Create a Pull Request

## License

This project is licensed under the MIT License.
