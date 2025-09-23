/**
 * Tap Batching System
 * 
 * Handles client-side batching of taps to avoid rate limiting (429 errors)
 * while providing instant UI feedback for each tap.
 */

export interface TapEvent {
  timestamp: number
  clientSeq: number
  sessionId: string
  sessionEpoch: string
}

export interface BatchConfig {
  maxBatchSize: number
  maxBatchDelayMs: number
  batchMinIntervalMs: number
}

export interface TapBatchingState {
  pendingTaps: TapEvent[]
  isProcessing: boolean
  lastProcessedTime: number
  nextClientSeq: number
}

export class TapBatcher {
  private state: TapBatchingState
  private config: BatchConfig
  private processTimer: NodeJS.Timeout | null = null
  private onBatchProcess: (taps: TapEvent[]) => Promise<void>
  private onInstantFeedback: (tapCount: number) => void

  constructor(
    config: BatchConfig,
    onBatchProcess: (taps: TapEvent[]) => Promise<void>,
    onInstantFeedback: (tapCount: number) => void,
    initialClientSeq: number = 0
  ) {
    this.config = config
    this.onBatchProcess = onBatchProcess
    this.onInstantFeedback = onInstantFeedback
    this.state = {
      pendingTaps: [],
      isProcessing: false,
      lastProcessedTime: 0,
      nextClientSeq: initialClientSeq + 1
    }
  }

  /**
   * Add a tap to the batch queue
   */
  addTap(sessionId: string, sessionEpoch: string): void {
    const tap: TapEvent = {
      timestamp: Date.now(),
      clientSeq: this.state.nextClientSeq++,
      sessionId,
      sessionEpoch
    }

    this.state.pendingTaps.push(tap)

    // Provide instant UI feedback
    this.onInstantFeedback(1)

    // Schedule processing if needed
    this.scheduleProcessing()
  }

  /**
   * Process pending taps if conditions are met
   */
  private scheduleProcessing(): void {
    const now = Date.now()
    const shouldProcess = 
      this.state.pendingTaps.length >= this.config.maxBatchSize ||
      (this.state.pendingTaps.length > 0 && 
       now - this.state.lastProcessedTime >= this.config.maxBatchDelayMs)

    if (shouldProcess && !this.state.isProcessing) {
      this.processBatch()
    } else if (!this.processTimer && this.state.pendingTaps.length > 0) {
      // Schedule processing after max delay
      const delay = this.config.maxBatchDelayMs - (now - this.state.lastProcessedTime)
      this.processTimer = setTimeout(() => {
        if (!this.state.isProcessing) {
          this.processBatch()
        }
      }, Math.max(0, delay))
    }
  }

  /**
   * Process the current batch of taps
   */
  private async processBatch(): Promise<void> {
    if (this.state.isProcessing || this.state.pendingTaps.length === 0) {
      return
    }


    // Clear any pending timer
    if (this.processTimer) {
      clearTimeout(this.processTimer)
      this.processTimer = null
    }

    this.state.isProcessing = true
    const tapsToProcess = [...this.state.pendingTaps]
    this.state.pendingTaps = []

    try {
      await this.onBatchProcess(tapsToProcess)
      this.state.lastProcessedTime = Date.now()
    } catch {
      // Re-queue taps for retry (could implement exponential backoff here)
      this.state.pendingTaps.unshift(...tapsToProcess)
    } finally {
      this.state.isProcessing = false
      
      // Schedule next batch if there are pending taps
      if (this.state.pendingTaps.length > 0) {
        this.scheduleProcessing()
      }
    }
  }

  /**
   * Force process all pending taps immediately
   */
  async flush(): Promise<void> {
    if (this.state.pendingTaps.length > 0) {
      await this.processBatch()
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BatchConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Update the next client sequence number
   */
  updateClientSeq(newClientSeq: number): void {
    this.state.nextClientSeq = newClientSeq + 1
  }

  /**
   * Get current state for debugging
   */
  getState(): TapBatchingState {
    return { ...this.state }
  }

  /**
   * Reset the batcher state
   */
  reset(initialClientSeq: number = 0): void {
    if (this.processTimer) {
      clearTimeout(this.processTimer)
      this.processTimer = null
    }
    this.state = {
      pendingTaps: [],
      isProcessing: false,
      lastProcessedTime: 0,
      nextClientSeq: initialClientSeq + 1
    }
  }
}
