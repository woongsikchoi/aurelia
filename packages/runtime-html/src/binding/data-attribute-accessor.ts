import { DOM, IBindingTargetAccessor, IElement, ILifecycle, INode, targetObserver } from '@aurelia/runtime';

export interface DataAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {}

@targetObserver()
export class DataAttributeAccessor implements DataAttributeAccessor {
  public currentValue: string;
  public defaultValue: string;
  public lifecycle: ILifecycle;
  public obj: IElement;
  public oldValue: string;
  public propertyKey: string;

  constructor(lifecycle: ILifecycle, obj: IElement, propertyKey: string) {
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.oldValue = this.currentValue = this.getValue();
    this.propertyKey = propertyKey;
  }

  public getValue(): string {
    return DOM.getAttribute(this.obj, this.propertyKey);
  }

  public setValueCore(newValue: string): void {
    if (newValue === null) {
      DOM.removeAttribute(this.obj, this.propertyKey);
    } else {
      DOM.setAttribute(this.obj, this.propertyKey, newValue);
    }
  }
}
