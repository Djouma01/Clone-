import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addClonedApp,
  calculateSpaceMetrics,
  clearClonedAppData,
  closeClonedApp,
  createInitialSpaceState,
  lockVirtualSpace,
  openClonedApp,
  provisionVirtualSpace,
  removeClonedApp,
  setPinCode,
  updateSpaceSettings,
  verifyPinCode,
} from './spaceLogic';

test('provisions virtual space and prevents adding apps before provisioning', () => {
  const initial = createInitialSpaceState();
  assert.equal(initial.isProvisioned, false);

  const blocked = addClonedApp(initial, 'com.whatsapp', 'Compte Pro');
  assert.ok(blocked.error);
  assert.equal(blocked.state.clonedApps.length, 0);

  const provisioned = provisionVirtualSpace(initial);
  assert.equal(provisioned.isProvisioned, true);
  assert.equal(provisioned.workUserId, 10);
});

test('adds, opens, closes, clears data, and removes cloned apps cleanly', () => {
  let state = provisionVirtualSpace(createInitialSpaceState());

  const added = addClonedApp(state, 'com.whatsapp', 'Compte Pro');
  assert.equal(added.error, undefined);
  assert.equal(added.state.clonedApps.length, 1);
  state = added.state;

  // Duplicate same package + same label should be rejected
  const dup = addClonedApp(state, 'com.whatsapp', 'Compte Pro');
  assert.ok(dup.error);

  // Same package with different account label is allowed
  const secondAccount = addClonedApp(state, 'com.whatsapp', 'Compte Perso 2');
  assert.equal(secondAccount.error, undefined);
  assert.equal(secondAccount.state.clonedApps.length, 2);
  state = secondAccount.state;

  const firstId = state.clonedApps[0].id;
  state = openClonedApp(state, firstId);
  assert.equal(state.activeAppId, firstId);
  assert.equal(state.clonedApps[0].isRunning, true);
  assert.equal(state.clonedApps[0].isSuspended, false);

  state = closeClonedApp(state, firstId);
  assert.equal(state.activeAppId, null);
  assert.equal(state.clonedApps[0].isRunning, false);
  assert.equal(state.clonedApps[0].isSuspended, true);

  state = clearClonedAppData(state, firstId);
  assert.equal(state.clonedApps[0].dataSizeMb, 12.4);

  const metrics = calculateSpaceMetrics(state);
  assert.equal(metrics.installedCount, 2);
  assert.equal(metrics.suspendedCount, 1);

  state = removeClonedApp(state, firstId);
  assert.equal(state.clonedApps.length, 1);
});

test('handles PIN security configuration, locking, and verification', () => {
  let state = provisionVirtualSpace(createInitialSpaceState());

  const invalid = setPinCode(state, '12');
  assert.ok(invalid.error);

  const valid = setPinCode(state, '2580');
  assert.equal(valid.error, undefined);
  assert.ok(valid.state.pinHash);
  state = valid.state;

  state = lockVirtualSpace(state);
  assert.equal(state.isLocked, true);

  const wrong = verifyPinCode(state, '0000');
  assert.equal(wrong.unlocked, false);
  assert.equal(wrong.state.isLocked, true);
  assert.equal(wrong.state.failedAttempts, 1);

  const right = verifyPinCode(wrong.state, '2580');
  assert.equal(right.unlocked, true);
  assert.equal(right.state.isLocked, false);
  assert.equal(right.state.failedAttempts, 0);
});

test('updates space name and wallpaper customization', () => {
  let state = provisionVirtualSpace(createInitialSpaceState());
  state = updateSpaceSettings(state, {
    spaceName: 'Espace Bureau',
    wallpaperId: 'cobalt_horizon',
    biometricEnabled: true,
  });

  assert.equal(state.spaceName, 'Espace Bureau');
  assert.equal(state.wallpaperId, 'cobalt_horizon');
  assert.equal(state.biometricEnabled, true);
});
