# Backend Badge Minting Implementation Guide

## Problem Identified

The backend is getting "Method Not Allowed" because it's trying to call `mintBadge` on the **DEiDProxy** contract, but the proxy doesn't have this function directly. The `mintBadge` function exists in the **BadgeSystem** contract.

## Solution

The backend needs to use the **BadgeSystem ABI with the proxy address**, just like the frontend does. The proxy will delegate the call to the BadgeSystem implementation.

## Backend Implementation

### 1. Contract Configuration

```python
# In your backend settings
BADGE_SYSTEM_ABI = [
    {
        "inputs": [
            {"internalType": "string", "name": "taskId", "type": "string"},
            {"internalType": "bytes", "name": "deid_validator_signature", "type": "bytes"}
        ],
        "name": "mintBadge",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
    # ... other BadgeSystem functions
]

# Use the PROXY address, not a separate BadgeSystem address
PROXY_ADDRESS = "0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF"
```

### 2. ContractClient Usage

```python
# Create contract client with BadgeSystem ABI and proxy address
contract_client = ContractClient(
    contract_address=PROXY_ADDRESS,  # Use proxy address
    abi=BADGE_SYSTEM_ABI            # Use BadgeSystem ABI
)

# Call mintBadge - proxy will delegate to BadgeSystem implementation
result = await contract_client.send_transaction(
    function_name="mintBadge",
    args=[task_id, signature]
)
```

### 3. Complete Backend Endpoint

```python
@app.post("/api/v1/badge/mint")
async def mint_badge(
    task_id: str,
    signature: str,
    # Get user from session
):
    try:
        # Use BadgeSystem ABI with proxy address
        contract_client = ContractClient(
            contract_address=PROXY_ADDRESS,  # Proxy address
            abi=BADGE_SYSTEM_ABI            # BadgeSystem ABI
        )

        # Call mintBadge through proxy
        result = await contract_client.send_transaction(
            function_name="mintBadge",
            args=[task_id, signature]
        )

        return {
            "success": True,
            "data": result
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
```

## Key Points

1. **Use Proxy Address**: `0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF`
2. **Use BadgeSystem ABI**: Not the DEiDProxy ABI
3. **Proxy Delegation**: The proxy will delegate the call to the BadgeSystem implementation
4. **Same Pattern**: This follows the same pattern as profile creation

## Architecture

```
Backend ContractClient
    ↓
Uses BadgeSystem ABI + Proxy Address
    ↓
Proxy delegates to BadgeSystem implementation
    ↓
Badge minted ✅
```

## Why This Works

- **Proxy Pattern**: The DEiDProxy is a Diamond proxy that delegates calls to implementation contracts
- **BadgeSystem Implementation**: The BadgeSystem contract is deployed as a facet of the proxy
- **Unified Interface**: All contract calls go through the same proxy address
- **Consistent Architecture**: Same pattern as profile creation and updates

## Testing

1. **Deploy BadgeSystem**: Make sure BadgeSystem is deployed as a facet of the proxy
2. **Test Function**: Call `mintBadge` with BadgeSystem ABI and proxy address
3. **Verify Delegation**: Check that the proxy delegates to the correct implementation

## Environment Variables

```bash
# Backend environment
PROXY_ADDRESS=0xfcd6b7875C34c02846F55408038CbC35bC5A0BEF
BADGE_SYSTEM_ABI=[...]  # Full BadgeSystem ABI
```

This approach ensures that the backend uses the same contract interaction pattern as the frontend, maintaining consistency across the application.
