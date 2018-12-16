import { Constructable, inject, PLATFORM, Writable } from '@aurelia/kernel';
import {
  AuMarker,
  CompiledTemplate,
  IDOM,
  INodeSequence,
  INodeSequenceFactory,
  IRenderContext,
  IRenderLocation,
  ITemplate,
  ITemplateFactory,
  NodeSequence,
  TemplateDefinition
} from '@aurelia/runtime';
import { IHTMLDOM } from './dom';

@inject(IHTMLDOM)
export class HTMLTemplateFactory implements ITemplateFactory {
  private readonly dom: IHTMLDOM;

  constructor(dom: IHTMLDOM) {
    this.dom = dom;
  }

  public create(parentRenderContext: IRenderContext, definition: TemplateDefinition): ITemplate {
    return new CompiledTemplate(this.dom, definition, new NodeSequenceFactory(this.dom, definition.template as string | Node), parentRenderContext);
  }
}

export class NodeSequenceFactory implements INodeSequenceFactory {
  private readonly dom: IHTMLDOM;
  private readonly deepClone: boolean;
  private readonly node: Node;
  private readonly Type: Constructable;

  constructor(dom: IHTMLDOM, markupOrNode: string | Node) {
    this.dom = dom;
    const fragment = dom.createDocumentFragment(markupOrNode);
    const childNodes = fragment.childNodes;
    switch (childNodes.length) {
      case 0:
        this.createNodeSequence = () => NodeSequence.empty;
        return;
      case 2:
        const target = childNodes[0];
        if (target.nodeName === 'AU-M' || target.nodeName === '#comment') {
          const text = childNodes[1];
          if (text.nodeType === Node.TEXT_NODE && text.textContent.length === 0) {
            this.deepClone = false;
            this.node = text;
            this.Type = TextNodeSequence;
            return;
          }
        }
      // falls through if not returned
      default:
        this.deepClone = true;
        this.node = fragment;
        this.Type = FragmentNodeSequence;
    }
  }

  public createNodeSequence(): INodeSequence {
    return new this.Type(this.dom, this.dom.cloneNode(this.node, this.deepClone));
  }
}

/**
 * An specialized INodeSequence with optimizations for text (interpolation) bindings
 * The contract of this INodeSequence is:
 * - the previous element is an `au-m` node
 * - text is the actual text node
 */
export class TextNodeSequence implements INodeSequence<Node> {
  public firstChild: Text;
  public lastChild: Text;
  public childNodes: Text[];

  private readonly dom: IHTMLDOM;
  private targets: [Node];

  constructor(dom: IHTMLDOM, text: Text) {
    this.dom = dom;
    this.firstChild = text;
    this.lastChild = text;
    this.childNodes = [text];
    this.targets = ([new AuMarker(text)] as unknown) as [Node];
  }

  public findTargets(): ArrayLike<Node> {
    return this.targets;
  }

  public insertBefore(refNode: Node): void {
    this.dom.insertBefore(this.firstChild, refNode);
  }

  public appendTo(parent: Node): void {
    this.dom.appendChild(parent, this.firstChild);
  }

  public remove(): void {
    this.dom.remove(this.firstChild);
  }
}
// tslint:enable:no-any

// This is the most common form of INodeSequence.
// Every custom element or template controller whose node sequence is based on an HTML template
// has an instance of this under the hood. Anyone who wants to create a node sequence from
// a string of markup would also receive an instance of this.
// CompiledTemplates create instances of FragmentNodeSequence.
/** @internal */
export class FragmentNodeSequence implements INodeSequence<Node> {
  public firstChild: Node;
  public lastChild: Node;
  public childNodes: Node[];

  private readonly dom: IHTMLDOM;
  private end: IRenderLocation<Comment>;
  private fragment: DocumentFragment;
  private start: IRenderLocation<Comment>;
  private targets: ArrayLike<Node>;

  constructor(dom: IHTMLDOM, fragment: DocumentFragment) {
    this.dom = dom;
    this.fragment = fragment;
    // tslint:disable-next-line:no-any
    const targetNodeList = fragment.querySelectorAll('.au');
    let i = 0;
    let ii = targetNodeList.length;
    const targets = this.targets = Array(ii);
    while (i < ii) {
      // eagerly convert all markers to IRenderLocations (otherwise the renderer
      // will do it anyway) and store them in the target list (since the comments
      // can't be queried)
      const target = targetNodeList[i];
      if (target.nodeName === 'AU-M') {
        // note the renderer will still call this method, but it will just return the
        // location if it sees it's already a location
        targets[i] = this.dom.convertToRenderLocation(target);
      } else {
        // also store non-markers for consistent ordering
        targets[i] = target;
      }
      ++i;
    }
    const childNodeList = fragment.childNodes;
    i = 0;
    ii = childNodeList.length;
    const childNodes = this.childNodes = Array(ii);
    while (i < ii) {
      childNodes[i] = childNodeList[i] as Writable<Node>;
      ++i;
    }

    this.firstChild = fragment.firstChild;
    this.lastChild = fragment.lastChild;

    this.start = this.end = null;
  }

  public findTargets(): ArrayLike<Node> {
    return this.targets;
  }

  public insertBefore(refNode: IRenderLocation): void {
    this.dom.insertBefore(this.fragment, refNode as Node);
    // internally we could generally assume that this is an IRenderLocation,
    // but since this is also public API we still need to double check
    // (or horrible things might happen)
    if (this.dom.isRenderLocation(refNode)) {
      this.end = refNode;
      const start = this.start = refNode.$start;
      if (start.$nodes === null) {
        start.$nodes = this;
      } else {
        // if more than one NodeSequence uses the same RenderLocation, it's an child
        // of a repeater (or something similar) and we shouldn't remove all nodes between
        // start - end since that would always remove all items from a repeater, even
        // when only one is removed
        // so we set $nodes to PLATFORM.emptyObject to 1) tell other sequences that it's
        // occupied and 2) prevent start.$nodes === this from ever evaluating to true
        // during remove()
        start.$nodes = PLATFORM.emptyObject;
      }
    }
  }

  public appendTo(parent: Node): void {
    this.dom.appendChild(parent, this.fragment);
    // this can never be a RenderLocation, and if for whatever reason we moved
    // from a RenderLocation to a host, make sure "start" and "end" are null
    this.start = this.end = null;
  }

  public remove(): void {
    const fragment = this.fragment;
    if (this.start !== null && this.start.$nodes === this) {
      // if we're between a valid "start" and "end" (e.g. if/else, containerless, or a
      // repeater with a single item) then simply remove everything in-between (but not
      // the comments themselves as they belong to the parent)
      const end = this.end;
      const start = this.start as Node;
      let next: Node;
      let current = start.nextSibling;
      while (current !== end) {
        next = current.nextSibling;
        this.dom.appendChild(fragment, current);
        current = next;
      }
      this.start.$nodes = null;
      this.start = this.end = null;
    } else {
      // otherwise just remove from first to last child in the regular way
      let current = this.firstChild;

      if (current.parentNode !== fragment) {
        const end = this.lastChild;
        let next: Node;

        while (current !== null) {
          next = current.nextSibling;
          this.dom.appendChild(fragment, current);

          if (current === end) {
            break;
          }

          current = next;
        }
      }
    }
  }
}
