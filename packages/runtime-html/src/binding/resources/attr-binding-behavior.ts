import { IRegistry } from '@aurelia/kernel';
import { Binding, bindingBehavior, IElement, ILifecycle, IScope, LifecycleFlags } from '@aurelia/runtime';
import { DataAttributeAccessor } from '../data-attribute-accessor';

@bindingBehavior('attr')
export class AttrBindingBehavior {
  public static register: IRegistry['register'];

  public bind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    binding.targetObserver = new DataAttributeAccessor(binding.locator.get(ILifecycle), binding.target as IElement, binding.targetProperty);
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void {
    return;
  }
}
