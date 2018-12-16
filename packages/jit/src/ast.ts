import { INode } from '@aurelia/runtime';

export class AttrSyntax {
  public readonly rawName: string;
  public readonly rawValue: string;
  public readonly target: string;
  public readonly command: string | null;

  constructor(rawName: string, rawValue: string, target: string, command: string | null) {
    this.rawName = rawName;
    this.rawValue = rawValue;
    this.target = target;
    this.command = command;
  }
}

// these types are temporary to help with refactoring
export interface IInternalNode extends INode {
  content: IInternalNode;
  childNodes: ArrayLike<IInternalNode>;
  textContent: string;
  attributes: ArrayLike<{ name: string; value: string }>;
  nextSibling: IInternalNode;
  firstChild: IInternalNode;
  parentNode: IInternalNode;
  innerHTML: string;
  firstElementChild: IInternalNode;
  nextElementSibling: IInternalNode;
}

export const enum NodeType {
  Element = 1,
  Attr = 2,
  Text = 3,
  CDATASection = 4,
  EntityReference = 5,
  Entity = 6,
  ProcessingInstruction = 7,
  Comment = 8,
  Document = 9,
  DocumentType = 10,
  DocumentFragment = 11,
  Notation = 12
}
