import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { BasicConfiguration as RuntimeConfiguration, IDOM, ITemplateFactory } from '@aurelia/runtime';
import { AttrBindingBehavior } from './binding/resources/attr-binding-behavior';
import { HTMLDOM, IHTMLDOM } from './dom';
import { HtmlRenderer } from './html-renderer';
import { HTMLTemplateFactory } from './html-template';
import { HtmlObserverLocator } from './observer-locator';

export const GlobalResources: IRegistry[] = [
  AttrBindingBehavior
];

export const BasicConfiguration = {
  register(container: IContainer): void {
    let doc: Document;
    if (container.has(Document, true)) {
      doc = container.get(Document);
    } else {
      doc = document;
    }
    const dom = new HTMLDOM(document);
    container.register(
      ...GlobalResources,
      RuntimeConfiguration,
      HtmlRenderer,
      HtmlObserverLocator,
      Registration.singleton(ITemplateFactory, HTMLTemplateFactory),
      Registration.instance(IDOM, dom),
      Registration.instance(IHTMLDOM, dom)
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(BasicConfiguration);
    return container;
  }
};
