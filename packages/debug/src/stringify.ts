import { LifecycleFlags } from '@aurelia/runtime';

export function stringifyLifecycleFlags(flags: LifecycleFlags): string {
  const flagNames: string[] = [];

  if (flags & LifecycleFlags.mustEvaluate) { flagNames.push('mustEvaluate'); }
  if (flags & LifecycleFlags.isCollectionMutation) { flagNames.push('isCollectionMutation'); }
  if (flags & LifecycleFlags.isInstanceMutation) { flagNames.push('isInstanceMutation'); }
  if (flags & LifecycleFlags.updateTargetObserver) { flagNames.push('updateTargetObserver'); }
  if (flags & LifecycleFlags.updateTargetInstance) { flagNames.push('updateTargetInstance'); }
  if (flags & LifecycleFlags.updateSourceExpression) { flagNames.push('updateSourceExpression'); }
  if (flags & LifecycleFlags.fromAsyncFlush) { flagNames.push('fromAsyncFlush'); }
  if (flags & LifecycleFlags.fromSyncFlush) { flagNames.push('fromSyncFlush'); }
  if (flags & LifecycleFlags.fromStartTask) { flagNames.push('fromStartTask'); }
  if (flags & LifecycleFlags.fromStopTask) { flagNames.push('fromStopTask'); }
  if (flags & LifecycleFlags.fromBind) { flagNames.push('fromBind'); }
  if (flags & LifecycleFlags.fromUnbind) { flagNames.push('fromUnbind'); }
  if (flags & LifecycleFlags.fromAttach) { flagNames.push('fromAttach'); }
  if (flags & LifecycleFlags.fromDetach) { flagNames.push('fromDetach'); }
  if (flags & LifecycleFlags.fromCache) { flagNames.push('fromCache'); }
  if (flags & LifecycleFlags.fromCreate) { flagNames.push('fromCreate'); }
  if (flags & LifecycleFlags.fromDOMEvent) { flagNames.push('fromDOMEvent'); }
  if (flags & LifecycleFlags.fromObserverSetter) { flagNames.push('fromObserverSetter'); }
  if (flags & LifecycleFlags.fromBindableHandler) { flagNames.push('fromBindableHandler'); }
  if (flags & LifecycleFlags.fromLifecycleTask) { flagNames.push('fromLifecycleTask'); }
  if (flags & LifecycleFlags.parentUnmountQueued) { flagNames.push('parentUnmountQueued'); }
  if (flags & LifecycleFlags.doNotUpdateDOM) { flagNames.push('doNotUpdateDOM'); }
  if (flags & LifecycleFlags.isTraversingParentScope) { flagNames.push('isTraversingParentScope'); }
  if (flags & LifecycleFlags.allowParentScopeTraversal) { flagNames.push('allowParentScopeTraversal'); }

  return flagNames.join('|');
}
