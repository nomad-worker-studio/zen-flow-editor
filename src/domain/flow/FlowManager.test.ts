import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { FlowManager, FlowStatus } from './FlowManager';

describe('FlowManager', () => {
  let flowManager: FlowManager;
  const threshold = 1000; // 1 second for testing

  beforeEach(() => {
    vi.useFakeTimers();
    flowManager = new FlowManager(threshold);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with Idle status', () => {
    expect(flowManager.getStatus()).toBe(FlowStatus.Idle);
  });

  it('should change status to Writing when activity is notified', () => {
    flowManager.notifyActivity();
    expect(flowManager.getStatus()).toBe(FlowStatus.Writing);
  });

  it('should change status to Stalled after threshold with no activity', () => {
    const onStalled = vi.fn();
    const onStatusChange = vi.fn();
    
    flowManager = new FlowManager(threshold, { onStalled, onStatusChange });
    flowManager.startMonitoring(100);
    flowManager.notifyActivity();
    
    expect(flowManager.getStatus()).toBe(FlowStatus.Writing);

    // Advance time by threshold
    vi.advanceTimersByTime(threshold + 100);
    
    expect(flowManager.getStatus()).toBe(FlowStatus.Stalled);
    expect(onStalled).toHaveBeenCalled();
    expect(onStatusChange).toHaveBeenCalledWith(FlowStatus.Stalled);
  });

  it('should return to Writing when activity occurs after stalling', () => {
    flowManager.startMonitoring(100);
    flowManager.notifyActivity();
    
    vi.advanceTimersByTime(threshold + 100);
    expect(flowManager.getStatus()).toBe(FlowStatus.Stalled);

    flowManager.notifyActivity();
    expect(flowManager.getStatus()).toBe(FlowStatus.Writing);
  });

  it('should stop monitoring when stopMonitoring is called', () => {
    const onStalled = vi.fn();
    flowManager = new FlowManager(threshold, { onStalled });
    flowManager.startMonitoring(100);
    flowManager.notifyActivity();
    
    flowManager.stopMonitoring();
    
    vi.advanceTimersByTime(threshold + 100);
    // Interval should have been cleared, so no status change
    expect(onStalled).not.toHaveBeenCalled();
    expect(flowManager.getStatus()).toBe(FlowStatus.Writing);
  });
});
