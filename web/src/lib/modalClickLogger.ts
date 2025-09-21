interface ModalClickData {
  userId: string;
  sessionId: string;
  level: number;
  clickType: 'try_for_free'; // Only TRY FOR FREE button clicks
  modalType?: string;
  additionalData?: Record<string, unknown>;
}

export class ModalClickLogger {
  private static instance: ModalClickLogger;
  private isEnabled: boolean = true;

  private constructor() {}

  public static getInstance(): ModalClickLogger {
    if (!ModalClickLogger.instance) {
      ModalClickLogger.instance = new ModalClickLogger();
    }
    return ModalClickLogger.instance;
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public async logClick(data: ModalClickData): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    try {
      const response = await fetch('/api/v1/modal/log-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          modalType: data.modalType || 'level_up',
          additionalData: data.additionalData || {}
        })
      });

      if (!response.ok) {
        console.warn('Failed to log modal click:', await response.text());
      }
    } catch (error) {
      console.warn('Error logging modal click:', error);
    }
  }

  public async logLevelUpModalClick(
    userId: string,
    sessionId: string,
    level: number,
    clickType: ModalClickData['clickType'],
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    await this.logClick({
      userId,
      sessionId,
      level,
      clickType,
      modalType: 'level_up',
      additionalData
    });
  }

  public async logTaskClaimModalClick(
    userId: string,
    sessionId: string,
    level: number,
    clickType: ModalClickData['clickType'],
    taskId?: string,
    additionalData?: Record<string, unknown>
  ): Promise<void> {
    await this.logClick({
      userId,
      sessionId,
      level,
      clickType,
      modalType: 'task_claim',
      additionalData: {
        ...additionalData,
        taskId
      }
    });
  }
}

// Export singleton instance
export const modalClickLogger = ModalClickLogger.getInstance();
