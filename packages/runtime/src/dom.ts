import {
  Constructable,
  IContainer,
  IResolver,
  PLATFORM,
  Reporter,
  Writable
} from '@aurelia/kernel';
import {
  IAddEventListenerOptions,
  IChildNode,
  IComment,
  IDocument,
  IDocumentFragment,
  IElement,
  IEventListenerOptions,
  IEventListenerOrEventListenerObject,
  IEventTarget,
  IHTMLElement,
  IHTMLTemplateElement,
  IMutationCallback,
  IMutationObserver,
  IMutationObserverInit,
  INode,
  INodeSequence,
  IParentNode,
  IRenderLocation,
  IShadowRootInit,
  ISVGElement,
  IText,
  ITraversable,
  NodeType
} from './dom.interfaces';

declare var document: IDocument;
declare var MutationObserver: Constructable & IMutationObserver;
declare var Element: IElement;
declare var HTMLElement: IHTMLElement;
declare var SVGElement: ISVGElement;

export const DOM = {
  createDocumentFragment(markupOrNode?: unknown): IDocumentFragment {
    if (markupOrNode === undefined || markupOrNode === null) {
      return document.createDocumentFragment();
    }
    if (DOM.isNodeInstance(markupOrNode)) {
      if ((markupOrNode as IHTMLTemplateElement).content !== undefined) {
        return (markupOrNode as IHTMLTemplateElement).content;
      }
      const fragment = document.createDocumentFragment();
      fragment.appendChild(markupOrNode);
      return fragment;
    }
    return DOM.createTemplate(markupOrNode).content;
  },
  createTemplate(markup?: unknown): IHTMLTemplateElement {
    if (markup === undefined || markup === null) {
      return document.createElement('template');
    }
    const template = document.createElement('template');
    template.innerHTML = (markup as string | object).toString();
    return template;
  },
  addClass(node: IElement, className: string): void {
    node.classList.add(className);
  },
  addEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject, publisher?: IEventTarget, options?: boolean | IAddEventListenerOptions): void {
    (publisher || document).addEventListener(eventName, subscriber, options);
  },
  appendChild(parent: unknown, child: unknown): void {
    (parent as INode).appendChild(child as INode);
  },
  attachShadow(host: IElement, options: IShadowRootInit): IDocumentFragment {
    return host.attachShadow(options);
  },
  cloneNode<T extends INode = INode>(node: T, deep?: boolean): T {
    return node.cloneNode(deep !== false) as T; // use true unless the caller explicitly passes in false
  },
  isRenderLocation(node: unknown): node is IRenderLocation {
    return (node as INode).textContent === 'au-end';
  },
  convertToRenderLocation(node: unknown): IRenderLocation {
    if (DOM.isRenderLocation(node)) {
      return node; // it's already a RenderLocation (converted by FragmentNodeSequence)
    }
    if ((node as ITraversable).parentNode === null) {
      throw Reporter.error(52);
    }
    const locationEnd = document.createComment('au-end') as IRenderLocation;
    const locationStart = document.createComment('au-start') as IRenderLocation;
    DOM.replaceNode(locationEnd, node);
    DOM.insertBefore(locationStart, locationEnd);
    locationEnd.$start = locationStart;
    locationStart.$nodes = null;
    return locationEnd;
  },
  createComment(text: string): IComment {
    return document.createComment(text);
  },
  createElement: ((name: string): IElement => {
    return document.createElement(name);
  }) as IDocument['createElement'],
  createNodeObserver(target: unknown, callback: IMutationCallback, options: IMutationObserverInit): IMutationObserver {
    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    return observer;
  },
  createTextNode(text: string): IText {
    return document.createTextNode(text);
  },
  getAttribute(node: IElement, name: string): string {
    return node.getAttribute(name);
  },
  hasClass(node: IElement, className: string): boolean {
    return node.classList.contains(className);
  },
  insertBefore(nodeToInsert: unknown, referenceNode: unknown): void {
    (referenceNode as INode).parentNode.insertBefore(nodeToInsert as INode, referenceNode as INode);
  },
  isMarker(node: INode): node is IElement {
    return node.nodeName === 'AU-M';
  },
  isCommentNodeType(node: INode): node is IComment {
    return node.nodeType === NodeType.Comment;
  },
  isDocumentFragmentType(node: INode): node is IDocumentFragment {
    return node.nodeType === NodeType.DocumentFragment;
  },
  isElementNodeType(node: INode): node is IElement {
    return node.nodeType === NodeType.Element;
  },
  isNodeInstance(potentialNode: unknown): potentialNode is INode {
    return (potentialNode as { nodeType?: number }).nodeType > 0;
  },
  isTextNodeType(node: INode): node is IText {
    return node.nodeType === NodeType.Text;
  },
  migrateChildNodes(currentParent: INode, newParent: INode): void {
    while (currentParent.firstChild) {
      DOM.appendChild(newParent, currentParent.firstChild);
    }
  },
  registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(Element, resolver);
    container.registerResolver(HTMLElement, resolver);
    container.registerResolver(SVGElement, resolver);
  },
  remove(node: INode | IChildNode): void {
    if ((node as IChildNode).remove) {
      (node as IChildNode).remove();
    } else {
      node.parentNode.removeChild(node);
    }
  },
  removeAttribute(node: IElement, name: string): void {
    node.removeAttribute(name);
  },
  removeClass(node: IElement, className: string): void {
    node.classList.remove(className);
  },
  removeEventListener(eventName: string, subscriber: IEventListenerOrEventListenerObject, publisher?: IEventTarget, options?: boolean | IEventListenerOptions): void {
    (publisher || document).removeEventListener(eventName, subscriber, options);
  },
  replaceNode(newChild: unknown, oldChild: unknown): void {
    if ((oldChild as INode).parentNode) {
      (oldChild as INode).parentNode.replaceChild(newChild as INode, oldChild as INode);
    }
  },
  setAttribute(node: IElement, name: string, value: string): void {
    node.setAttribute(name, value);
  }
};

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

export interface AuMarker extends INode { }

/** @internal */
export class AuMarker implements INode {
  public get parentNode(): INode & IParentNode {
    return this.nextSibling.parentNode;
  }
  public readonly nextSibling: INode;
  public readonly previousSibling: INode;
  public readonly content?: INode;
  public readonly firstChild: IChildNode;
  public readonly lastChild: IChildNode;
  public readonly childNodes: ArrayLike<IChildNode>;
  public readonly nodeName: 'AU-M';
  public readonly nodeType: NodeType.Element;

  public textContent: string;

  constructor(next: INode) {
    this.nextSibling = next;
    this.textContent = '';
  }
  public remove(): void { /* do nothing */ }
}

(proto => {
  proto.previousSibling = null;
  proto.firstChild = null;
  proto.lastChild = null;
  proto.childNodes = PLATFORM.emptyArray;
  proto.nodeName = 'AU-M';
  proto.nodeType = NodeType.Element;
})(AuMarker.prototype as Writable<AuMarker>);
