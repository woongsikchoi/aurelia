
import { IContainer, Registration } from '@aurelia/kernel';
import {
  DOM,
  ElementPropertyAccessor,
  EventSubscriber,
  IBindingTargetAccessor,
  IBindingTargetObserver,
  IElement,
  IHTMLElement,
  ILifecycle,
  INode,
  IObserverLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  SetterObserver
} from '@aurelia/runtime';
import { AttributeNSAccessor } from './binding/attribute-ns-accessor';
import { CheckedObserver, IInputElement } from './binding/checked-observer';
import { ClassAttributeAccessor } from './binding/class-attribute-accessor';
import { DataAttributeAccessor } from './binding/data-attribute-accessor';
import { ISelectElement, SelectValueObserver } from './binding/select-value-observer';
import { StyleAttributeAccessor } from './binding/style-attribute-accessor';
import { ValueAttributeObserver } from './binding/value-attribute-observer';

// https://infra.spec.whatwg.org/#namespaces
const htmlNS = 'http://www.w3.org/1999/xhtml';
const mathmlNS = 'http://www.w3.org/1998/Math/MathML';
const svgNS = 'http://www.w3.org/2000/svg';
const xlinkNS = 'http://www.w3.org/1999/xlink';
const xmlNS = 'http://www.w3.org/XML/1998/namespace';
const xmlnsNS = 'http://www.w3.org/2000/xmlns/';

// https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
const nsAttributes = {
  'xlink:actuate': ['actuate', xlinkNS],
  'xlink:arcrole': ['arcrole', xlinkNS],
  'xlink:href': ['href', xlinkNS],
  'xlink:role': ['role', xlinkNS],
  'xlink:show': ['show', xlinkNS],
  'xlink:title': ['title', xlinkNS],
  'xlink:type': ['type', xlinkNS],
  'xml:lang': ['lang', xmlNS],
  'xml:space': ['space', xmlNS],
  'xmlns': ['xmlns', xmlnsNS],
  'xmlns:xlink': ['xlink', xmlnsNS]
};

const inputEvents = ['change', 'input'];
const selectEvents = ['change'];
const contentEvents = ['change', 'input', 'blur', 'keyup', 'paste'];
const scrollEvents = ['scroll'];

const overrideProps = {
  'class': true,
  'style': true,
  'css': true,
  'checked': true,
  'value': true,
  'model': true,
  'xlink:actuate': true,
  'xlink:arcrole': true,
  'xlink:href': true,
  'xlink:role': true,
  'xlink:show': true,
  'xlink:title': true,
  'xlink:type': true,
  'xml:lang': true,
  'xml:space': true,
  'xmlns': true,
  'xmlns:xlink': true
};

export class TargetObserverLocator implements ITargetObserverLocator {
  public getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: INode, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor {
    switch (propertyName) {
      case 'checked':
        return new CheckedObserver(lifecycle, obj as IInputElement, new EventSubscriber(inputEvents), observerLocator);
      case 'value':
        if (obj['tagName'] === 'SELECT') {
          return new SelectValueObserver(lifecycle, obj as ISelectElement, new EventSubscriber(selectEvents), observerLocator);
        }
        return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(inputEvents));
      case 'files':
        return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(inputEvents));
      case 'textContent':
      case 'innerHTML':
        return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(contentEvents));
      case 'scrollTop':
      case 'scrollLeft':
        return new ValueAttributeObserver(lifecycle, obj, propertyName, new EventSubscriber(scrollEvents));
      case 'class':
        return new ClassAttributeAccessor(lifecycle, obj as IElement);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(lifecycle, obj as IHTMLElement);
      case 'model':
        return new SetterObserver(obj, propertyName);
      default:
        if (nsAttributes[propertyName] !== undefined) {
          const nsProps = nsAttributes[propertyName];
          return new AttributeNSAccessor(lifecycle, obj as IHTMLElement, propertyName, nsProps[0], nsProps[1]);
        }
    }
    return null;
  }

  public overridesAccessor(obj: INode, propertyName: string): boolean {
    return overrideProps[propertyName] === true;
  }

  public handles(obj: unknown): boolean {
    return DOM.isNodeInstance(obj);
  }
}

export class TargetAccessorLocator implements ITargetAccessorLocator {
  public getAccessor(lifecycle: ILifecycle, obj: INode, propertyName: string): IBindingTargetAccessor {
    switch (propertyName) {
      case 'textContent':
        // note: this case is just an optimization (textContent is the most often used property)
        return new ElementPropertyAccessor(lifecycle, obj, propertyName);
      case 'class':
        return new ClassAttributeAccessor(lifecycle, obj as IElement);
      case 'style':
      case 'css':
        return new StyleAttributeAccessor(lifecycle, obj as IHTMLElement);
      // TODO: there are (many) more situation where we want to default to DataAttributeAccessor,
      // but for now stick to what vCurrent does
      case 'src':
      case 'href':
      // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
      case 'role':
        return new DataAttributeAccessor(lifecycle, obj as IHTMLElement, propertyName);
      default:
        if (nsAttributes[propertyName] !== undefined) {
          const nsProps = nsAttributes[propertyName];
          return new AttributeNSAccessor(lifecycle, obj as IHTMLElement, propertyName, nsProps[0], nsProps[1]);
        }
        const prefix = propertyName.slice(0, 5);
        // https://html.spec.whatwg.org/multipage/dom.html#wai-aria
        // https://html.spec.whatwg.org/multipage/dom.html#custom-data-attribute
        if (prefix === 'aria-' || prefix === 'data-') {
          return new DataAttributeAccessor(lifecycle, obj as IHTMLElement, propertyName);
        }
        return new ElementPropertyAccessor(lifecycle, obj, propertyName);
    }
  }

  public handles(obj: unknown): boolean {
    return DOM.isNodeInstance(obj);
  }
}

export const HtmlObserverLocator = {
  register(container: IContainer): void {
    container.register(
      Registration.singleton(ITargetAccessorLocator, TargetAccessorLocator),
      Registration.singleton(ITargetObserverLocator, TargetObserverLocator)
    );
  }
};
