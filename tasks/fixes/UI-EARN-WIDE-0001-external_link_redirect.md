# UI-EARN-WIDE-0001: Add external link redirect for wide tile

## Problem
The wide tile "SIGN UP FOR FREE TRIAL" currently calls `onWatch` function, but it should redirect to an external URL instead of opening a modal.

## Root Cause
The WideTile component is designed to work with task modals, but the wide tile should behave differently - it should redirect to an external link like the level bonus flow.

## Proposed Fix
1. **Modify WideTile component** to support external URL redirects
2. **Update EarnGrid** to pass the external URL to wide tiles
3. **Add URL generation logic** similar to `startLevelBonus` function
4. **Ensure proper link opening** with `window.open` and fallback

## Implementation Plan

### 1. Update WideTile component
- Add `externalUrl` prop to WideTileProps
- Modify onClick handler to open external URL when provided
- Keep existing behavior for regular tasks

### 2. Update EarnGrid component  
- Add logic to generate external URL for wide tiles
- Pass external URL to WideTile component
- Use the same URL generation as level bonus flow

### 3. Add URL generation
- Create reusable function for external URL generation
- Use the same pattern as `startLevelBonus` function
- Generate unique CLICKID for tracking

## Expected Outcome
- Wide tile "SIGN UP FOR FREE TRIAL" opens external link in new tab
- Maintains existing functionality for regular tiles
- Proper error handling and fallback for link opening
