import { DI, inject } from '@aurelia/kernel';
import { INode, IDOM } from '@aurelia/runtime';
import { IInternalNode } from './ast';

/**
 * Utility that creates a `HTMLTemplateElement` out of string markup or an existing DOM node.
 *
 * It is idempotent in the sense that passing in an existing template element will simply return that template element,
 * so it is always safe to pass in a node without causing unnecessary DOM parsing or template creation.
 */
export interface ITemplateElementFactory {
  /**
   * Create a `HTMLTemplateElement` from a provided html string.
   *
   * @param markup A raw html string that may or may not be wrapped in `<template></template>`
   */
  create(markup: string): IInternalNode;
  /**
   * Create a `HTMLTemplateElement` from a provided DOM node. If the node is already a template, it
   * will be returned as-is (and removed from the DOM).
   *
   * @param node A DOM node that may or may not be wrapped in `<template></template>`
   */
  create(node: INode): IInternalNode;
  /**
   * Create a `HTMLTemplateElement` from a provided DOM node or html string.
   *
   * @param input A DOM node or raw html string that may or may not be wrapped in `<template></template>`
   */
  create(input: unknown): IInternalNode;
  create(input: unknown): IInternalNode;
}

export const ITemplateElementFactory = DI.createInterface<ITemplateElementFactory>()
  .withDefault(x => x.singleton(HTMLTemplateElementFactory));

/**
 * Default implementation for `ITemplateFactory` for use in an HTML based runtime.
 *
 * @internal
 */
@inject(IDOM)
export class HTMLTemplateElementFactory implements ITemplateElementFactory {
  private dom: IDOM;
  private template: IInternalNode;

  constructor(dom: IDOM) {
    this.dom = dom;
    this.template = dom.createTemplate() as IInternalNode;
  }

  public create(markup: string): IInternalNode;
  public create(node: INode): IInternalNode;
  public create(input: unknown): IInternalNode;
  public create(input: string | INode): IInternalNode {
    if (typeof input === 'string') {
      const template = this.template;
      template.innerHTML = input;
      const node = template.content.firstElementChild;
      // if the input is either not wrapped in a template or there is more than one node,
      // return the whole template that wraps it/them (and create a new one for the next input)
      if (node === null || node.nodeName !== 'TEMPLATE' || node.nextElementSibling !== null) {
        this.template = this.dom.createTemplate() as IInternalNode;
        return template;
      }
      // the node to return is both a template and the only node, so return just the node
      // and clean up the template for the next input
      this.dom.remove(node);
      return node;
    }
    if (input.nodeName !== 'TEMPLATE') {
      // if we get one node that is not a template, wrap it in one
      const template = this.dom.createTemplate() as IInternalNode;
      this.dom.appendChild(template.content, input);
      return template;
    }
    // we got a template element, remove it from the DOM if it's present there and don't
    // do any other processing
    if (this.dom.hasParent(input)) {
      this.dom.remove(input);
    }
    return input as IInternalNode;
  }
}
