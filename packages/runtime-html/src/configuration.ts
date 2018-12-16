import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { BasicConfiguration as RuntimeConfiguration, ITemplateFactory } from '@aurelia/runtime';
import { AttrBindingBehavior } from './binding/resources/attr-binding-behavior';
import { HtmlRenderer } from './html-renderer';
import { HTMLTemplateFactory } from './html-template';
import { HtmlObserverLocator } from './observer-locator';

export const GlobalResources: IRegistry[] = [
  AttrBindingBehavior
];

export const BasicConfiguration = {
  register(container: IContainer): void {
    container.register(
      ...GlobalResources,
      RuntimeConfiguration,
      HtmlRenderer,
      HtmlObserverLocator,
      Registration.singleton(ITemplateFactory, HTMLTemplateFactory)
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(BasicConfiguration);
    return container;
  }
};
