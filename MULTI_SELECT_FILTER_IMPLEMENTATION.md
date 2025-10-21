# Multi-Select Filter Implementation for Origin Tasks

## Overview

This document describes the multi-select filter implementation for the Origin Tasks page, allowing users to filter tasks by multiple blockchain networks and task types simultaneously.

## Features Implemented

### 1. **Multi-Select Filter State**

- Two independent filter arrays:
  - `selectedNetworks`: Array of selected blockchain networks (ethereum, base, bsc)
  - `selectedTypes`: Array of selected task types (token, nft)

### 2. **Filter UI Components**

#### Network Filters

- ✅ Ethereum
- ✅ Base
- ✅ BNB Smart Chain

#### Type Filters

- ✅ Token Balance (ERC20 balance check)
- ✅ NFT Balance (ERC721 balance check)

### 3. **Interactive Filter Controls**

- **Checkboxes**: Toggle individual filters on/off
- **Active Filter Badges**: Visual display of selected filters with click-to-remove
- **Clear All Button**: Reset all filters at once
- **Filter Count Badge**: Shows total number of active filters

### 4. **API Integration**

#### Query Parameter Format

The implementation builds API URLs matching the backend specification:

```javascript
// Example generated URLs:
GET /api/task?page=1&page_size=100
GET /api/task?page=1&page_size=100&type=token
GET /api/task?page=1&page_size=100&type=token&type=nft
GET /api/task?page=1&page_size=100&network=ethereum
GET /api/task?page=1&page_size=100&network=ethereum&network=bsc
GET /api/task?page=1&page_size=100&type=token&network=ethereum&network=base
```

#### Real-time Filtering

- Tasks are fetched from the API whenever filters change
- Uses `useEffect` hook to trigger API calls on filter state changes
- Supports server-side filtering for optimal performance

### 5. **User Experience Features**

#### Visual Feedback

- Loading animation while fetching filtered results
- Active filter count badge in filter header
- Results count display (e.g., "Showing 5 filtered tasks")
- Hover effects on checkboxes and badges

#### Empty States

1. **No Tasks in Database**: Shows when no tasks exist at all
2. **No Results from Filters**: Shows when filters exclude all tasks, with "Clear All Filters" button

#### Filter Management

- Click checkbox to toggle filter
- Click active filter badge to remove specific filter
- Click "Clear All" to remove all filters at once

## Code Structure

### Key Functions

```typescript
// Toggle individual filters
const toggleNetworkFilter = (network: string) => {
  setSelectedNetworks((prev) =>
    prev.includes(network)
      ? prev.filter((n) => n !== network)
      : [...prev, network]
  );
};

const toggleTypeFilter = (type: string) => {
  setSelectedTypes((prev) =>
    prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
  );
};

// Clear all filters
const clearAllFilters = () => {
  setSelectedNetworks([]);
  setSelectedTypes([]);
};

// Build API URL with multiple query params
const buildFilteredApiUrl = () => {
  const params = new URLSearchParams();
  params.append("page", "1");
  params.append("page_size", "100");

  selectedNetworks.forEach((network) => {
    params.append("network", network);
  });

  selectedTypes.forEach((type) => {
    params.append("type", type);
  });

  return `/api/task?${params.toString()}`;
};
```

## Filter Behavior Examples

### Example 1: Single Network Filter

**User Action**: Select "Ethereum"
**API Call**: `GET /api/task?page=1&page_size=100&network=ethereum`
**Result**: Shows only Ethereum tasks

### Example 2: Multiple Network Filters

**User Action**: Select "Ethereum" and "Base"
**API Call**: `GET /api/task?page=1&page_size=100&network=ethereum&network=base`
**Result**: Shows tasks from Ethereum OR Base

### Example 3: Combined Filters

**User Action**: Select "Token" type + "Ethereum" network
**API Call**: `GET /api/task?page=1&page_size=100&type=token&network=ethereum`
**Result**: Shows only token balance tasks on Ethereum

### Example 4: Multiple Types and Networks

**User Action**: Select "Token" + "NFT" types + "Ethereum" + "BSC" networks
**API Call**: `GET /api/task?page=1&page_size=100&type=token&type=nft&network=ethereum&network=bsc`
**Result**: Shows all task types on Ethereum and BSC networks

## UI/UX Highlights

### Color Scheme

- Primary accent: `#CA4A87` (pink/magenta)
- Active filter badges: Pink background with opacity
- Checkboxes: Pink when checked
- Hover states: Subtle background transitions

### Responsive Design

- Grid layout adapts to screen size (2-col mobile → 5-col desktop)
- Filter section stacks vertically on mobile
- Touch-friendly checkbox sizes

### Accessibility

- Proper label associations for checkboxes
- Clear visual states (checked/unchecked)
- Descriptive aria labels
- Keyboard navigation support

## Performance Considerations

1. **Server-side Filtering**: API does the heavy lifting
2. **Optimized Re-renders**: Uses useEffect with proper dependencies
3. **Minimal State Updates**: Only changes when user interacts
4. **Loading States**: Prevents multiple simultaneous API calls

## Integration with Existing Features

The filter system:

- ✅ Works alongside the admin "Create Task" feature
- ✅ Maintains filter state while creating new tasks
- ✅ Refreshes filtered results after task creation
- ✅ Respects existing loading/error states
- ✅ Compatible with task card display grid

## Future Enhancements

Potential improvements:

1. Add filter persistence (localStorage/URL params)
2. Add "Select All" / "Deselect All" buttons
3. Add animation transitions for filter changes
4. Add filter count in network/type section headers
5. Add search/keyword filter
6. Add date range filter for task creation
7. Add sorting options (newest, oldest, alphabetical)

## Testing Checklist

- [ ] Filter by single network
- [ ] Filter by multiple networks
- [ ] Filter by single type
- [ ] Filter by multiple types
- [ ] Combine network and type filters
- [ ] Clear all filters
- [ ] Remove individual filter badges
- [ ] Check empty state with no filters
- [ ] Check empty state with active filters
- [ ] Verify API calls have correct query params
- [ ] Test responsive behavior on mobile
- [ ] Test keyboard navigation
- [ ] Test with admin vs non-admin users

## API Compatibility

This implementation is fully compatible with the backend API specification that supports:

- Multiple `network` query parameters
- Multiple `type` query parameters
- Pagination (`page`, `page_size`)
- Proper error responses for invalid filters

The frontend gracefully handles all API response formats including success, error, and pagination metadata.

### API Route Update

The Next.js API route at `/src/app/api/task/route.ts` has been updated to:

1. Extract multiple `network` parameters using `searchParams.getAll("network")`
2. Extract multiple `type` parameters using `searchParams.getAll("type")`
3. Forward all filter parameters to the backend API at `/api/v1/task/list`

**Flow:**

```
Frontend → /api/task?network=ethereum&type=token
          ↓
Next.js API Route → http://backend/api/v1/task/list?network=ethereum&type=token
          ↓
Backend filters tasks → Returns filtered results
          ↓
Frontend displays filtered tasks
```
