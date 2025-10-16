# IPFS Loading Animation

A beautiful, progressive loading animation component that visualizes the process of fetching data from IPFS and blockchain networks.

## Features

### 🎨 Visual Elements

1. **Central IPFS Icon** - Rotating and pulsing database icon representing the IPFS node
2. **Orbiting Nodes** - 6 animated nodes orbiting the center, representing distributed network peers
3. **Connecting Lines** - Dynamic SVG lines showing data transmission between nodes
4. **Pulse Rings** - Expanding ripple effects showing network activity

### 📊 Progressive Steps

The animation shows 6 sequential loading steps:

1. **Connecting to IPFS network** - Initial connection establishment
2. **Resolving decentralized storage** - Finding the right storage nodes
3. **Fetching blockchain data** - Retrieving on-chain information
4. **Verifying cryptographic signatures** - Security validation
5. **Decrypting profile metadata** - Processing encrypted data
6. **Syncing with distributed nodes** - Final synchronization

### 📈 Real-time Feedback

- **Progress Bar** - Shows completion percentage (0-100%)
- **Step Indicators** - Visual checkmarks for completed steps
- **Active Step Highlighting** - Current step is highlighted with gradient background
- **IPFS Hash Display** - Simulated hash showing data being processed
- **Network Statistics** - Dynamic display of:
  - Active Nodes count
  - Connected Peers
  - Latency in milliseconds

## Usage

```tsx
import { IPFSLoadingAnimation } from "@/components/common/IPFSLoadingAnimation";

function MyComponent() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <IPFSLoadingAnimation />;
  }

  return <div>Your content</div>;
}
```

## Styling

The component uses the brand gradient colors:

- Primary: `#CA4A87`
- Secondary: `#b13e74`
- Tertiary: `#a0335f`

All animations are optimized for performance using Framer Motion and respect user's `prefers-reduced-motion` settings.

## Dependencies

- `framer-motion` - For smooth animations
- `lucide-react` - For icons
- Tailwind CSS - For styling
