import {
  DI,
  IContainer,
  IRegistry,
  Registration
} from '@aurelia/kernel';
import {
  IDOM,
  ILifecycle,
  IObserverLocator,
  IProjectorLocator,
  IRenderer,
  IRenderingEngine,
  ITemplateCompiler
} from '@aurelia/runtime';
import { NSDOM } from '@aurelia/runtime-nativescript';


export class NSTestContext {
  public readonly dom: NSDOM;
  private readonly config: IRegistry;

  public get container(): IContainer {
    if (this._container === null) {
      this._container = DI.createContainer(this.config);
      Registration.instance(IDOM, this.dom).register(this._container);
      Registration.instance(NSTestContext, this).register(this._container);
    }
    return this._container;
  }
  public get templateCompiler(): ITemplateCompiler {
    if (this._templateCompiler === null) {
      this._templateCompiler = this.container.get(ITemplateCompiler);
    }
    return this._templateCompiler;
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
  private _templateCompiler: ITemplateCompiler;
  private _observerLocator: IObserverLocator;
  private _lifecycle: ILifecycle;
  private _renderer: IRenderer;
  private _projectorLocator: IProjectorLocator;
  private _renderingEngine: IRenderingEngine;

  private constructor(config: IRegistry) {
    this.config = config;
    this.dom = new NSDOM();
    this._container = null;
    this._templateCompiler = null;
    this._observerLocator = null;
    this._lifecycle = null;
    this._renderer = null;
    this._projectorLocator = null;
    this._renderingEngine = null;
  }

  public static create(config: IRegistry): NSTestContext {
    return new NSTestContext(config);
  }
}

export const TestContext = {
  createNSTestContext(): NSTestContext {
    throw new Error('No NSTestContext function has been provided');
  }
};
