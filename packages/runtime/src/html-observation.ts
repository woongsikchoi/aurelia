
import { IContainer, Registration } from '@aurelia/kernel';
import { CheckedObserver, IInputElement, ISelectElement, SelectValueObserver, ValueAttributeObserver } from './binding/element-observation';
import { EventSubscriber } from './binding/event-manager';
import { ITargetAccessorLocator, ITargetObserverLocator } from './binding/observer-locator';
import { SetterObserver } from './binding/property-observation';
import { AttributeNSAccessor, ClassAttributeAccessor, DataAttributeAccessor, ElementPropertyAccessor, StyleAttributeAccessor } from './binding/target-accessors';
import { IElement, IHTMLElement, INode } from './dom.interfaces';
import { IBindingTargetAccessor, IBindingTargetObserver, ILifecycle, IObserverLocator } from './interfaces';

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

export class TargetObserverLocator {
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
}

export class TargetAccessorLocator {
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
}

export const HtmlObservation = {
  register(container: IContainer): void {
    container.register(
      Registration.singleton(ITargetAccessorLocator, TargetAccessorLocator),
      Registration.singleton(ITargetObserverLocator, TargetObserverLocator)
    );
  }
};
