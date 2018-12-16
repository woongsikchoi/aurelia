import { IIndexable, Primitive } from '@aurelia/kernel';
import { IBindingTargetAccessor, PropertyAccessor } from '@aurelia/runtime';
import * as THREE from 'three';
import { ThreejsDOM } from '../three-dom';
import { I3VNode } from '../three-vnode';

// tslint:disable:no-commented-code

export interface ThreePropertyAccessor extends IBindingTargetAccessor<IIndexable, string, Primitive | IIndexable> {}
export class ThreePropertyAccessor implements PropertyAccessor {
  constructor(public obj: I3VNode, public propertyKey: string) {
    const nativeObject = obj.nativeObject;
    // const type = nativeObject;
    // if (type === 'canvas' || type === 'canvas') {
    //   if (propertyKey === 'width' || propertyKey === 'height') {
    //     this.getValue = this[`getCanvas${propertyKey}`];
    //   }
    // }
    if (ThreejsDOM.isObject3D(nativeObject)) {
      if (propertyKey === 'x' || propertyKey === 'y' || propertyKey === 'z') {
        this.getValue = this[`get${propertyKey.toUpperCase()}`];
        this.setValue = this[`set${propertyKey.toUpperCase()}`];
      }
      if (propertyKey === 'rotation') {
        this.getValue = this.getRotation;
        this.setValue = this.setRotation;
      }
    }
  }

  public getValue(): Primitive | IIndexable {
    return this.obj.nativeObject[this.propertyKey];
  }

  public setValue(value: Primitive | IIndexable): void {
    this.obj.nativeObject[this.propertyKey] = value;
  }

  public getX() {
    return (this.obj.nativeObject as THREE.Object3D).position.x;
  }

  public setX(val: number) {
    return (this.obj.nativeObject as THREE.Object3D).position.x = val;
  }

  public getY() {
    return (this.obj.nativeObject as THREE.Object3D).position.y;
  }

  public setY(val: number) {
    return (this.obj.nativeObject as THREE.Object3D).position.y = val;
  }

  public getZ() {
    return (this.obj.nativeObject as THREE.Object3D).position.z;
  }

  public setZ(val: number) {
    return (this.obj.nativeObject as THREE.Object3D).position.z = val;
  }

  public setRotation(val: string) {
    const mesh = this.obj.nativeObject as THREE.Mesh;
    const vals = val.split(' ').map(Number).filter(n => !isNaN(n));
    // console.log(val, vals);
    switch (vals.length) {
      case 3:
        mesh.rotation.z = vals[2];
      case 2:
        mesh.rotation.y = vals[1];
      case 1:
        mesh.rotation.x = vals[0];
    }
  }

  public getRotation() {
    const mesh = this.obj.nativeObject as THREE.Mesh;
    const rotation = mesh.rotation;
    return `${rotation.x} ${rotation.y} ${rotation.z}`;
  }

  // public setCanvasWidth(value: Primitive | IIndexable): void {
  //   (this.obj.nativeObject as any as fabric.StaticCanvas).setWidth(value as number);
  // }

  // public getCanvasHeight() {
  //   return (this.obj.nativeObject as any as fabric.StaticCanvas).getHeight();
  // }

  // public setCanvasHeight(value: Primitive | IIndexable): void {
  //   (this.obj.nativeObject as any as fabric.StaticCanvas).setHeight(value as number);
  // }
}

export interface ThreeMeshBasicMaterialColorPropertyAccessor extends IBindingTargetAccessor<IIndexable, string, Primitive | IIndexable> {}
export class ThreeMeshBasicMaterialColorPropertyAccessor implements PropertyAccessor {
  constructor(public obj: I3VNode, public propertyKey: string) {
  }

  public setValue(color: Primitive | IIndexable): void {
    const $color = new THREE.Color(color as string);
    const mesh = this.obj.nativeObject as THREE.MeshBasicMaterial;
    mesh.color.r = $color.r;
    mesh.color.b = $color.b;
    mesh.color.g = $color.g;
  }

  public getValue() {
    const mesh = this.obj.nativeObject as THREE.MeshBasicMaterial;
    const color = mesh.color;
    return `${color.r} ${color.g} ${color.b}`;
  }
}
