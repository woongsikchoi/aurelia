import { IContainer, Registration } from '@aurelia/kernel';
import {
  IDOM,
  ILifecycle,
  IObserverLocator,
  IProjectorLocator,
  IRenderer,
  IRenderingEngine,
  LifecycleFlags as LF
} from '@aurelia/runtime';
import { spy } from 'sinon';
import {
  _,
  eachCartesianJoin,
  eachCartesianJoinFactory,
  jsonStringify,
  stringify,
  verifyEqual
} from '../../../scripts/test-lib';
import { h } from '../../../scripts/test-lib-dom';
import {
  BasicConfiguration,
  NSDOM
} from '../src/index';

export class NSTestContext {
  public readonly dom: NSDOM;

  public get container(): IContainer {
    if (this._container === null) {
      this._container = BasicConfiguration.createContainer();
      Registration.instance(IDOM, this.dom).register(this._container);
      Registration.instance(NSTestContext, this).register(this._container);
    }
    return this._container;
  }
  public get observerLocator(): IObserverLocator {
    if (this._observerLocator === null) {
      this._observerLocator = this.container.get(IObserverLocator);
    }
    return this._observerLocator;
  }
  public get lifecycle(): ILifecycle & { flushCount?: number } {
    if (this._lifecycle === null) {
      this._lifecycle = this.container.get(ILifecycle);
    }
    return this._lifecycle;
  }
  public get renderer(): IRenderer {
    if (this._renderer === null) {
      this._renderer = this.container.get(IRenderer);
    }
    return this._renderer;
  }
  public get projectorLocator(): IProjectorLocator {
    if (this._projectorLocator === null) {
      this._projectorLocator = this.container.get(IProjectorLocator);
    }
    return this._projectorLocator;
  }
  public get renderingEngine(): IRenderingEngine {
    if (this._renderingEngine === null) {
      this._renderingEngine = this.container.get(IRenderingEngine);
    }
    return this._renderingEngine;
  }

  private _container: IContainer;
  private _observerLocator: IObserverLocator;
  private _lifecycle: ILifecycle;
  private _renderer: IRenderer;
  private _projectorLocator: IProjectorLocator;
  private _renderingEngine: IRenderingEngine;

  private constructor() {
    this.dom = new NSDOM();
    this._container = null;
    this._observerLocator = null;
    this._lifecycle = null;
    this._renderer = null;
    this._projectorLocator = null;
    this._renderingEngine = null;
  }

  public static create(): NSTestContext {
    return new NSTestContext();
  }
}

export const TestContext = {
  createnativescriptTestContext(): NSTestContext {
    throw new Error('No NSTestContext function has been provided');
  }
};
export {
  _,
  h,
  stringify,
  jsonStringify,
  verifyEqual,
  eachCartesianJoin,
  eachCartesianJoinFactory
};
