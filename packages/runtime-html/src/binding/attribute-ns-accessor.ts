import { IBindingTargetAccessor, IHTMLElement, ILifecycle, targetObserver } from '@aurelia/runtime';

export interface AttributeNSAccessor extends IBindingTargetAccessor<IHTMLElement, string, string> {}

@targetObserver('')
export class AttributeNSAccessor implements AttributeNSAccessor {
  public attributeName: string;
  public currentValue: string;
  public defaultValue: string;
  public lifecycle: ILifecycle;
  public obj: IHTMLElement;
  public oldValue: string;
  public propertyKey: string;
  public namespace: string;

  constructor(lifecycle: ILifecycle, obj: IHTMLElement, propertyKey: string, attributeName: string, namespace: string) {
    this.attributeName = attributeName;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.oldValue = this.currentValue = this.getValue();
    this.propertyKey = propertyKey;
    this.namespace = namespace;
  }

  public getValue(): string {
    return this.obj.getAttributeNS(this.namespace, this.attributeName);
  }

  public setValueCore(newValue: string): void {
    this.obj.setAttributeNS(this.namespace, this.attributeName, newValue);
  }
}
