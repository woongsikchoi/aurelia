
import { IContainer, Registration } from '@aurelia/kernel';
import {
  ElementPropertyAccessor,
  EventSubscriber,
  IBindingTargetAccessor,
  IBindingTargetObserver,
  IElement,
  IHTMLElement,
  ILifecycle,
  INode,
  IObserverLocator,
  ITargetAccessorLocator,
  ITargetObserverLocator,
  SetterObserver
} from '@aurelia/runtime';
import { ThreeMeshBasicMaterialColorPropertyAccessor, ThreePropertyAccessor } from './binding/three-property-accessor';
import { ThreePropertyObserver } from './binding/three-property-observer';
import { VNode } from './node';
import { ThreejsDOM } from './three-dom';
import { ThreeObject } from './three-vnode';

export class TargetObserverLocator implements ITargetObserverLocator {
  public getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: VNode, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor {
    switch (propertyName) {
      case 'x':
      case 'y':
      case 'z':
      case 'rx':
      case 'ry':
      case 'left':
      case 'top':
        return new ThreePropertyObserver(lifecycle, obj, propertyName);
    }
    return null;
  }

  public overridesAccessor(obj: INode, propertyName: string): boolean {
    return false;
  }

  public handles(obj: unknown): boolean {
    return ThreejsDOM.isObject3D(obj as ThreeObject);
  }
}

export class TargetAccessorLocator {
  public getAccessor(lifecycle: ILifecycle, obj: VNode, propertyName: string): IBindingTargetAccessor {
    if (ThreejsDOM.isObject3D(obj.nativeObject)) {
      return new ThreePropertyAccessor(obj, propertyName);
    }
    if (obj.nativeObject.isMesh && propertyName === 'rotation') {
      return new ThreePropertyAccessor(obj, propertyName);
    }
    if (obj.nativeObject.isMeshBasicMaterial && propertyName === 'color') {
      return new ThreeMeshBasicMaterialColorPropertyAccessor(obj, propertyName);
    }
  }

  public handles(obj: unknown): boolean {
    return obj instanceof VNode;
  }
}

export const ThreeObserverLocator = {
  register(container: IContainer): void {
    container.register(
      Registration.singleton(ITargetAccessorLocator, TargetAccessorLocator),
      Registration.singleton(ITargetObserverLocator, TargetObserverLocator)
    );
  }
};
