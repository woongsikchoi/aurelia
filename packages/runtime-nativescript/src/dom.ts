import {
  IContainer,
  IResolver,
  Registration,
  Reporter
} from '@aurelia/kernel';
import {
  DOM,
  IDOM,
  INode,
  IRenderLocation
} from '@aurelia/runtime';

export class NSDOM implements IDOM {
  constructor() {
    if (DOM.isInitialized) {
      Reporter.write(1001); // TODO: create reporters code // DOM already initialized (just info)
      DOM.destroy();
    }
    DOM.initialize(this);
  }

  public static register(container: IContainer): IResolver<NSDOM> {
    return Registration.alias(IDOM, this).register(container);
  }

  public createCustomEvent(eventType: string, options?: unknown): unknown {
    throw new Error('Not implemented.');
  }
  public dispatchEvent(evt: unknown): void {
    throw new Error('Not implemented.');
  }

  public addEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    throw new Error('Not implemented.');
  }

  public appendChild(parent: unknown, child: unknown): void {
    throw new Error('Not implemented.');
  }

  public cloneNode<T>(node: T, deep?: boolean): T {
    throw new Error('Not implemented.');
  }

  public convertToRenderLocation(node: unknown): IRenderLocation {
    throw new Error('Not implemented.');
  }

  public createDocumentFragment(markupOrNode?: string | unknown): INode {
    throw new Error('Not implemented.');
  }

  public createElement(name: string): INode {
    throw new Error('Not implemented.');
  }

  public createNodeObserver(node: unknown, cb: unknown, init: unknown): unknown {
    throw new Error('Not implemented.');
  }

  public createTemplate(markup?: unknown): INode {
    throw new Error('Not implemented.');
  }

  public createTextNode(text: string): INode {
    throw new Error('Not implemented.');
  }

  public insertBefore(nodeToInsert: unknown, referenceNode: unknown): void {
    throw new Error('Not implemented.');
  }

  public isMarker(node: unknown): node is INode {
    throw new Error('Not implemented.');
  }

  public isNodeInstance(potentialNode: unknown): potentialNode is INode {
    throw new Error('Not implemented.');
  }

  public isRenderLocation(node: unknown): node is IRenderLocation {
    throw new Error('Not implemented.');
  }

  public makeTarget(node: unknown): void {
    throw new Error('Not implemented.');
  }

  public registerElementResolver(container: IContainer, resolver: IResolver): void {
    throw new Error('Not implemented.');
  }

  public remove(node: unknown): void {
    throw new Error('Not implemented.');
  }

  public removeEventListener(eventName: string, subscriber: unknown, publisher?: unknown, options?: unknown): void {
    throw new Error('Not implemented.');
  }

  public setAttribute(node: unknown, name: string, value: unknown): void {
    throw new Error('Not implemented.');
  }
}

const $DOM = DOM as unknown as NSDOM;
export { $DOM as DOM };
