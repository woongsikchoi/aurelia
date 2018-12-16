import { DI, IDisposable, inject } from '@aurelia/kernel';
import { IDOM, IEventListenerOrEventListenerObject, IManagedEvent, INode } from '../dom';
import { DelegationStrategy, IEventSubscriber } from '../interfaces';

//Note: path and deepPath are designed to handle v0 and v1 shadow dom specs respectively
/** @internal */
export function findOriginalEventTarget(event: IManagedEvent): unknown {
  return (event.composedPath && event.composedPath()[0]) || (event.deepPath && event.deepPath()[0]) || (event.path && event.path[0]) || event.target;
}

function stopPropagation(this: IManagedEvent): void {
  this.standardStopPropagation();
  this.propagationStopped = true;
}

function handleCapturedEvent(dom: IDOM, event: IManagedEvent): void {
  event.propagationStopped = false;
  let target: IEventTargetWithLookups = findOriginalEventTarget(event) as IEventTargetWithLookups;
  const orderedCallbacks = [];
  /**
   * During capturing phase, event 'bubbles' down from parent. Needs to reorder callback from root down to target
   */
  while (target) {
    if (target.capturedCallbacks) {
      const callback = target.capturedCallbacks[event.type];
      if (callback) {
        if (event.stopPropagation !== stopPropagation) {
          event.standardStopPropagation = event.stopPropagation;
          event.stopPropagation = stopPropagation;
        }
        orderedCallbacks.push(callback);
      }
    }
    target = dom.getParentNode(target) as typeof target;
  }

  for (let i = orderedCallbacks.length - 1; i >= 0 && !event.propagationStopped; i--) {
    const orderedCallback = orderedCallbacks[i];
    if ('handleEvent' in orderedCallback) {
      orderedCallback.handleEvent(event);
    } else {
      orderedCallback(event);
    }
  }
}

function handleDelegatedEvent(dom: IDOM, event: IManagedEvent): void {
  event.propagationStopped = false;
  let target: IEventTargetWithLookups = findOriginalEventTarget(event) as IEventTargetWithLookups;
  while (target && !event.propagationStopped) {
    if (target.delegatedCallbacks) {
      const callback = target.delegatedCallbacks[event.type];
      if (callback) {
        if (event.stopPropagation !== stopPropagation) {
          event.standardStopPropagation = event.stopPropagation;
          event.stopPropagation = stopPropagation;
        }
        if ('handleEvent' in callback) {
          callback.handleEvent(event);
        } else {
          callback(event);
        }
      }
    }
    target = dom.getParentNode(target) as typeof target;
  }
}

export class ListenerTracker {
  private dom: IDOM;
  private capture: boolean;
  private count: number;
  private eventName: string;
  private listener: IEventListenerOrEventListenerObject;

  constructor(dom: IDOM, eventName: string, listener: IEventListenerOrEventListenerObject, capture: boolean) {
    this.dom = dom;
    this.capture = capture;
    this.count = 0;
    this.eventName = eventName;
    this.listener = listener;
  }

  public increment(): void {
    this.count++;
    if (this.count === 1) {
      this.dom.addEventListener(this.eventName, this.listener, null, this.capture);
    }
  }

  public decrement(): void {
    this.count--;
    if (this.count === 0) {
      this.dom.removeEventListener(this.eventName, this.listener, null, this.capture);
    }
  }
}

/**
 * Enable dispose() pattern for `delegate` & `capture` commands
 */
export class DelegateOrCaptureSubscription {
  constructor(
    public entry: ListenerTracker,
    public lookup: Record<string, IEventListenerOrEventListenerObject>,
    public targetEvent: string,
    callback: IEventListenerOrEventListenerObject
  ) {
    lookup[targetEvent] = callback;
  }

  public dispose(): void {
    this.entry.decrement();
    this.lookup[this.targetEvent] = null;
  }
}

/**
 * Enable dispose() pattern for addEventListener for `trigger`
 */
export class TriggerSubscription {
  constructor(
    public dom: IDOM,
    public target: INode,
    public targetEvent: string,
    public callback: IEventListenerOrEventListenerObject
  ) {
    dom.addEventListener(targetEvent, callback, target);
  }

  public dispose(): void {
    this.dom.removeEventListener(this.targetEvent, this.callback, this.target);
  }
}

export interface  IEventTargetWithLookups extends INode {
  delegatedCallbacks?: Record<string, IEventListenerOrEventListenerObject>;
  capturedCallbacks?: Record<string, IEventListenerOrEventListenerObject>;
}

export interface IElementConfiguration {
  tagName: string;
  properties: Record<string, string[]>;
}

export class EventSubscriber implements IEventSubscriber {
  private target: INode;
  private handler: IEventListenerOrEventListenerObject;

  constructor(private readonly events: string[]) {
    this.events = events;
    this.target = null;
    this.handler = null;
  }

  public subscribe(dom: IDOM, node: INode, callbackOrListener: IEventListenerOrEventListenerObject): void {
    this.target = node;
    this.handler = callbackOrListener;

    const add = dom.addEventListener;
    const events = this.events;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      add(events[i], callbackOrListener, node);
    }
  }

  public dispose(dom: IDOM): void {
    const node = this.target;
    const callbackOrListener = this.handler;
    const events = this.events;
    const remove = dom.removeEventListener;

    for (let i = 0, ii = events.length; ii > i; ++i) {
      remove(events[i], callbackOrListener, node);
    }

    this.target = this.handler = null;
  }
}

export type EventSubscription = DelegateOrCaptureSubscription | TriggerSubscription;

export interface IEventManager {
  addEventListener(target: INode, targetEvent: string, callbackOrListener: IEventListenerOrEventListenerObject, delegate: DelegationStrategy): IDisposable;
}

export const IEventManager = DI.createInterface<IEventManager>()
  .withDefault(x => x.singleton(EventManager));

/** @internal */
@inject(IDOM)
export class EventManager implements IEventManager {
  public elementHandlerLookup: Record<string, Record<string, string[]>> = {};
  public delegatedHandlers: Record<string, ListenerTracker> = {};
  public capturedHandlers: Record<string, ListenerTracker> = {};

  private dom: IDOM;

  constructor(dom: IDOM) {
    this.dom = dom;
  }

  public addEventListener(
    target: IEventTargetWithLookups,
    targetEvent: string,
    callbackOrListener: IEventListenerOrEventListenerObject,
    strategy: DelegationStrategy
  ): EventSubscription {
    let delegatedHandlers: Record<string, ListenerTracker> | undefined;
    let capturedHandlers: Record<string, ListenerTracker> | undefined;
    let handlerEntry: ListenerTracker | undefined;

    if (strategy === DelegationStrategy.bubbling) {
      delegatedHandlers = this.delegatedHandlers;
      handlerEntry = delegatedHandlers[targetEvent] || (delegatedHandlers[targetEvent] = new ListenerTracker(this.dom, targetEvent, handleDelegatedEvent.bind(undefined, this.dom), false));
      handlerEntry.increment();
      const delegatedCallbacks = target.delegatedCallbacks || (target.delegatedCallbacks = {});
      return new DelegateOrCaptureSubscription(handlerEntry, delegatedCallbacks, targetEvent, callbackOrListener);
    }
    if (strategy === DelegationStrategy.capturing) {
      capturedHandlers = this.capturedHandlers;
      handlerEntry = capturedHandlers[targetEvent] || (capturedHandlers[targetEvent] = new ListenerTracker(this.dom, targetEvent, handleCapturedEvent.bind(undefined, this.dom), true));
      handlerEntry.increment();
      const capturedCallbacks = target.capturedCallbacks || (target.capturedCallbacks = {});
      return new DelegateOrCaptureSubscription(handlerEntry, capturedCallbacks, targetEvent, callbackOrListener);
    }
    return new TriggerSubscription(this.dom, target, targetEvent, callbackOrListener);
  }
}
