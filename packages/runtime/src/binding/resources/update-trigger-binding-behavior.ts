import { inject, IRegistry, Reporter } from '@aurelia/kernel';
import { IDOM } from '../../dom';
import { BindingMode, IBindingTargetObserver, IEventSubscriber, IObserverLocator, IScope, LifecycleFlags } from '../../interfaces';
import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { EventSubscriber } from '../event-manager';

export type UpdateTriggerableObserver = IBindingTargetObserver & {
  originalHandler?: IEventSubscriber;
};

export type UpdateTriggerableBinding = Binding & {
  targetObserver: UpdateTriggerableObserver;
};

@bindingBehavior('updateTrigger')
@inject(IObserverLocator, IDOM)
export class UpdateTriggerBindingBehavior {
  public static register: IRegistry['register'];

  private observerLocator: IObserverLocator;
  private dom: IDOM;

  constructor(observerLocator: IObserverLocator, dom: IDOM) {
    this.observerLocator = observerLocator;
    this.dom = dom;
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding, ...events: string[]): void {
    if (events.length === 0) {
      throw Reporter.error(9);
    }

    if (binding.mode !== BindingMode.twoWay && binding.mode !== BindingMode.fromView) {
      throw Reporter.error(10);
    }

    // ensure the binding's target observer has been set.
    const targetObserver = this.observerLocator.getObserver(binding.target, binding.targetProperty) as UpdateTriggerableObserver;
    if (!targetObserver.handler) {
      throw Reporter.error(10);
    }

    binding.targetObserver = targetObserver;

    // stash the original element subscribe function.
    targetObserver.originalHandler = binding.targetObserver.handler;

    // replace the element subscribe function with one that uses the correct events.
    targetObserver.handler = new EventSubscriber(events);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: UpdateTriggerableBinding): void {
    // restore the state of the binding.
    binding.targetObserver.handler.dispose(this.dom);
    binding.targetObserver.handler = binding.targetObserver.originalHandler;
    binding.targetObserver.originalHandler = null;
  }
}
