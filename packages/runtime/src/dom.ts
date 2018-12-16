import {
  DI,
  IContainer,
  IResolver,
  PLATFORM,
  Primitive
} from '@aurelia/kernel';

export interface IEventListener<TEvent = unknown> {
  // tslint:disable-next-line:callable-types
  (evt: TEvent): void;
}

export interface IEventListenerObject<TEvent = unknown> {
  handleEvent(evt: TEvent): void;
}
export type IEventListenerOrEventListenerObject<TEvent = unknown> = IEventListener<TEvent> | IEventListenerObject<TEvent>;

export interface IEventListenerOptions {
  capture?: boolean;
}

export interface IShadowRootInit {
  delegatesFocus?: boolean;
  mode: 'open' | 'closed';
}

export interface IAddEventListenerOptions extends IEventListenerOptions {
  once?: boolean;
  passive?: boolean;
}

export interface IMutationObserverInit {
  attributeFilter?: string[];
  attributeOldValue?: boolean;
  attributes?: boolean;
  characterData?: boolean;
  characterDataOldValue?: boolean;
  childList?: boolean;
  subtree?: boolean;
}

export type IMutationRecordType = 'attributes' | 'characterData' | 'childList';

interface IMutationRecord<TNode = unknown> {
  readonly addedNodes: ArrayLike<TNode>;
  readonly attributeName: string | null;
  readonly attributeNamespace: string | null;
  readonly nextSibling: TNode | null;
  readonly oldValue: string | null;
  readonly previousSibling: TNode | null;
  readonly removedNodes: ArrayLike<TNode>;
  readonly target: TNode;
  readonly type: IMutationRecordType;
}

export interface IMutationCallback<TNode = unknown> {
  // tslint:disable-next-line:callable-types
  (mutations: IMutationRecord<TNode>[], observer: IMutationObserver<TNode>): void;
}

export interface IMutationObserver<TNode = unknown> {
  disconnect(): void;
  observe(target: TNode, options?: IMutationObserverInit): void;
}

export interface INode {
  nodeName: string;
  nodeType: number;
}

export interface IManagedEvent<TEvent = unknown, TEventTarget = unknown> {
  readonly target: TEventTarget | null;
  readonly type: string;
  propagationStopped?: boolean;
  // legacy
  path?: TEvent[];
  standardStopPropagation?(): void;
  // old composedPath
  deepPath?(): TEvent[];
  composedPath(): TEventTarget[];
  preventDefault(): void;
  stopImmediatePropagation(): void;
  stopPropagation(): void;
}

export const INode = DI.createInterface<INode>().noDefault();

export const IRenderLocation = DI.createInterface<IRenderLocation>().noDefault();
export interface IRenderLocation<TNode = unknown> extends INode {
  $start?: IRenderLocation;
  $nodes?: INodeSequence<TNode> | Readonly<{}>;
}

export interface INodeLike<TNode> {
  readonly childNodes: ArrayLike<TNode>;
  readonly firstChild: TNode | null;
  readonly lastChild: TNode | null;
}
/**
 * Represents a DocumentFragment
 */
export interface INodeSequence<TNode = unknown> extends INodeLike<TNode> {
  /**
   * The nodes of this sequence.
   */
  childNodes: ReadonlyArray<TNode>;

  /**
   * Find all instruction targets in this sequence.
   */
  findTargets(): ArrayLike<TNode> | ReadonlyArray<TNode>;

  /**
   * Insert this sequence as a sibling before refNode
   */
  insertBefore(refNode: unknown): void;

  /**
   * Append this sequence as a child to parent
   */
  appendTo(parent: TNode): void;

  /**
   * Remove this sequence from its parent.
   */
  remove(): void;
}

export const IDOM = DI.createInterface<IDOM>().noDefault();

export interface IDOM<
  TNode = unknown,
  TFragment extends TNode = TNode,
  TRenderLocation = TNode,
  TElement extends TNode = TNode,
  TText extends TNode = TNode,
  TComment extends TNode = TNode,
  TTemplate extends TNode = TNode,
  TEvent = unknown
> {
  addClass(node: TElement, className: string): void;
  addEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject<TEvent>, publisher?: TNode, options?: boolean | IAddEventListenerOptions): void;
  appendChild(parent: TNode, child: TNode): void;
  attachShadow(host: TElement, options: IShadowRootInit): TFragment;
  cloneNode<T extends TNode>(node: T, deep?: boolean): T;
  convertToRenderLocation(node: TNode): TRenderLocation;
  createComment(text: string): TComment;
  createDocumentFragment(markupOrNode?: string | TNode): TFragment;
  createElement(name: string): TElement;
  createNodeObserver(target: TNode, callback: IMutationCallback<TNode>, options: IMutationObserverInit): IMutationObserver<TNode>;
  createTemplate(markup?: Primitive): TTemplate;
  createTextNode(text: string): TText;
  getAttribute(node: TElement, name: string): string;
  getChildNodes(node: TNode): ReadonlyArray<TNode>;
  getParentNode(node: TNode): TNode;
  hasClass(node: TElement, className: string): boolean;
  hasParent(node: TNode): boolean;
  insertBefore(nodeToInsert: TNode, referenceNode: TNode): void;
  isCommentNodeType(node: TNode): node is TComment;
  isDocumentFragmentType(node: TNode): node is TFragment;
  isElementNodeType(node: TNode): node is TElement;
  isMarker(node: unknown): node is TElement;
  isNodeInstance(potentialNode: unknown): potentialNode is TNode;
  isRenderLocation(node: unknown): node is TRenderLocation;
  isTextNodeType(node: TNode): node is TText;
  migrateChildNodes(currentParent: TNode, newParent: TNode): void;
  registerElementResolver(container: IContainer, resolver: IResolver): void;
  remove(node: TNode): void;
  removeAttribute(node: TElement, name: string): void;
  removeClass(node: TElement, className: string): void;
  removeEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject<TEvent>, publisher?: TNode, options?: boolean | IEventListenerOptions): void;
  replaceNode(newChild: TNode, oldChild: TNode): void;
  setAttribute(node: TElement, name: string, value: string): void;
}

// This is an implementation of INodeSequence that represents "no DOM" to render.
// It's used in various places to avoid null and to encode
// the explicit idea of "no view".
const emptySequence: INodeSequence = {
  firstChild: null,
  lastChild: null,
  childNodes: PLATFORM.emptyArray,
  findTargets(): ReturnType<INodeSequence['findTargets']> { return PLATFORM.emptyArray; },
  insertBefore(refNode: INode): ReturnType<INodeSequence['insertBefore']> { /*do nothing*/ },
  appendTo(parent: INode): ReturnType<INodeSequence['appendTo']> { /*do nothing*/ },
  remove(): ReturnType<INodeSequence['remove']> { /*do nothing*/ }
};

export const NodeSequence = {
  empty: emptySequence
};

export interface INodeSequenceFactory {
  createNodeSequence(): INodeSequence;
}

export class AuMarker<TNode = unknown> {
  public get parentNode(): TNode {
    return (this.nextSibling as { parentNode?: TNode }).parentNode;
  }
  public readonly nextSibling: TNode;
  public readonly nodeName: 'AU-M';

  public textContent: string;

  constructor(next: TNode) {
    this.nextSibling = next;
    this.nodeName = 'AU-M';
    this.textContent = '';
  }
  public remove(): void { /* do nothing */ }
}
