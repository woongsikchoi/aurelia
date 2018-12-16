import { DI, IDisposable, IIndexable, InterfaceSymbol, IServiceLocator, Omit } from '@aurelia/kernel';
import { IEventListenerOrEventListenerObject, INode } from './dom.interfaces';

export const enum State {
  none                  = 0b000000000000,
  isBinding             = 0b000000000001,
  isBound               = 0b000000000010,
  isAttaching           = 0b000000000100,
  isAttached            = 0b000000001000,
  isMounted             = 0b000000010000,
  isDetaching           = 0b000000100000,
  isUnbinding           = 0b000001000000,
  isCached              = 0b000010000000
}

export const enum Hooks {
  none                   = 0b000000000001,
  hasCreated             = 0b000000000010,
  hasBinding             = 0b000000000100,
  hasBound               = 0b000000001000,
  hasAttaching           = 0b000000010000,
  hasAttached            = 0b000000100000,
  hasDetaching           = 0b000001000000,
  hasDetached            = 0b000010000000,
  hasUnbinding           = 0b000100000000,
  hasUnbound             = 0b001000000000,
  hasRender              = 0b010000000000,
  hasCaching             = 0b100000000000
}

export enum LifecycleFlags {
  none                      = 0b0_0000_00000000000000_000_00,
  mustEvaluate              = 0b0_0001_00000000000000_000_00,
  mutation                  = 0b0_0000_00000000000000_000_11,
  isCollectionMutation      = 0b0_0000_00000000000000_000_01,
  isInstanceMutation        = 0b0_0000_00000000000000_000_10,
  update                    = 0b0_0000_00000000000000_111_00,
  updateTargetObserver      = 0b0_0000_00000000000000_001_00,
  updateTargetInstance      = 0b0_0000_00000000000000_010_00,
  updateSourceExpression    = 0b0_0000_00000000000000_100_00,
  from                      = 0b0_0000_11111111111111_000_00,
  fromFlush                 = 0b0_0000_00000000000011_000_00,
  fromAsyncFlush            = 0b0_0000_00000000000001_000_00,
  fromSyncFlush             = 0b0_0000_00000000000010_000_00,
  fromStartTask             = 0b0_0000_00000000000100_000_00,
  fromStopTask              = 0b0_0000_00000000001000_000_00,
  fromBind                  = 0b0_0000_00000000010000_000_00,
  fromUnbind                = 0b0_0000_00000000100000_000_00,
  fromAttach                = 0b0_0000_00000001000000_000_00,
  fromDetach                = 0b0_0000_00000010000000_000_00,
  fromCache                 = 0b0_0000_00000100000000_000_00,
  fromCreate                = 0b0_0000_00001000000000_000_00,
  fromDOMEvent              = 0b0_0000_00010000000000_000_00,
  fromObserverSetter        = 0b0_0000_00100000000000_000_00,
  fromBindableHandler       = 0b0_0000_01000000000000_000_00,
  fromLifecycleTask         = 0b0_0000_10000000000000_000_00,
  parentUnmountQueued       = 0b0_0010_00000000000000_000_00,
  // this flag is for the synchronous flush before detach (no point in updating the
  // DOM if it's about to be detached)
  doNotUpdateDOM            = 0b0_0100_00000000000000_000_00,
  isTraversingParentScope   = 0b0_1000_00000000000000_000_00,
  // Bitmask for flags that need to be stored on a binding during $bind for mutation
  // callbacks outside of $bind
  persistentBindingFlags    = 0b1_0000_00000000000000_000_00,
  allowParentScopeTraversal = 0b1_0000_00000000000000_000_00,
}

/*
* Note: the oneTime binding now has a non-zero value for 2 reasons:
*  - plays nicer with bitwise operations (more consistent code, more explicit settings)
*  - allows for potentially having something like BindingMode.oneTime | BindingMode.fromView, where an initial value is set once to the view but updates from the view also propagate back to the view model
*
* Furthermore, the "default" mode would be for simple ".bind" expressions to make it explicit for our logic that the default is being used.
* This essentially adds extra information which binding could use to do smarter things and allows bindingBehaviors that add a mode instead of simply overwriting it
*/
export enum BindingMode {
  oneTime  = 0b0001,
  toView   = 0b0010,
  fromView = 0b0100,
  twoWay   = 0b0110,
  default  = 0b1000
}

/** @internal */
export const enum SubscriberFlags {
  None            = 0,
  Subscriber0     = 0b0001,
  Subscriber1     = 0b0010,
  Subscriber2     = 0b0100,
  SubscribersRest = 0b1000,
  Any             = 0b1111,
}

/**
 * Mostly just a marker enum to help with typings (specifically to reduce duplication)
 */
export enum MutationKind {
  instance   = 0b01,
  collection = 0b10
}

export const enum CollectionKind {
  indexed = 0b1000,
  keyed   = 0b0100,
  array   = 0b1001,
  map     = 0b0110,
  set     = 0b0111
}

export enum DelegationStrategy {
  none = 0,
  capturing = 1,
  bubbling = 2
}

export interface IBindingContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup<IOverrideContext>;
  getObservers?(): ObserversLookup<IOverrideContext>;
}

export interface IOverrideContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup<IOverrideContext>;
  readonly bindingContext: IBindingContext;
  readonly parentOverrideContext: IOverrideContext | null;
  getObservers(): ObserversLookup<IOverrideContext>;
}

export interface IScope {
  readonly bindingContext: IBindingContext;
  readonly overrideContext: IOverrideContext;
  // parentScope is strictly internal API and mainly for replaceable template controller.
  // NOT intended for regular scope traversal!
  /** @internal */readonly parentScope: IScope | null;
}

export interface IBinding extends IBindScope {
  readonly locator: IServiceLocator;
  readonly $scope: IScope;
}

export interface IPartialConnectableBinding extends IBinding, IPropertySubscriber {
  observerLocator: IObserverLocator;
}

export interface IObjectObservationAdapter {
  getObserver(object: IObservable, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}

export interface IObserverLocator {
  getObserver(obj: IObservable, propertyName: string): AccessorOrObserver;
  getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor;
  addAdapter(adapter: IObjectObservationAdapter): void;
  getArrayObserver(observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
  getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
  getSetObserver(observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
}

export const IObserverLocator = DI.createInterface<IObserverLocator>().noDefault();

export interface ITargetObserverLocator {
  getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: unknown, propertyName: string): IBindingTargetAccessor | IBindingTargetObserver;
  overridesAccessor(obj: unknown, propertyName: string): boolean;
  handles(obj: unknown): boolean;
}
export const ITargetObserverLocator = DI.createInterface<ITargetObserverLocator>().noDefault();

export interface ITargetAccessorLocator {
  getAccessor(lifecycle: ILifecycle, obj: unknown, propertyName: string): IBindingTargetAccessor;
  handles(obj: unknown): boolean;
}
export const ITargetAccessorLocator = DI.createInterface<ITargetAccessorLocator>().noDefault();

export interface IConnectableBinding extends IPartialConnectableBinding {
  $nextConnect?: IConnectableBinding;
  $nextPatch?: IConnectableBinding;
  observerSlots: number;
  version: number;
  observeProperty(obj: IIndexable, propertyName: string): void;
  addObserver(observer: IBindingTargetObserver): void;
  unobserve(all?: boolean): void;
  connect(flags: LifecycleFlags): void;
  patch(flags: LifecycleFlags): void;
}

export type IBindingTarget = INode | IObservable; // Can be: Node | CSSStyleDeclaration | IObservable;

/**
 * Describes a type that tracks changes and can flush those changes in some way
 */
export interface IChangeTracker {
  $nextFlush?: IChangeTracker;
  hasChanges?: boolean;
  flush(flags: LifecycleFlags): void;
}

/**
 * Basic interface to normalize getting/setting a value of any property on any object
 */
export interface IAccessor<TValue = unknown> {
  getValue(): TValue;
  setValue(newValue: TValue, flags: LifecycleFlags): void;
}

/**
 * Describes a target observer for to-view bindings (in other words, an observer without the observation).
 */
export interface IBindingTargetAccessor<
  TObj = any,
  TProp = keyof TObj,
  TValue = unknown>
  extends IDisposable,
          IAccessor<TValue>,
          IPropertyChangeTracker<TObj, TProp> { }

export interface IEventSubscriber extends IDisposable {
  subscribe(node: INode, callbackOrListener: IEventListenerOrEventListenerObject): void;
}

/**
 * Describes a target observer for from-view or two-way bindings.
 */
export interface IBindingTargetObserver<
  TObj = any,
  TProp = keyof TObj,
  TValue = unknown>
  extends IBindingTargetAccessor<TObj, TProp, TValue>,
          ISubscribable<MutationKind.instance>,
          ISubscriberCollection<MutationKind.instance> {

  handler: IEventSubscriber;
  bind?(flags: LifecycleFlags): void;
  unbind?(flags: LifecycleFlags): void;
}

export type AccessorOrObserver = IBindingTargetAccessor | IBindingTargetObserver;

/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedItems property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export type IndexMap = number[] & {
  deletedItems?: unknown[];
};

/**
 * Describes a type that specifically tracks changes in an object property, or simply something that can have a getter and/or setter
 */
export interface IPropertyChangeTracker<TObj extends Object, TProp = keyof TObj, TValue = unknown> {
  obj: TObj;
  propertyKey?: TProp;
  currentValue?: TValue;
}

/**
 * Describes a type that specifically tracks changes in a collection (map, set or array)
 */
export interface ICollectionChangeTracker<T extends Collection> extends IChangeTracker {
  collection: T;
  indexMap: IndexMap;
  resetIndexMap(): void;
}

/**
 * Represents a (subscriber) function that can be called by a PropertyChangeNotifier
 */
export type IPropertyChangeHandler<TValue = unknown> = (newValue: TValue, previousValue: TValue, flags: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations on a property
 */
export interface IPropertyChangeNotifier extends IPropertyChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the IPropertyChangeHandler interface
 */
export interface IPropertySubscriber<TValue = unknown> { handleChange(newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void; }

/**
 * Represents a (subscriber) function that can be called by a CollectionChangeNotifier
 */
export type ICollectionChangeHandler = (origin: string, args: IArguments | null, flags?: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations in a collection
 */
export interface ICollectionChangeNotifier extends ICollectionChangeHandler {}

/**
 * Represents a (subscriber) function that can be called by a BatchedCollectionChangeNotifier
 */
export type IBatchedCollectionChangeHandler = (indexMap: number[]) => void;
/**
 * Represents a (observer) function that can notify subscribers of batched mutations in a collection
 */
export interface IBatchedCollectionChangeNotifier extends IBatchedCollectionChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the ICollectionChangeHandler interface
 */
export interface ICollectionSubscriber { handleChange(origin: string, args: IArguments | null, flags: LifecycleFlags): void; }
/**
 * Describes a (subscriber) type that has a function conforming to the IBatchedCollectionChangeNotifier interface
 */
export interface IBatchedCollectionSubscriber { handleBatchedChange(indexMap: number[]): void; }

/**
 * Either a property or collection subscriber
 */
export type Subscriber = ICollectionSubscriber | IPropertySubscriber;
/**
 * Either a batched property or batched collection subscriber
 */
export type BatchedSubscriber = IBatchedCollectionSubscriber;

/**
 * Helper type that translates from mutationKind enum to the correct subscriber interface
 */
export type MutationKindToSubscriber<T> =
  T extends MutationKind.instance ? IPropertySubscriber :
  T extends MutationKind.collection ? ICollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched subscriber interface
 */
export type MutationKindToBatchedSubscriber<T> =
  T extends MutationKind.collection ? IBatchedCollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct notifier interface
 */
export type MutationKindToNotifier<T> =
  T extends MutationKind.instance ? IPropertyChangeNotifier :
  T extends MutationKind.collection ? ICollectionChangeNotifier :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched notifier interface
 */
export type MutationKindToBatchedNotifier<T> =
  T extends MutationKind.collection ? IBatchedCollectionChangeNotifier :
  never;

export interface ISubscribable<T extends MutationKind> {
  subscribe(subscriber: MutationKindToSubscriber<T>): void;
  unsubscribe(subscriber: MutationKindToSubscriber<T>): void;
}

/**
 * A collection of property or collection subscribers
 */
export interface ISubscriberCollection<T extends MutationKind> extends ISubscribable<T> {
  /** @internal */_subscriberFlags?: SubscriberFlags;
  /** @internal */_subscriber0?: MutationKindToSubscriber<T>;
  /** @internal */_subscriber1?: MutationKindToSubscriber<T>;
  /** @internal */_subscriber2?: MutationKindToSubscriber<T>;
  /** @internal */_subscribersRest?: MutationKindToSubscriber<T>[];

  callSubscribers: MutationKindToNotifier<T>;
  hasSubscribers(): boolean;
  hasSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
  removeSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
  addSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
}

/**
 * A collection of batched property or collection subscribers
 */
export interface IBatchedSubscriberCollection<T extends MutationKind> extends IBatchedSubscribable<T> {
  /** @internal */_batchedSubscriberFlags?: SubscriberFlags;
  /** @internal */_batchedSubscriber0?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscriber1?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscriber2?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscribersRest?: MutationKindToBatchedSubscriber<T>[];

  /** @internal */lifecycle?: ILifecycle;
  callBatchedSubscribers: MutationKindToBatchedNotifier<T>;

  /** @internal */flush(flags: LifecycleFlags): void;
  hasBatchedSubscribers(): boolean;
  hasBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
  removeBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
  addBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
}

export interface IBatchedSubscribable<T extends MutationKind> {
  subscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
  unsubscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
}

/**
 * Describes a complete property observer with an accessor, change tracking fields, normal and batched subscribers
 */
export interface IPropertyObserver<TObj extends Object, TProp extends keyof TObj> extends
  IDisposable,
  IAccessor<TObj[TProp]>,
  IPropertyChangeTracker<TObj, TProp>,
  ISubscriberCollection<MutationKind.instance> {
  /** @internal */observing: boolean;
}

/**
 * An any-typed property observer
 */
export type PropertyObserver = IPropertyObserver<any, PropertyKey>;

/**
 * A collection (array, set or map)
 */
export type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;
interface IObservedCollection {
  $observer?: CollectionObserver;
}

/**
 * An array that is being observed for mutations
 */
export interface IObservedArray<T = unknown> extends IObservedCollection, Array<T> { }
/**
 * A set that is being observed for mutations
 */
export interface IObservedSet<T = unknown> extends IObservedCollection, Set<T> { }
/**
 * A map that is being observed for mutations
 */
export interface IObservedMap<K = unknown, V = unknown> extends IObservedCollection, Map<K, V> { }
/**
 * A collection that is being observed for mutations
 */
export type ObservedCollection = IObservedArray | IObservedSet | IObservedMap;

export type LengthPropertyName<T> =
  T extends unknown[] ? 'length' :
  T extends Set<unknown> ? 'size' :
  T extends Map<unknown, unknown> ? 'size' :
  never;

export type CollectionTypeToKind<T> =
  T extends unknown[] ? CollectionKind.array | CollectionKind.indexed :
  T extends Set<unknown> ? CollectionKind.set | CollectionKind.keyed :
  T extends Map<unknown, unknown> ? CollectionKind.map | CollectionKind.keyed :
  never;

export type CollectionKindToType<T> =
  T extends CollectionKind.array ? unknown[] :
  T extends CollectionKind.indexed ? unknown[] :
  T extends CollectionKind.map ? Map<unknown, unknown> :
  T extends CollectionKind.set ? Set<unknown> :
  T extends CollectionKind.keyed ? Set<unknown> | Map<unknown, unknown> :
  never;

export type ObservedCollectionKindToType<T> =
  T extends CollectionKind.array ? IObservedArray :
  T extends CollectionKind.indexed ? IObservedArray :
  T extends CollectionKind.map ? IObservedMap :
  T extends CollectionKind.set ? IObservedSet :
  T extends CollectionKind.keyed ? IObservedSet | IObservedMap :
  never;

// TODO: organize this (for now it's a quick fix for length observer, but we may actually want this
// in every observer for alternative change tracking mechanisms)
export interface IPatch {
  patch(flags: LifecycleFlags): void;
}

/**
 * An observer that tracks collection mutations and notifies subscribers (either directly or in batches)
 */
export interface ICollectionObserver<T extends CollectionKind> extends
  IDisposable,
  ICollectionChangeTracker<CollectionKindToType<T>>,
  ISubscriberCollection<MutationKind.collection>,
  IBatchedSubscriberCollection<MutationKind.collection> {
    collection: ObservedCollectionKindToType<T>;
    lengthPropertyName: LengthPropertyName<CollectionKindToType<T>>;
    collectionKind: T;
    lengthObserver: IBindingTargetObserver & IPatch;
    getLengthObserver(): IBindingTargetObserver;
}
export type CollectionObserver = ICollectionObserver<CollectionKind>;

// TODO: currently unused, still need to fix the observersLookup type
export interface IObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj =
  Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> { }

export type ObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj =
  Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> =
  { [P in TKey]: PropertyObserver; } & { getOrCreate(obj: IBindingContext | IOverrideContext, key: string): PropertyObserver };

export type IObservable = IIndexable & {
  readonly $synthetic?: false;
  $observers?: Record<string, AccessorOrObserver>;
};

export interface IHooks {
  $hooks?: Hooks;
}

export interface IState {
  $state?: State;
  $lifecycle?: ILifecycle;
}

export interface IBindables {
  /**
   * The Bindings, Views, CustomElements, CustomAttributes and other bindable components that belong to this instance.
   */
  $bindableHead?: IBindScope;
  $bindableTail?: IBindScope;
}

export interface IAttachables {

  /**
   * The Views, CustomElements, CustomAttributes and other attachable components that belong to this instance.
   */
  $attachableHead?: IAttach;
  $attachableTail?: IAttach;
}

export interface ILifecycleCreated extends IHooks, IState {
  /**
   * Called at the end of `$hydrate`.
   *
   * The following key properties are now assigned and initialized (see `IRenderable` for more detail):
   * - `this.$bindables`
   * - `this.$attachables`
   * - `this.$scope` (null if this is a custom attribute, or contains the view model if this is a custom element)
   * - `this.$nodes`
   *
   * @description
   * This is the second and last "hydrate" lifecycle hook (after `render`). It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   *
   * This hook is called right before the `$bind` lifecycle starts, making this the last opportunity
   * for any high-level post processing on initialized properties.
   */
  created?(): void;
}

export interface ILifecycleBinding extends IHooks, IState {
  /**
   * Called at the start of `$bind`, before this instance and its children (if any) are bound.
   *
   * - `this.$isBound` is false.
   * - `this.$scope` is initialized.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & LifecycleFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
   * - `flags & LifecycleFlags.fromBind`: this is a normal `$bind` lifecycle
   * - `flags & LifecycleFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
   * - `flags & LifecycleFlags.fromFlush` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the first "create" lifecycle hook of the hooks that can occur multiple times per instance,
   * and the third lifecycle hook (after `render` and `created`) of the very first this.lifecycle.
   */
  binding?(flags: LifecycleFlags): void;
}

export interface ILifecycleBound extends IHooks, IState {
  /** @internal */$nextBound?: ILifecycleBound;

  /**
   * Called at the end of `$bind`, after this instance and its children (if any) are bound.
   *
   * - `$isBound` is true.
   * - `this.$scope` is initialized.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & LifecycleFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
   * - `flags & LifecycleFlags.fromBind`: this is a normal `$bind` lifecycle
   * - `flags & LifecycleFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
   * - `flags & LifecycleFlags.fromFlush` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the second "create" lifecycle hook (after `binding`) of the hooks that can occur multiple times per instance,
   * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first this.lifecycle.
   */
  bound?(flags: LifecycleFlags): void;
}

export interface ILifecycleUnbinding extends IHooks, IState {
  /**
   * Called at the start of `$unbind`, before this instance and its children (if any) are unbound.
   *
   * - `this.$isBound` is true.
   * - `this.$scope` is still available.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & LifecycleFlags.fromBind`: the component is just switching scope
   * - `flags & LifecycleFlags.fromUnbind`: the component is really disposing
   * - `flags & LifecycleFlags.fromStopTask`: the Aurelia app is stopping
   *
   * @description
   * This is the fourth "cleanup" lifecycle hook (after `detaching`, `caching` and `detached`)
   *
   * Last opportunity to perform any source or target updates before the bindings are disconnected.
   *
   */
  unbinding?(flags: LifecycleFlags): void;
}

export interface ILifecycleUnbound extends IHooks, IState {
  /** @internal */$nextUnbound?: ILifecycleUnbound;

  /**
   * Called at the end of `$unbind`, after this instance and its children (if any) are unbound.
   *
   * - `this.$isBound` is false at this point.
   *
   * - `this.$scope` may not be available anymore (unless it's a `@customElement`)
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & LifecycleFlags.fromBind`: the component is just switching scope
   * - `flags & LifecycleFlags.fromUnbind`: the component is really disposing
   * - `flags & LifecycleFlags.fromStopTask`: the Aurelia app is stopping
   *
   * @description
   * This is the fifth (and last) "cleanup" lifecycle hook (after `detaching`, `caching`, `detached`
   * and `unbinding`).
   *
   * The lifecycle either ends here, or starts at `$bind` again.
   */
  unbound?(flags: LifecycleFlags): void;
}

export interface ILifecycleAttaching extends IHooks, IState {
  /**
   * Called at the start of `$attach`, before this instance and its children (if any) are attached.
   *
   * `$isAttached` is false.
   *
   * @param encapsulationSource Ask Rob.
   * @param lifecycle Utility that encapsulates the attach sequence for a hierarchy of attachables and guarantees the correct attach order.
   *
   * @description
   * This is the third "create" lifecycle hook (after `binding` and `bound`) of the hooks that can occur multiple times per instance,
   * and the fifth lifecycle hook (after `render`, `created`, `binding` and `bound`) of the very first lifecycle
   *
   * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
   * the nodes are added to the DOM.
   */
  attaching?(flags: LifecycleFlags, encapsulationSource?: INode): void;
}

export interface ILifecycleAttached extends IHooks, IState {
  /** @internal */$nextAttached?: ILifecycleAttached;

  /**
   * Called at the end of `$attach`, after this instance and its children (if any) are attached.
   *
   * - `$isAttached` is true.
   *
   * @description
   * This is the fourth (and last) "create" lifecycle hook (after `binding`, `bound` and `attaching`) of the hooks that can occur
   * multiple times per instance, and the sixth lifecycle hook (after `render`, `created`, `binding`, `bound` and `attaching`)
   * of the very first lifecycle
   *
   * This instance and its children (if any) can be assumed
   * to be fully initialized, bound, rendered, added to the DOM and ready for use.
   */
  attached?(flags: LifecycleFlags): void;
}

export interface ILifecycleDetaching extends IHooks, IState {
  /**
   * Called at the start of `$detach`, before this instance and its children (if any) are detached.
   *
   * - `$isAttached` is true.
   *
   * @param lifecycle Utility that encapsulates the detach sequence for a hierarchy of attachables and guarantees the correct detach order.
   *
   * @description
   * This is the first "cleanup" lifecycle hook.
   *
   * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
   * the nodes are removed from the DOM.
   */
  detaching?(flags: LifecycleFlags): void;
}

export interface ILifecycleDetached extends IHooks, IState {
  /** @internal */$nextDetached?: ILifecycleDetached;

  /**
   * Called at the end of `$detach`, after this instance and its children (if any) are detached.
   *
   * - `$isAttached` is false.
   *
   * @description
   * This is the third "cleanup" lifecycle hook (after `detaching` and `caching`).
   *
   * The `$nodes` are now removed from the DOM and the `View` (if possible) is returned to cache.
   *
   * If no `$unbind` lifecycle is queued, this is the last opportunity to make state changes before the lifecycle ends.
   */
  detached?(flags: LifecycleFlags): void;
}

export interface ILifecycleCaching extends IHooks, IState {
  /**
   * Called during `$unmount` (which happens during `$detach`), specifically after the
   * `$nodes` are removed from the DOM, but before the view is actually added to the cache.
   *
   * @description
   * This is the second "cleanup" lifecycle hook.
   *
   * This lifecycle is invoked if and only if the `ViewFactory` that created the `View` allows the view to be cached.
   *
   * Usually this hook is not invoked unless you explicitly set the cache size to to something greater than zero
   * on the resource description.
   */
  caching?(flags: LifecycleFlags): void;
}

/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface ILifecycleHooks extends
  ILifecycleCreated,
  ILifecycleBinding,
  ILifecycleBound,
  ILifecycleUnbinding,
  ILifecycleUnbound,
  ILifecycleAttaching,
  ILifecycleAttached,
  ILifecycleDetaching,
  ILifecycleDetached,
  ILifecycleCaching { }

export interface ILifecycleCache {
  $cache(flags: LifecycleFlags): void;
}

export interface ICachable extends ILifecycleCache { }

export interface ILifecycleAttach {
  $attach(flags: LifecycleFlags, encapsulationSource?: INode): void;
}

export interface ILifecycleDetach {
  $detach(flags: LifecycleFlags): void;
}

export interface IAttach extends ILifecycleAttach, ILifecycleDetach, ICachable {
  /** @internal */$nextAttach: IAttach;
  /** @internal */$prevAttach: IAttach;
}

export interface ILifecycleMount {
  /** @internal */$nextMount?: ILifecycleMount;

  /**
   * Add the `$nodes` of this instance to the Host or RenderLocation that this instance is holding.
   */
  $mount(flags: LifecycleFlags): void;
}

export interface ILifecycleUnmount {
  /** @internal */$nextUnmount?: ILifecycleUnmount;

  /**
   * Remove the `$nodes` of this instance from the Host or RenderLocation that this instance is holding, optionally returning them to a cache.
   * @returns
   * - `true` if the instance has been returned to the cache.
   * - `false` if the cache (typically ViewFactory) did not allow the instance to be cached.
   * - `undefined` (void) if the instance does not support caching. Functionally equivalent to `false`
   */
  $unmount(flags: LifecycleFlags): boolean | void;
}
export interface IMountable extends ILifecycleMount, ILifecycleUnmount { }

export interface ILifecycleUnbind {
  $state?: State;
  $unbind(flags: LifecycleFlags): void;
}

export interface ILifecycleUnbindAfterDetach extends ILifecycleUnbind {
  $nextUnbindAfterDetach?: ILifecycleUnbindAfterDetach;
}

export interface ILifecycleBind {
  $state?: State;
  $bind(flags: LifecycleFlags, scope?: IScope): void;
}

export interface ILifecycleBindScope {
  $state?: State;
  $bind(flags: LifecycleFlags, scope: IScope): void;
}

export interface IBind extends ILifecycleBind, ILifecycleUnbind {
  /** @internal */$nextBind: IBindScope;
  /** @internal */$prevBind: IBindScope;
}

export interface IBindScope extends Omit<IBind, '$bind'>, ILifecycleBindScope { }

export interface ILifecycleTask<T = unknown> {
  readonly done: boolean;
  canCancel(): boolean;
  cancel(): void;
  wait(): Promise<T>;
}

/*
 * Note: the lifecycle object ensures that certain callbacks are executed in a particular order that may
 * deviate from the order in which the component tree is walked.
 * The component tree is always walked in a top-down recursive fashion, for example:
 * {
 *   path: "1",
 *   children: [
 *     { path: "1.1", children: [
 *       { path: "1.1.1" },
 *       { path: "1.1.2" }
 *     ]},
 *     { path: "1.2", children: [
 *       { path: "1.2.1" },
 *       { path: "1.2.2" }
 *     ]}
 *   ]
 * }
 * The call chain would be: 1 -> 1.1 -> 1.1.1 -> 1.1.2 -> 1.2 -> 1.2.1 -> 1.2.2
 *
 * During mounting, for example, we want to mount the root component *last* (so that the DOM doesn't need to be updated
 * for each mount operation), and we want to invoke the detached callbacks in the same order that the components were mounted.
 * But all mounts need to happen before any of the detach callbacks are invoked, so we store the components in a LinkedList
 * whose execution is deferred until all the normal $attach/$detach calls have occurred.
 * In the example of attach, the call chains would look like this:
 * $attach: 1 -> 1.1 -> 1.1.1 -> 1.1.2 -> 1.2 -> 1.2.1 -> 1.2.2
 * $mount: 1.1.1 -> 1.1.2 -> 1.1 -> 1.2.1 -> 1.2.2 -> 1.2 -> 1
 * attached: 1.1.1 -> 1.1.2 -> 1.1 -> 1.2.1 -> 1.2.2 -> 1.2 -> 1
 *
 * Instead of (without the lifecycles):
 * $attach: 1, $mount: 1, detached: 1 -> $attach: 1.1, $mount: 1.1, detached: 1.1 -> etc..
 *
 * Furthermore, the lifecycle object tracks the call depth so that it will automatically run a list of operations
 * when the top-most component finishes execution, and components themselves don't need to worry about where in the
 * tree they reside.
 */

export interface IFlushLifecycle {
  processFlushQueue(flags: LifecycleFlags): void;

  /**
   * Queue a flush() callback to be executed either on the next promise tick or on the next
   * bind lifecycle (if during startTask) or on the next attach lifecycle.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   *
   * This queue is primarily used by DOM target observers and collection observers.
   */
  enqueueFlush(requestor: IChangeTracker): Promise<void>;
}

export interface IBindLifecycle extends IFlushLifecycle {
  /**
   * Open up / expand a bind batch for enqueueing `bound` callbacks.
   *
   * When the top-most caller calls `endBind`, the `bound` callbacks will be invoked.
   *
   * Each `beginBind` *must* be matched by an `endBind`.
   */
  beginBind(): void;

  /**
   * Add a `bound` callback to the queue, to be invoked when the current bind batch
   * is ended via `endBind` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueBound(requestor: ILifecycleBound): void;

  /**
   * Add a `connect` callback to the queue, to be invoked *after* mounting and *before*
   * `detached` callbacks.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueConnect(requestor: IConnectableBinding): void;

  /**
   * Close / shrink a bind batch for invoking queued `bound` callbacks.
   * @param flags The flags that will be passed into the `bound` callbacks.
   *
   * Flags during bind are primarily for optimization purposes, and to control whether
   * changes are batched or propagated synchronously.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endBind(flags: LifecycleFlags): ILifecycleTask;

  /**
   * Open up / expand an unbind batch for enqueueing `unbound` callbacks.
   *
   * When the top-most caller calls `endUnbind`, the `unbound` callbacks will be invoked.
   *
   * Each `beginUnbind` *must* be matched by an `endUnbind`.
   */
  beginUnbind(): void;

  /**
   * Add an `unbound` callback to the queue, to be invoked when the current unbind batch
   * is ended via `endUnbind` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueUnbound(requestor: ILifecycleUnbound): void;

  /**
   * Close / shrink an unbind batch for invoking queued `unbound` callbacks.
   * @param flags The flags that will be passed into the `unbound` callbacks.
   *
   * Flags during unbind are primarily for optimization purposes, and to control whether
   * changes are batched or propagated synchronously.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endUnbind(flags: LifecycleFlags): ILifecycleTask;
}

export interface IAttachLifecycle extends IFlushLifecycle {
  /**
   * Open up / expand an attach batch for enqueueing `$mount` and `attached` callbacks.
   *
   * When the top-most caller calls `endAttach`, the `$mount` and `attached` callbacks
   * will be invoked (in that order).
   *
   * Each `beginAttach` *must* be matched by an `endAttach`.
   */
  beginAttach(): void;

  /**
   * Add a `$mount` callback to the queue, to be invoked when the current attach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueMount(requestor: ILifecycleMount): void;

  /**
   * Add an `attached` callback to the queue, to be invoked when the current attach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueAttached(requestor: ILifecycleAttached): void;

  /**
   * Close / shrink an attach batch for invoking queued `$mount` and `attached` callbacks.
   * @param flags The flags that will be passed into the `$mount` and `attached` callbacks.
   *
   * Flags during attach are primarily for optimization purposes.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endAttach(flags: LifecycleFlags): ILifecycleTask;

  /**
   * Open up / expand a detach batch for enqueueing `$unmount` and `detached` callbacks.
   *
   * When the top-most caller calls `endAttach`, the `$unmount` and `detached` callbacks
   * will be invoked (in that order).
   *
   * Each `beginAttach` *must* be matched by an `endAttach`.
   */
  beginDetach(): void;

  /**
   * Add a `$unmount` callback to the queue, to be invoked when the current detach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueUnmount(requestor: ILifecycleUnmount): void;

  /**
   * Add a `detached` callback to the queue, to be invoked when the current detach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueDetached(requestor: ILifecycleDetached): void;

  /**
   * Add an `$unbind` callback to the queue, to be invoked when the current detach batch
   * is ended via `endAttach` by the top-most caller. The callback is invoked after all the
   * `$unmount` and `detached` callbacks are processed.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueUnbindAfterDetach(requestor: ILifecycleUnbind): void;

  /**
   * Close / shrink a detach batch for invoking queued `$unmount` and `detached` callbacks.
   * @param flags The flags that will be passed into the `$unmount` and `detached` callbacks.
   *
   * Flags during detach are primarily for optimization purposes, and to control whether a
   * component should be unmounted or not (the default is to only unmount root nodes).
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`).
   * This default will work, but is generally less efficient.
   */
  endDetach(flags: LifecycleFlags): ILifecycleTask;
}

export interface ILifecycle extends IBindLifecycle, IAttachLifecycle {
  registerTask(task: ILifecycleTask): void;
  finishTask(task: ILifecycleTask): void;
}

export const ILifecycle = DI.createInterface<ILifecycle>().noDefault();
export const IFlushLifecycle = ILifecycle as InterfaceSymbol<IFlushLifecycle>;
export const IBindLifecycle = ILifecycle as InterfaceSymbol<IBindLifecycle>;
export const IAttachLifecycle = ILifecycle as InterfaceSymbol<IAttachLifecycle>;
