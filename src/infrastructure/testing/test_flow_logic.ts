/**
 * Verification Script: FlowManager State Transitions
 * Agent 10 Vanguard によるロジック整合性検証
 */

import { FlowManager } from '../../domain/flow/FlowManager';

async function runTest() {
  console.log('--- Agent 10 Vanguard: Logic Verification Start ---');

  // 1. 初期状態のテスト
  const manager = new FlowManager(1000, {
    onStatusChange: (s) => console.log(`  [State Change] -> ${s}`),
    onStalled: () => console.log('  [Event] onStalled triggered!')
  });

  console.log(`Initial Status: ${manager.getStatus()}`); // Idle

  // 2. アクティビティ通知後のステータス変更
  console.log('Invoking activity...');
  manager.notifyActivity();
  console.log(`Status after activity: ${manager.getStatus()}`); // Writing

  // 3. 停滞の検知 (1秒の閾値を設定)
  console.log('Waiting for 1.2s to trigger stall...');
  manager.startMonitoring(100); // 100ms ごとにチェック
  
  await new Promise(resolve => setTimeout(resolve, 1200));

  if (manager.getStatus() === 'Stalled') {
    console.log('SUCCESS: Stalled status detected correctly.');
  } else {
    console.error('FAIL: Stalled status not detected.');
  }

  // 4. 再開の検知
  console.log('Resuming activity...');
  manager.notifyActivity();
  if (manager.getStatus() === 'Writing') {
    console.log('SUCCESS: Writing status resumed correctly.');
  } else {
    console.error('FAIL: Status did not return to Writing.');
  }

  manager.stopMonitoring();
  console.log('--- Agent 10 Vanguard: Verification Complete ---');
}

runTest().catch(console.error);
