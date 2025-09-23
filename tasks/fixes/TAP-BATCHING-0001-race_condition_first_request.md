# TAP-BATCHING-0001: Race Condition in First Tap Request

## Problem
When the game opens and user immediately starts tapping rapidly, there's a race condition that causes 409 Conflict errors. The issue occurs because:

1. **Session initialization race**: The `tapBatcher` is initialized with `clientSeq` from state, but this state might not be properly synchronized with the server's `lastAppliedSeq`
2. **Multiple concurrent requests**: If user taps before the first batch is processed, multiple requests can be sent with the same or conflicting `clientSeq` values
3. **Session epoch mismatch**: The session epoch might change during the initial session setup, causing `SUPERSEDED` errors

## Root Cause Analysis

### Current Flow Issues:
1. `resumeOrStartSession()` sets `clientSeq` from `data.lastAppliedSeq || 0`
2. `tapBatcher` is initialized with this `clientSeq` value
3. If user taps immediately, the batcher uses `clientSeq + 1, +2, +3...` for new taps
4. But if the session was just created/claimed, the server might not have the latest `lastAppliedSeq` value
5. This causes `SEQ_REWIND` or `SUPERSEDED` errors (409 Conflict)

### Specific Race Conditions:
- **Session claim vs tap processing**: Session claim and first tap batch can happen simultaneously
- **ClientSeq desync**: Client thinks it's at seq N, but server expects seq M
- **Session epoch changes**: Session epoch can change during session claim, invalidating pending taps

## Proposed Fix

### 1. Synchronize ClientSeq After Session Operations
- Ensure `clientSeq` is properly updated after session claim/start
- Reset `tapBatcher` with correct `clientSeq` after session operations
- Add proper error handling for 409 errors in tap processing

### 2. Add Session State Validation
- Validate session epoch before processing taps
- Handle session invalidation gracefully
- Implement proper retry logic for session-related errors

### 3. Improve Error Recovery
- On 409 errors, refresh session state and retry
- Implement exponential backoff for retries
- Clear pending taps when session becomes invalid

## Implementation Plan

1. **Fix session synchronization**:
   - Update `clientSeq` properly after session operations
   - Reset `tapBatcher` with correct sequence number
   - Add session validation before tap processing

2. **Improve error handling**:
   - Handle 409 errors by refreshing session state
   - Implement proper retry logic
   - Clear invalid taps when session changes

3. **Add defensive checks**:
   - Validate session epoch before processing
   - Check session validity before adding taps
   - Implement proper cleanup on session changes

## Expected Outcome
- No more 409 errors on rapid initial tapping
- Proper session synchronization
- Graceful error recovery
- Stable tap processing from game start
