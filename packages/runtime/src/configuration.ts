import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { ObserverLocator } from './binding/observer-locator';
import { FromViewBindingBehavior, OneTimeBindingBehavior, ToViewBindingBehavior, TwoWayBindingBehavior } from './binding/resources/binding-mode-behaviors';
import { DebounceBindingBehavior } from './binding/resources/debounce-binding-behavior';
import { SanitizeValueConverter } from './binding/resources/sanitize';
import { SelfBindingBehavior } from './binding/resources/self-binding-behavior';
import { SignalBindingBehavior } from './binding/resources/signals';
import { ThrottleBindingBehavior } from './binding/resources/throttle-binding-behavior';
import { UpdateTriggerBindingBehavior } from './binding/resources/update-trigger-binding-behavior';
import { ILifecycle, IObserverLocator } from './interfaces';
import { Lifecycle } from './lifecycle';
import { BasicRenderer } from './rendering-engine';
import { Compose } from './templating/resources/compose';
import { Else, If } from './templating/resources/if';
import { Repeat } from './templating/resources/repeat';
import { Replaceable } from './templating/resources/replaceable';
import { With } from './templating/resources/with';

export const GlobalResources: IRegistry[] = [
  Compose,
  If,
  Else,
  Repeat,
  Replaceable,
  With,
  SanitizeValueConverter,
  DebounceBindingBehavior,
  OneTimeBindingBehavior,
  ToViewBindingBehavior,
  FromViewBindingBehavior,
  SelfBindingBehavior,
  SignalBindingBehavior,
  ThrottleBindingBehavior,
  TwoWayBindingBehavior,
  UpdateTriggerBindingBehavior
];

export const BasicConfiguration = {
  register(container: IContainer): void {
    container.register(
      BasicRenderer,
      Registration.singleton(IObserverLocator, ObserverLocator),
      Registration.singleton(ILifecycle, Lifecycle),
      ...GlobalResources
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(BasicConfiguration);
    return container;
  }
};
