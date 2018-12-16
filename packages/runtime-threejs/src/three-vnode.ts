import * as Threejs from 'three';
import { VNode } from './node';

export type ThreeObject = Threejs.Renderer | Threejs.Object3D | Threejs.Geometry | Threejs.Vector | Threejs.Material;

export interface I3VNode extends VNode<ThreeObject> {

}
