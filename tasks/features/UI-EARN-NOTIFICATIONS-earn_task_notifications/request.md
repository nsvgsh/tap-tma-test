# UI-EARN-NOTIFICATIONS — EARN Task Notifications

## What
Implement visual notifications for new tasks in the EARN section to alert users when new tasks become available after leveling up.

## Why
- Users need to be aware when new tasks become available in the EARN section
- Current implementation doesn't provide any visual indication of new content
- New tasks appear every time the user levels up, but there's no way to know this without manually checking
- Improves user engagement by drawing attention to new content

## Requirements
1. **Red Dot Indicator**: Add a small red dot to the EARN icon in bottom navigation when new tasks are available
2. **Shaking Animation**: Make the EARN icon shake to draw attention when new tasks appear
3. **Smart Dismissal Logic**:
   - Shaking stops after 5 taps OR when user enters EARN section
   - Red dot only disappears when user enters EARN section (not after taps)
4. **Trigger Condition**: Notifications appear when new tasks become available (typically on level up)

## User Experience
- User levels up → EARN icon starts shaking and shows red dot
- User taps 5 times → shaking stops, red dot remains
- User enters EARN section → both shaking and red dot disappear
- User sees new tasks in EARN section

## Technical Considerations
- Need to track when new tasks become available vs when user last visited EARN
- Animation should be smooth and not too distracting
- State management for notification visibility
- Integration with existing level-up detection logic
