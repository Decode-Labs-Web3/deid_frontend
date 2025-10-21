# Task Verification & Badge Minting Setup

## Overview

This document describes the implementation of the task verification and badge minting system.

## Features Implemented

### 1. **Backend Validation API Route**

- Location: `/src/app/api/task/[taskId]/validate/route.ts`
- Endpoint: `POST /api/task/{taskId}/validate`
- Purpose: Validates user's wallet against task requirements
- Returns: Signature for on-chain minting

### 2. **Smart Contract Integration**

- **Architecture**: Backend-mediated contract interaction
- **Backend**: Handles contract calls using ContractClient
- **Function**: `mintBadge(string taskId, bytes signature)`
- **Network**: Sepolia Testnet
- **Pattern**: Frontend → Backend API → Smart Contract

### 3. **TaskCard Verification Flow**

- Updated component with complete verification logic
- Multi-step process with visual feedback
- Automatic signature formatting (adds 0x prefix)

## Environment Variables Required

Add these to your `.env.local` file:

```bash
# Backend API URL
DEID_AUTH_BACKEND=http://0.0.0.0:8000

# Backend API URL (REQUIRED)
# Backend handles contract interactions
DEID_AUTH_BACKEND=http://0.0.0.0:8000

# IPFS Gateway (optional)
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io

# Wallet Connect Project ID (optional, for RainbowKit)
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your-project-id

# RPC URL for Testnet (optional, has defaults)
NEXT_PUBLIC_TESTNET_RPC_URL=https://sepolia.infura.io/v3/your-key
```

### **IMPORTANT**: Proxy Pattern

The badge minting uses the **same proxy pattern as profile creation**:

- Calls are made to `NEXT_PUBLIC_PROXY_ADDRESS` (the proxy contract)
- Uses BadgeSystem ABI (the implementation contract's interface)
- Proxy delegates calls to the BadgeSystem implementation
- No need for separate BadgeSystem contract address

## Verification Flow

### User Journey

```
1. User clicks "Verify Task" button on TaskCard
   ↓
2. System checks wallet connection
   ↓
3. Frontend sends validation request to backend
   POST /api/task/{taskId}/validate
   (No body - wallet from session cookie)
   ↓
4. Backend gets wallet from session & validates token/NFT balance
   ↓
5. Backend returns signature
   Response: {
     success: true,
     data: {
       signature: "abc123...",
       task_id: "..."
     }
   }
   ↓
6. Frontend adds "0x" prefix to signature
   ↓
7. Frontend calls BadgeSystem.mintBadge(taskId, signature)
   ↓
8. User approves transaction in wallet
   ↓
9. Badge minted on-chain ✅
```

### Technical Flow

```typescript
// 1. Validate task (backend - uses session for wallet)
const validation = await fetch(`/api/task/${taskId}/validate`, {
  method: "POST",
  credentials: "include", // Sends session cookie
});

// 2. Get signature from response
const { signature, task_id } = validation.data;

// 3. Format signature
const formattedSig = signature.startsWith("0x") ? signature : `0x${signature}`;

// 4. Connect to proxy with BadgeSystem ABI
const provider = new ethers.BrowserProvider(walletClient);
const signer = await provider.getSigner();
const badgeContract = new ethers.Contract(
  PROXY_ADDRESS,
  BadgeSystemABI.abi,
  signer
);

// 5. Mint badge through proxy (on-chain)
const tx = await badgeContract.mintBadge(task_id, formattedSig, {
  gasLimit: 500000,
  maxFeePerGas: ethers.parseUnits("100", "gwei"),
  maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
});
await tx.wait();
```

## Button States

The "Verify Task" button shows different states:

| State          | Display                  | Description                       |
| -------------- | ------------------------ | --------------------------------- |
| `idle`         | "Verify Task"            | Ready to verify                   |
| `validating`   | "Validating..."          | Checking backend validation       |
| `minting`      | "Minting Badge..."       | Submitting blockchain transaction |
| `success`      | "Badge Minted! ✓"        | Successfully minted (green)       |
| `error`        | "Try Again"              | Verification failed (red)         |
| `disconnected` | "Verify Task" (disabled) | Wallet not connected              |

## Visual Feedback

### Loading States

- Spinner icon during validation and minting
- Button text updates to show current step
- Button is disabled during process

### Success State

- Green background and text
- Checkmark icon
- "Badge Minted! ✓" message
- Toast notification with success message
- Auto-resets after 3 seconds

### Error Handling

- Red background and text
- Error message in toast notification
- Button shows "Try Again"
- Logs detailed error to console

## Security Features

### 1. **Signature Verification**

- Backend generates signed proof of validation
- Frontend cannot forge signatures
- Smart contract verifies signature on-chain

### 2. **Wallet Validation**

- Checks wallet connection before proceeding
- Validates user owns required tokens/NFTs
- Smart contract double-checks ownership

### 3. **Error Handling**

- Graceful handling of network errors
- User-friendly error messages
- Detailed console logging for debugging

## Integration Points

### Backend API Request & Response

**Request**:

```http
POST /api/v1/task/{taskId}/validate
Content-Type: application/json
Cookie: session=...

(No body - wallet address from session)
```

**Response**:

```json
{
  "success": true,
  "message": "Task validated successfully",
  "data": {
    "task_id": "68f7442a9a3970e932cd8f3f",
    "user_wallet": "0x3f1fc384bd71a64cb031983fac059c9e452ad247",
    "actual_balance": "2",
    "required_balance": "1",
    "signature": "216e91cb302b09451ecb42142c84780e545bdbff...",
    "verification_hash": "0x987b58c60e8112eb84d52763f0970466fa20a6a2...",
    "task_details": { ... }
  }
}
```

**Note**: The backend retrieves the user's wallet address from the authenticated session cookie, not from the request body.

### Smart Contract Function

```solidity
function mintBadge(
    string memory taskId,
    bytes memory deid_validator_signature
) external
```

## Console Logging

The implementation includes comprehensive logging for debugging:

```
🔍 Step 1: Validating task with backend...
✅ Task validated successfully
📝 Signature: 216e91cb302b09451ecb42142c84780e...
🔗 Formatted signature: 0x216e91cb302b09451ecb42142c84780e...
⛓️  Step 2: Minting badge on-chain...
📋 Task ID: 68f7442a9a3970e932cd8f3f
🏭 Contract: 0xYourContractAddress
✅ Transaction submitted: 0xabc123...
```

## Testing Checklist

- [ ] Connect wallet (RainbowKit)
- [ ] Click "Verify Task" without wallet connected (should show error)
- [ ] Click "Verify Task" with wallet connected
- [ ] Check console logs for validation request
- [ ] Check backend receives correct wallet address
- [ ] Verify signature is returned from backend
- [ ] Confirm 0x prefix is added to signature
- [ ] Check MetaMask transaction popup appears
- [ ] Approve transaction in wallet
- [ ] Verify badge is minted on-chain
- [ ] Check success state and toast notification
- [ ] Test with insufficient balance (should fail validation)
- [ ] Test network errors
- [ ] Verify button disabled state when wallet not connected

## Proxy Pattern Architecture

This implementation follows the **same proxy pattern** used in the create-account flow:

```
TaskCard Component
    ↓
Connects to Proxy Contract (NEXT_PUBLIC_PROXY_ADDRESS)
    ↓
Uses BadgeSystem ABI (implementation interface)
    ↓
Proxy delegates call to BadgeSystem implementation
    ↓
Badge minted ✅
```

**Key Points**:

- Same proxy address as profile creation (`0xAF993e50103D8a19a5FD66EF3a45a18D1A713E2f`)
- BadgeSystem is the implementation behind the proxy
- Calls go through proxy, not directly to BadgeSystem
- This enables upgradeability and unified access control

## Troubleshooting

### "Backend API not configured"

**Solution**: Set `DEID_AUTH_BACKEND` in `.env.local` to your backend API URL

### "Please connect your wallet first"

**Solution**: Click "Connect Wallet" button in header (RainbowKit)

### Transaction fails on-chain

**Possible causes**:

1. Invalid signature format (check 0x prefix is added)
2. User already claimed this badge
3. Wrong network (must be on Sepolia - chain ID 11155111)
4. Backend API not running
5. Backend contract configuration incorrect
6. Insufficient gas

### Validation fails

**Possible causes**:

1. User doesn't meet token/NFT requirements
2. Wrong contract address configured
3. Backend API not reachable
4. Wrong wallet address sent

## Files Modified

1. `/src/components/cards/TaskCard.tsx` - Added verification logic with proxy pattern
2. `/src/app/api/task/[taskId]/validate/route.ts` - Created validation API route
3. `/src/contracts/verification/BadgeSystem.sol/BadgeSystem.json` - Contract ABI (existing)

## Proxy vs Direct Contract

**Why use proxy?**

- ✅ Unified access control (same proxy as profiles)
- ✅ Upgradeability (can update BadgeSystem implementation)
- ✅ Consistent architecture across all smart contract interactions
- ✅ Single contract address for all DEiD operations

**Pattern used in**:

- Profile creation (`createProfile`)
- Profile updates (`updateProfile`)
- Badge minting (`mintBadge`) ← This implementation

## Dependencies

Already installed (from existing setup):

- `wagmi` - Ethereum interaction
- `viem` - Ethereum utilities
- `@rainbow-me/rainbowkit` - Wallet connection
- `@tanstack/react-query` - Request management

## Next Steps

1. **Deploy BadgeSystem Contract** (if not already deployed)
2. **Set Environment Variables** (especially contract address)
3. **Test on Testnet** (Sepolia recommended)
4. **Configure Backend** to return proper signatures
5. **Deploy to Production** once tested

## Support

For issues or questions:

1. Check console logs for detailed error messages
2. Verify environment variables are set correctly
3. Confirm backend API is running and accessible
4. Check wallet connection and network
5. Review transaction on block explorer (Etherscan)
