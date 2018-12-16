import { IIndexable, Primitive } from '@aurelia/kernel';
import { IBindingTargetObserver, ILifecycle, IPropertySubscriber, LifecycleFlags, targetObserver } from '@aurelia/runtime';
import { I3VNode } from '../three-vnode';

// tslint:disable:no-commented-code

const handleEventFlags = LifecycleFlags.fromDOMEvent | LifecycleFlags.updateSourceExpression;

export interface ThreePropertyObserver extends
  IBindingTargetObserver<I3VNode, string, Primitive | IIndexable> { }

@targetObserver('')
export class ThreePropertyObserver implements ThreePropertyObserver {
  public currentValue: Primitive | IIndexable;
  public currentFlags: LifecycleFlags;
  public oldValue: Primitive | IIndexable;
  public defaultValue: Primitive | IIndexable;

  public flush: () => void;
  private targetEvent: string;

  constructor(
    public lifecycle: ILifecycle,
    public obj: I3VNode,
    public propertyName: string
  ) {
    this.oldValue = this.currentValue = obj.nativeObject[propertyName];
    this.targetEvent = this.getEventFor(propertyName);
    this.handleEvent = this.handleEvent.bind(this);
  }

  public getValue(): Primitive | IIndexable {
    return this.obj.nativeObject[this.propertyName];
  }

  public setValueCore(newValue: Primitive | IIndexable, flags: LifecycleFlags): void {
    // this.obj.setValue(newValue as any);
    this.obj.nativeObject[this.propertyName] = newValue;
    if (flags & LifecycleFlags.fromBind) {
      return;
    }
    this.callSubscribers(this.currentValue, this.oldValue, flags);
  }

  public handleEvent(): void {
    const oldValue = this.oldValue = this.currentValue;
    const newValue = this.currentValue = this.getValue();
    if (oldValue !== newValue) {
      this.callSubscribers(newValue, oldValue, handleEventFlags);
      this.oldValue = newValue;
    }
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      // this.obj.nativeObject.on(this.targetEvent, this.handleEvent);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      // this.obj.nativeObject.off(this.targetEvent, this.handleEvent);
    }
  }

  private getEventFor(propertyName: string) {
    switch (propertyName) {
      case 'x': case 'y': case 'top': case 'left': return 'moving';
      case 'width': case 'height': return 'scaling';
      default: return 'modified';
    }
  }
}
