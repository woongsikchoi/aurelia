import { IIndexable } from '@aurelia/kernel';
import { IBindingTargetAccessor, ILifecycle } from '../interfaces';
import { targetObserver } from './target-observer';

export interface ElementPropertyAccessor extends IBindingTargetAccessor<object, string> {}

@targetObserver('')
export class ElementPropertyAccessor implements ElementPropertyAccessor {
  public lifecycle: ILifecycle;
  public obj: object;
  public propertyKey: string;

  constructor(lifecycle: ILifecycle, obj: object, propertyKey: string) {
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.propertyKey = propertyKey;
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValueCore(value: unknown): void {
    this.obj[this.propertyKey] = value;
  }
}

export interface PropertyAccessor extends IBindingTargetAccessor<IIndexable, string> {}

export class PropertyAccessor implements PropertyAccessor {
  public obj: IIndexable;
  public propertyKey: string;

  constructor(obj: IIndexable, propertyKey: string) {
    this.obj = obj;
    this.propertyKey = propertyKey;
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValue(value: unknown): void {
    this.obj[this.propertyKey] = value;
  }
}
