/**
 * Writing Flow Manager (Domain Layer)
 * 執筆フローの状態を監視し、イベントを発火させるビジネスロジック。
 */

export const FlowStatus = {
  Writing: 'Writing',
  Stalled: 'Stalled',
  Idle: 'Idle'
} as const;

export type FlowStatus = typeof FlowStatus[keyof typeof FlowStatus];

export interface FlowEvents {
  onStatusChange?: (status: FlowStatus) => void;
  onStalled?: () => void;
}

export class FlowManager {
  private lastActivityTime: number;
  private stallThresholdMs: number;
  private checkInterval: any = null;
  private currentStatus: FlowStatus = FlowStatus.Idle;
  private events: FlowEvents;

  constructor(stallThresholdMs: number = 5 * 60 * 1000, events: FlowEvents = {}) {
    this.lastActivityTime = Date.now();
    this.stallThresholdMs = stallThresholdMs;
    this.events = events;
  }

  /**
   * ユーザーの活動（タイピング等）を通知。タイマーをリセット。
   */
  public notifyActivity(): void {
    const now = Date.now();
    this.lastActivityTime = now;
    
    if (this.currentStatus !== FlowStatus.Writing) {
      this.setStatus(FlowStatus.Writing);
    }
  }

  /**
   * 監視を開始
   */
  public startMonitoring(intervalMs: number = 10000): void {
    if (this.checkInterval) return;

    this.checkInterval = setInterval(() => {
      this.checkStatus();
    }, intervalMs);
  }

  /**
   * 監視を停止
   */
  public stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkStatus(): void {
    const elapsed = Date.now() - this.lastActivityTime;

    if (elapsed >= this.stallThresholdMs && this.currentStatus === FlowStatus.Writing) {
      this.setStatus(FlowStatus.Stalled);
      if (this.events.onStalled) {
        this.events.onStalled();
      }
    }
  }

  private setStatus(status: FlowStatus): void {
    if (this.currentStatus === status) return;
    this.currentStatus = status;
    if (this.events.onStatusChange) {
      this.events.onStatusChange(status);
    }
  }

  public getStatus(): FlowStatus {
    return this.currentStatus;
  }

  /**
   * テスト用に閾値を変更
   */
  public setThreshold(ms: number): void {
    this.stallThresholdMs = ms;
  }
}
