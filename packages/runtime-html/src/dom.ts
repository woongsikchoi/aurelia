
import { IContainer, InterfaceSymbol, IResolver, PLATFORM, Primitive, Reporter } from '@aurelia/kernel';
import { AuMarker, IDOM, INode, IRenderLocation } from '@aurelia/runtime';

export interface IHTMLDOM extends IDOM<Node, DocumentFragment, IRenderLocation, HTMLElement, Text, Comment, HTMLTemplateElement, Event> { }

export const IHTMLDOM = IDOM as InterfaceSymbol<IHTMLDOM>;

export class HTMLDOM implements IHTMLDOM {
  private readonly doc: Document;

  constructor(doc: Document) {
    this.doc = doc;
  }

  public addClass(node: HTMLElement, className: string): void {
    node.classList.add(className);
  }
  public addEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | AddEventListenerOptions): void {
    (publisher || this.doc).addEventListener(eventName, subscriber, options);
  }
  public appendChild(parent: Node, child: Node): void {
    parent.appendChild(child);
  }
  public attachShadow(host: HTMLElement, options: ShadowRootInit): DocumentFragment {
    return host.attachShadow(options);
  }
  public cloneNode<T extends Node>(node: T, deep?: boolean): T {
    return node.cloneNode(deep !== false) as T;
  }
  public convertToRenderLocation(node: Node): IRenderLocation<Comment> {
    if (this.isRenderLocation(node)) {
      return node; // it's already a RenderLocation (converted by FragmentNodeSequence)
    }
    if (node.parentNode === null) {
      throw Reporter.error(52);
    }
    const locationEnd = this.doc.createComment('au-end');
    const locationStart = this.doc.createComment('au-start');
    this.replaceNode(locationEnd, node);
    this.insertBefore(locationStart, locationEnd);
    (locationEnd as IRenderLocation).$start = locationStart as IRenderLocation;
    (locationStart as IRenderLocation).$nodes = null;
    return locationEnd as IRenderLocation;
  }
  public createComment(text: string): Comment {
    return this.doc.createComment(text);
  }
  public createDocumentFragment(markupOrNode?: string | Node): DocumentFragment {
    if (markupOrNode === undefined || markupOrNode === null) {
      return this.doc.createDocumentFragment();
    }
    if (this.isNodeInstance(markupOrNode)) {
      if ((markupOrNode as HTMLTemplateElement).content !== undefined) {
        return (markupOrNode as HTMLTemplateElement).content;
      }
      const fragment = this.doc.createDocumentFragment();
      fragment.appendChild(markupOrNode);
      return fragment;
    }
    return this.createTemplate(markupOrNode).content;
  }
  public createElement(name: string): HTMLElement {
    return this.doc.createElement(name);
  }
  public createNodeObserver(target: Node, callback: MutationCallback, options: MutationObserverInit): MutationObserver {
    const observer = new MutationObserver(callback);
    observer.observe(target, options);
    return observer;
  }
  public createTemplate(markup?: Primitive): HTMLTemplateElement {
    if (markup === undefined || markup === null) {
      return this.doc.createElement('template');
    }
    const template = this.doc.createElement('template');
    template.innerHTML = (markup as string | object).toString();
    return template;
  }
  public createTextNode(text: string): Text {
    return this.doc.createTextNode(text);
  }
  public getAttribute(node: HTMLElement, name: string): string {
    return node.getAttribute(name);
  }
  public getChildNodes(node: Node): ReadonlyArray<Node> {
    if (node.childNodes.length) {
      return PLATFORM.toArray(node.childNodes);
    } else {
      return PLATFORM.emptyArray;
    }
  }
  public getParentNode(node: Node): Node {
    return node.parentNode;
  }
  public hasClass(node: HTMLElement, className: string): boolean {
    return node.classList.contains(className);
  }
  public hasParent(node: Node): boolean {
    return node.parentNode !== null;
  }
  public insertBefore(nodeToInsert: Node, referenceNode: Node): void {
    referenceNode.parentNode.insertBefore(nodeToInsert, referenceNode);
  }
  public isCommentNodeType(node: Node): node is Comment {
    return node.nodeType === Node.COMMENT_NODE;
  }
  public isDocumentFragmentType(node: Node): node is DocumentFragment {
    return node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
  }
  public isElementNodeType(node: Node): node is HTMLElement {
    return node.nodeType === Node.ELEMENT_NODE;
  }
  public isMarker(node: unknown): node is HTMLElement {
    return (node as AuMarker<Node>).nodeName === 'AU-M';
  }
  public isNodeInstance(potentialNode: unknown): potentialNode is Node {
    return (potentialNode as Node).nodeType > 0;
  }
  public isRenderLocation(node: unknown): node is Comment & IRenderLocation<Comment> {
    return (node as Comment).textContent === 'au-end';
  }
  public isTextNodeType(node: Node): node is Text {
    return node.nodeType === Node.TEXT_NODE;
  }
  public migrateChildNodes(currentParent: Node, newParent: Node): void {
    while (currentParent.firstChild !== null) {
      newParent.appendChild(currentParent.firstChild);
    }
  }
  public registerElementResolver(container: IContainer, resolver: IResolver): void {
    container.registerResolver(INode, resolver);
    container.registerResolver(Element, resolver);
    container.registerResolver(HTMLElement, resolver);
    container.registerResolver(SVGElement, resolver);
  }
  public remove(node: Node): void {
    if ((node as ChildNode).remove) {
      (node as ChildNode).remove();
    } else {
      node.parentNode.removeChild(node);
    }
  }
  public removeAttribute(node: HTMLElement, name: string): void {
    node.removeAttribute(name);
  }
  public removeClass(node: HTMLElement, className: string): void {
    node.classList.remove(className);
  }
  public removeEventListener(eventName: string, subscriber: EventListenerOrEventListenerObject, publisher?: Node, options?: boolean | EventListenerOptions): void {
    (publisher || this.doc).removeEventListener(eventName, subscriber, options);
  }
  public replaceNode(newChild: Node, oldChild: Node): void {
    if (oldChild.parentNode !== null) {
      oldChild.parentNode.replaceChild(newChild, oldChild);
    }
  }
  public setAttribute(node: HTMLElement, name: string, value: string): void {
    node.setAttribute(name, value);
  }
}
