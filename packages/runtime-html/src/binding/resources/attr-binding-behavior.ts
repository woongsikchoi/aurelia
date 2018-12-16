import { inject, IRegistry } from '@aurelia/kernel';
import { Binding, bindingBehavior, ILifecycle, IScope, LifecycleFlags } from '@aurelia/runtime';
import { IHTMLDOM } from '../../dom';
import { DataAttributeAccessor } from '../data-attribute-accessor';

@bindingBehavior('attr')
@inject(IHTMLDOM)
export class AttrBindingBehavior {
  public static register: IRegistry['register'];
  private readonly dom: IHTMLDOM;

  constructor(dom: IHTMLDOM) {
    this.dom = dom;
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    binding.targetObserver = new DataAttributeAccessor(this.dom, binding.locator.get(ILifecycle), binding.target as HTMLElement, binding.targetProperty);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    return;
  }
}
