import { all, DI, IContainer, IDisposable, IIndexable, Immutable, ImmutableArray, inject, IRegistry, IResolver, PLATFORM, Reporter, RuntimeCompilationResources, Writable } from '@aurelia/kernel';
import { Observer } from './binding/property-observation';
import { subscriberCollection } from './binding/subscriber-collection';
import { BindableDefinitions, buildTemplateDefinition, customElementBehavior, ITargetedInstruction, ITemplate, ITemplateDefinition, TemplateDefinition, TemplatePartDefinitions } from './definitions';
import { DOM, NodeSequence } from './dom';
import { INode, IRenderLocation } from './dom.interfaces';
import { IAccessor, ILifecycle, IPropertySubscriber, ISubscribable, ISubscriberCollection, LifecycleFlags, MutationKind } from './interfaces';
import { IRenderable, IRenderContext, IViewFactory } from './lifecycle';
import { ExposedContext, IRenderer, ITemplateCompiler, ViewCompileFlags } from './renderer';
import { ICustomAttribute, ICustomAttributeType } from './templating/custom-attribute';
import { ICustomElement, ICustomElementType } from './templating/custom-element';
import { ViewFactory } from './templating/view';

export interface ITemplateFactory {
  create(parentRenderContext: IRenderContext, definition: TemplateDefinition): ITemplate;
}

export const ITemplateFactory = DI.createInterface<ITemplateFactory>().noDefault();

// This is an implementation of ITemplate that always returns a node sequence representing "no DOM" to render.
/** @internal */
export const noViewTemplate: ITemplate = {
  renderContext: null,
  render(renderable: IRenderable): void {
    (renderable as Writable<IRenderable>).$nodes = NodeSequence.empty;
    (renderable as Writable<IRenderable>).$context = null;
  }
};

const defaultCompilerName = 'default';

export interface IRenderingEngine {
  getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
  getViewFactory(source: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;

  applyRuntimeBehavior(Type: ICustomAttributeType, instance: ICustomAttribute): void;
  applyRuntimeBehavior(Type: ICustomElementType, instance: ICustomElement): void;
}

export const IRenderingEngine = DI.createInterface<IRenderingEngine>().withDefault(x => x.singleton(RenderingEngine));

@inject(IContainer, ITemplateFactory, ILifecycle, all(ITemplateCompiler))
/** @internal */
export class RenderingEngine implements IRenderingEngine {
  private behaviorLookup: Map<ICustomElementType | ICustomAttributeType, RuntimeBehavior>;
  private compilers: Record<string, ITemplateCompiler>;
  private container: IContainer;
  private templateFactory: ITemplateFactory;
  private viewFactoryLookup: Map<Immutable<ITemplateDefinition>, IViewFactory>;
  private lifecycle: ILifecycle;
  private templateLookup: Map<TemplateDefinition, ITemplate>;

  constructor(container: IContainer, templateFactory: ITemplateFactory, lifecycle: ILifecycle, templateCompilers: ITemplateCompiler[]) {
    this.behaviorLookup = new Map();
    this.container = container;
    this.templateFactory = templateFactory;
    this.viewFactoryLookup = new Map();
    this.lifecycle = lifecycle;
    this.templateLookup = new Map();

    this.compilers = templateCompilers.reduce(
      (acc, item) => {
        acc[item.name] = item;
        return acc;
      },
      Object.create(null)
    );
  }

  public getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate {
    if (!definition) {
      return null;
    }

    let found = this.templateLookup.get(definition);

    if (!found) {
      found = this.templateFromSource(definition);

      //If the element has a view, support Recursive Components by adding self to own view template container.
      if (found.renderContext !== null && componentType) {
        componentType.register(found.renderContext as ExposedContext);
      }

      this.templateLookup.set(definition, found);
    }

    return found;
  }

  public getViewFactory(definition: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory {
    if (!definition) {
      return null;
    }

    let factory = this.viewFactoryLookup.get(definition);

    if (!factory) {
      const validSource = buildTemplateDefinition(null, definition);
      const template = this.templateFromSource(validSource, parentContext);
      factory = new ViewFactory(validSource.name, template, this.lifecycle);
      factory.setCacheSize(validSource.cache, true);
      this.viewFactoryLookup.set(definition, factory);
    }

    return factory;
  }

  public applyRuntimeBehavior(Type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement): void {
    let found = this.behaviorLookup.get(Type);

    if (!found) {
      found = RuntimeBehavior.create(Type, instance);
      this.behaviorLookup.set(Type, found);
    }

    found.applyTo(instance, this.lifecycle);
  }

  private templateFromSource(definition: TemplateDefinition, parentContext?: IRenderContext): ITemplate {
    parentContext = parentContext || this.container as ExposedContext;

    if (definition && definition.template) {
      if (definition.build.required) {
        const compilerName = definition.build.compiler || defaultCompilerName;
        const compiler = this.compilers[compilerName];

        if (!compiler) {
          throw Reporter.error(20, compilerName);
        }

        definition = compiler.compile(definition as ITemplateDefinition, new RuntimeCompilationResources(parentContext as ExposedContext), ViewCompileFlags.surrogate);
      }

      return this.templateFactory.create(parentContext, definition);
    }

    return noViewTemplate;
  }
}

export function createRenderContext(parentRenderContext: IRenderContext, dependencies: ImmutableArray<IRegistry>): IRenderContext {
  const context = parentRenderContext.createChild() as ExposedContext;
  const renderableProvider = new InstanceProvider();
  const elementProvider = new InstanceProvider();
  const instructionProvider = new InstanceProvider<ITargetedInstruction>();
  const factoryProvider = new ViewFactoryProvider();
  const renderLocationProvider = new InstanceProvider<IRenderLocation>();
  const renderer = context.get(IRenderer);

  DOM.registerElementResolver(context, elementProvider);

  context.registerResolver(IViewFactory, factoryProvider);
  context.registerResolver(IRenderable, renderableProvider);
  context.registerResolver(ITargetedInstruction, instructionProvider);
  context.registerResolver(IRenderLocation, renderLocationProvider);

  if (dependencies) {
    context.register(...dependencies);
  }

  context.render = function(this: IRenderContext, renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void {
    renderer.render(this, renderable, targets, templateDefinition, host, parts);
  };

  context.beginComponentOperation = function(renderable: IRenderable, target: INode, instruction: ITargetedInstruction, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation): IDisposable {
    renderableProvider.prepare(renderable);
    elementProvider.prepare(target);
    instructionProvider.prepare(instruction);

    if (factory) {
      factoryProvider.prepare(factory, parts);
    }

    if (location) {
      renderLocationProvider.prepare(location);
    }

    return context;
  };

  context.dispose = function(): void {
    factoryProvider.dispose();
    renderableProvider.dispose();
    instructionProvider.dispose();
    elementProvider.dispose();
    renderLocationProvider.dispose();
  };

  return context;
}

/** @internal */
export class InstanceProvider<T> implements IResolver {
  private instance: T | null;

  constructor() {
    this.instance = null;
  }

  public prepare(instance: T): void {
    this.instance = instance;
  }

  public resolve(handler: IContainer, requestor: IContainer): T | null {
    if (this.instance === undefined) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    return this.instance;
  }

  public dispose(): void {
    this.instance = null;
  }
}

/** @internal */
export class ViewFactoryProvider implements IResolver {
  private factory: IViewFactory | null;
  private replacements: TemplatePartDefinitions;

  public prepare(factory: IViewFactory, parts: TemplatePartDefinitions): void {
    this.factory = factory;
    this.replacements = parts || PLATFORM.emptyObject;
  }

  public resolve(handler: IContainer, requestor: ExposedContext): IViewFactory {
    const factory = this.factory;
    if (factory === undefined || factory === null) { // unmet precondition: call prepare
      throw Reporter.error(50); // TODO: organize error codes
    }
    if (!factory.name || !factory.name.length) { // unmet invariant: factory must have a name
      throw Reporter.error(51); // TODO: organize error codes
    }
    const found = this.replacements[factory.name];
    if (found) {
      const renderingEngine = handler.get(IRenderingEngine);
      return renderingEngine.getViewFactory(found, requestor);
    }

    return factory;
  }

  public dispose(): void {
    this.factory = null;
    this.replacements = PLATFORM.emptyObject;
  }
}

/** @internal */
export class RuntimeBehavior {
  public bindables: BindableDefinitions;

  private constructor() {}

  public static create(Component: ICustomElementType | ICustomAttributeType, instance: ICustomAttribute | ICustomElement): RuntimeBehavior {
    const behavior = new RuntimeBehavior();

    behavior.bindables = Component.description.bindables;

    return behavior;
  }

  public applyTo(instance: ICustomAttribute | ICustomElement, lifecycle: ILifecycle): void {
    instance.$lifecycle = lifecycle;
    if ('$projector' in instance) {
      this.applyToElement(lifecycle, instance);
    } else {
      this.applyToCore(instance);
    }
  }

  private applyToElement(lifecycle: ILifecycle, instance: ICustomElement): void {
    const observers = this.applyToCore(instance);

    observers.$children = new ChildrenObserver(lifecycle, instance);

    Reflect.defineProperty(instance, '$children', {
      enumerable: false,
      get: function(): unknown {
        return this['$observers'].$children.getValue();
      }
    });
  }

  private applyToCore(instance: ICustomAttribute | ICustomElement): IIndexable {
    const observers = {};
    const bindables = this.bindables;
    const observableNames = Object.getOwnPropertyNames(bindables);

    for (let i = 0, ii = observableNames.length; i < ii; ++i) {
      const name = observableNames[i];

      observers[name] = new Observer(
        instance,
        name,
        bindables[name].callback
      );

      createGetterSetter(instance, name);
    }

    Reflect.defineProperty(instance, '$observers', {
      enumerable: false,
      value: observers
    });

    return observers;
  }
}

function createGetterSetter(instance: ICustomAttribute | ICustomElement, name: string): void {
  Reflect.defineProperty(instance, name, {
    enumerable: true,
    get: function(): unknown { return this['$observers'][name].getValue(); },
    set: function(value: unknown): void { this['$observers'][name].setValue(value, LifecycleFlags.updateTargetInstance); }
  });
}

export interface IChildrenObserver extends
  IAccessor,
  ISubscribable<MutationKind.instance>,
  ISubscriberCollection<MutationKind.instance> { }

/** @internal */
@subscriberCollection(MutationKind.instance)
export class ChildrenObserver implements Partial<IChildrenObserver> {
  public hasChanges: boolean;

  private children: ICustomElement[];
  private customElement: ICustomElement & { $childrenChanged?(): void };
  private lifecycle: ILifecycle;
  private observing: boolean;

  constructor(lifecycle: ILifecycle, customElement: ICustomElement & { $childrenChanged?(): void }) {
    this.hasChanges = false;

    this.children = null;
    this.customElement = customElement;
    this.lifecycle = lifecycle;
    this.observing = false;
  }

  public getValue(): ICustomElement[] {
    if (!this.observing) {
      this.observing = true;
      this.customElement.$projector.subscribeToChildrenChange(() => { this.onChildrenChanged(); });
      this.children = findElements(this.customElement.$projector.children);
    }

    return this.children;
  }

  public setValue(newValue: unknown): void { /* do nothing */ }

  public flush(this: ChildrenObserver & IChildrenObserver, flags: LifecycleFlags): void {
    this.callSubscribers(this.children, undefined, flags | LifecycleFlags.updateTargetInstance);
    this.hasChanges = false;
  }

  public subscribe(this: ChildrenObserver & IChildrenObserver, subscriber: IPropertySubscriber): void {
    this.addSubscriber(subscriber);
  }

  public unsubscribe(this: ChildrenObserver & IChildrenObserver, subscriber: IPropertySubscriber): void {
    this.removeSubscriber(subscriber);
  }

  private onChildrenChanged(): void {
    this.children = findElements(this.customElement.$projector.children);

    if ('$childrenChanged' in this.customElement) {
      this.customElement.$childrenChanged();
    }

    this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
    this.hasChanges = true;
  }
}

/** @internal */
export function findElements(nodes: ArrayLike<INode>): ICustomElement[] {
  const components: ICustomElement[] = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const current = nodes[i];
    const component = customElementBehavior(current);

    if (component !== null) {
      components.push(component);
    }
  }

  return components;
}
