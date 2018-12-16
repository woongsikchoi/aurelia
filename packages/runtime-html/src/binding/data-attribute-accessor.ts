import { IBindingTargetAccessor, ILifecycle, INode, targetObserver } from '@aurelia/runtime';
import { IHTMLDOM } from '../dom';

export interface DataAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {}

@targetObserver()
export class DataAttributeAccessor implements DataAttributeAccessor {
  public readonly dom: IHTMLDOM;
  public currentValue: string;
  public defaultValue: string;
  public lifecycle: ILifecycle;
  public obj: HTMLElement;
  public oldValue: string;
  public propertyKey: string;

  constructor(dom: IHTMLDOM, lifecycle: ILifecycle, obj: HTMLElement, propertyKey: string) {
    this.dom = dom;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.oldValue = this.currentValue = this.getValue();
    this.propertyKey = propertyKey;
  }

  public getValue(): string {
    return this.dom.getAttribute(this.obj, this.propertyKey);
  }

  public setValueCore(newValue: string): void {
    if (newValue === null) {
      this.dom.removeAttribute(this.obj, this.propertyKey);
    } else {
      this.dom.setAttribute(this.obj, this.propertyKey, newValue);
    }
  }
}
