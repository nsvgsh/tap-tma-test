# UI-EARN-NOTIFICATIONS — Implementation Plan

## Architectural Analysis

### Current State
- Bottom navigation is implemented using Shadow DOM in `BottomNavShadow.tsx`
- EARN tasks are refreshed when user enters EARN section or levels up (already implemented)
- Level changes are tracked via `counters.level` in main page component
- Tap counting is handled by `tapBatcher` with batching logic

### Integration Points
1. **BottomNavShadow.tsx**: Add notification state and visual indicators
2. **Main page component**: Track new task availability and tap count
3. **CSS animations**: Add shaking animation and red dot styling
4. **State management**: Track notification visibility and dismissal conditions

### Data Flow
```
Level Up → New Tasks Available → Show Notifications
User Taps (5x) → Stop Shaking (keep red dot)
User Enters EARN → Hide All Notifications
```

## Task List

### 1. State Management Setup
- [ ] Add notification state to main page component
- [ ] Track when new tasks become available
- [ ] Track tap count for shaking dismissal
- [ ] Track EARN section visits for red dot dismissal

### 2. BottomNavShadow Enhancement
- [ ] Add notification props to BottomNavShadow component
- [ ] Implement red dot indicator for EARN icon
- [ ] Add shaking animation CSS class
- [ ] Update icon rendering logic to show notifications

### 3. CSS Animations
- [ ] Create shaking animation keyframes
- [ ] Style red dot notification indicator
- [ ] Ensure animations are smooth and performant

### 4. Logic Integration
- [ ] Connect level-up detection to notification trigger
- [ ] Implement tap counting for shaking dismissal
- [ ] Add EARN section visit detection
- [ ] Handle notification state updates

### 5. Testing & Polish
- [ ] Test notification appearance on level up
- [ ] Verify shaking stops after 5 taps
- [ ] Confirm red dot disappears only on EARN visit
- [ ] Test edge cases and state transitions

## Documentation Impact
- Update component documentation for BottomNavShadow
- Add notification behavior to user experience documentation
- Document CSS animation classes for future reference

## Implementation Notes
- Use CSS transforms for smooth shaking animation
- Implement notification state as a simple boolean flag
- Leverage existing level-up detection logic
- Ensure notifications work with existing task refresh logic
