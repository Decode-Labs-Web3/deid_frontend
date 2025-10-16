# IPFS Loading & Error Animations

Beautiful, animated components that visualize the process of fetching data from IPFS and blockchain networks, including loading states and error handling.

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

---

# IPFS Error Animation

A visually engaging error state component that shows network failures and connection issues with the IPFS/blockchain network.

## Features

### 🎨 Visual Elements

1. **Broken Network Visualization** - Red error icon with disconnecting nodes
2. **Dynamic Node Disconnection** - Nodes randomly disconnect to simulate network failure
3. **Broken Connection Lines** - Dashed lines showing broken network paths
4. **Glitch Effects** - Periodic glitch animations for dramatic effect
5. **Warning Pulse Rings** - Red expanding ripples indicating errors

### 🚨 Error States

The animation displays:

- **Central Alert Icon** - AlertTriangle icon showing critical error
- **Network Down Indicator** - WiFi off icon
- **Zero Peers Status** - Shows no connected peers
- **IPFS Offline Status** - Server crash indicator
- **Error Message Display** - Custom error message with details

### 🛠️ Interactive Actions

- **Try Again Button** - Retry loading with animated hover effects
- **Go Back Button** - Navigate back to previous page
- **Troubleshooting Tips** - Helpful suggestions for users:
  - Check internet connection
  - Verify IPFS gateway accessibility
  - Network traffic warnings
  - Refresh or retry suggestions

## Usage

```tsx
import { IPFSErrorAnimation } from "@/components/common/IPFSErrorAnimation";

function MyComponent() {
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <IPFSErrorAnimation
        errorMessage={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return <div>Your content</div>;
}
```

## Props

### IPFSErrorAnimation

| Prop           | Type         | Default                           | Description                                    |
| -------------- | ------------ | --------------------------------- | ---------------------------------------------- |
| `errorMessage` | `string`     | `"Failed to load data from IPFS"` | The error message to display                   |
| `onRetry`      | `() => void` | `undefined`                       | Optional callback when retry button is clicked |

## Styling

The error component uses red theme colors:

- Error Primary: `#ef4444` (red-500)
- Error Secondary: `#dc2626` (red-700)
- Muted: Gray tones for disconnected states

## Animations

- **Glitch Effect** - Triggers every 3 seconds with scale/rotate distortion
- **Node Disconnection** - Random nodes disconnect every 1.5 seconds
- **Pulse Rings** - Continuous red warning pulses
- **Button Hover** - Smooth shimmer effect on retry button
- **Error Text Flash** - Periodic error code display with glitch aesthetic
