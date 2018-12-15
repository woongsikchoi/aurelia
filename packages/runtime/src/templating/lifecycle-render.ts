import { PLATFORM, Reporter, Tracer, Writable } from '@aurelia/kernel';
import { Scope } from '../binding/binding-context';
import { IElementHydrationOptions, ITemplate, TemplateDefinition } from '../definitions';
import { DOM } from '../dom';
import { IElement, INode, INodeSequence, IRenderLocation, ITraversable } from '../dom.interfaces';
import { Hooks } from '../interfaces';
import { IRenderingEngine } from '../rendering-engine';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';

const slice = Array.prototype.slice;

export interface ICustomElementHost extends IRenderLocation {
  $customElement?: ICustomElement;
}

export interface IElementProjector {
  readonly host: ICustomElementHost;
  readonly children: ArrayLike<ICustomElementHost>;

  provideEncapsulationSource(parentEncapsulationSource: unknown): INode;
  project(nodes: INodeSequence): void;
  take(nodes: INodeSequence): void;

  subscribeToChildrenChange(callback: () => void): void;
}

export interface IElementTemplateProvider {
  getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType): ITemplate;
}

export interface ILifecycleRender {
  /**
   * Only applies to `@customElement`. This hook is not invoked for `@customAttribute`s
   *
   * Called during `$hydrate`, after `this.$scope` and `this.$projector` are set.
   *
   * If this hook is implemented, it will be used instead of `renderingEngine.getElementTemplate`.
   * This allows you to completely override the default rendering behavior.
   *
   * It is the responsibility of the implementer to:
   * - Populate `this.$bindables` with any Bindings, child Views, custom elements and custom attributes
   * - Populate `this.$attachables` with any child Views, custom elements and custom attributes
   * - Populate `this.$nodes` with the nodes that need to be appended to the host
   * - Populate `this.$context` with the RenderContext / Container scoped to this instance
   *
   * @param host The DOM node that declares this custom element
   * @param parts Replaceable parts, if any
   *
   * @returns Either an implementation of `IElementTemplateProvider`, or void
   *
   * @description
   * This is the first "hydrate" lifecycle hook. It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   */
  render?(host: INode, parts: Record<string, TemplateDefinition>): IElementTemplateProvider | void;
}

/** @internal */
export function $hydrateAttribute(this: Writable<ICustomAttribute>, renderingEngine: IRenderingEngine): void {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.$hydrateAttribute`, slice.call(arguments)); }
  const Type = this.constructor as ICustomAttributeType;

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$hooks & Hooks.hasCreated) {
    this.created();
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $hydrateElement(this: Writable<ICustomElement>, renderingEngine: IRenderingEngine, host: INode, options: IElementHydrationOptions = PLATFORM.emptyObject): void {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.$hydrateElement`, slice.call(arguments)); }
  const Type = this.constructor as ICustomElementType;
  const description = Type.description;

  this.$scope = Scope.create(this, null);
  this.$host = host;
  this.$projector = determineProjector(this, host, description);

  renderingEngine.applyRuntimeBehavior(Type, this);

  if (this.$hooks & Hooks.hasRender) {
    const result = this.render(host, options.parts);

    if (result && 'getElementTemplate' in result) {
      const template = result.getElementTemplate(renderingEngine, Type);
      template.render(this, host, options.parts);
    }
  } else {
    const template = renderingEngine.getElementTemplate(description, Type);
    template.render(this, host, options.parts);
  }

  if (this.$hooks & Hooks.hasCreated) {
    this.created();
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export const defaultShadowOptions = {
  mode: 'open' as 'open' | 'closed'
};

function determineProjector(
  $customElement: ICustomElement,
  host: ICustomElementHost,
  definition: TemplateDefinition
): IElementProjector {
  if (definition.shadowOptions || definition.hasSlots) {
    if (definition.containerless) {
      throw Reporter.error(21);
    }

    return new ShadowDOMProjector($customElement, host, definition);
  }

  if (definition.containerless) {
    return new ContainerlessProjector($customElement, host);
  }

  return new HostProjector($customElement, host);
}

const childObserverOptions = { childList: true };

/** @internal */
export class ShadowDOMProjector implements IElementProjector {
  public host: ICustomElementHost;
  public shadowRoot: ICustomElementHost;

  constructor($customElement: ICustomElement, host: ICustomElementHost, definition: TemplateDefinition) {
    this.host = host;

    this.shadowRoot = DOM.attachShadow(this.host as IElement, definition.shadowOptions || defaultShadowOptions);
    this.host.$customElement = $customElement;
    this.shadowRoot.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return this.host.childNodes as ArrayLike<INode>;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    DOM.createNodeObserver(this.host, callback, childObserverOptions);
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return this.shadowRoot as INode;
  }

  public project(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('ShadowDOMProjector.project', slice.call(arguments)); }
    nodes.appendTo(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('ShadowDOMProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

/** @internal */
export class ContainerlessProjector implements IElementProjector {
  public host: ICustomElementHost;

  private childNodes: ArrayLike<ITraversable>;

  constructor($customElement: ICustomElement, host: ICustomElementHost) {
    if (host.childNodes.length) {
      this.childNodes = PLATFORM.toArray(host.childNodes);
    } else {
      this.childNodes = PLATFORM.emptyArray;
    }

    this.host = DOM.convertToRenderLocation(host);
    this.host.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return this.childNodes as ArrayLike<INode>;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    if (!parentEncapsulationSource) {
      throw Reporter.error(22);
    }

    return parentEncapsulationSource;
  }

  public project(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('ContainerlessProjector.project', slice.call(arguments)); }
    nodes.insertBefore(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('ContainerlessProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

/** @internal */
export class HostProjector implements IElementProjector {
  public host: ICustomElementHost;

  constructor($customElement: ICustomElement, host: ICustomElementHost) {
    this.host = host;

    this.host.$customElement = $customElement;
  }

  get children(): ArrayLike<INode> {
    return PLATFORM.emptyArray;
  }

  public subscribeToChildrenChange(callback: () => void): void {
    // Do nothing since this scenario will never have children.
  }

  public provideEncapsulationSource(parentEncapsulationSource: INode): INode {
    return parentEncapsulationSource || (this.host as INode);
  }

  public project(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('HostProjector.project', slice.call(arguments)); }
    nodes.appendTo(this.host);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public take(nodes: INodeSequence): void {
    if (Tracer.enabled) { Tracer.enter('HostProjector.take', slice.call(arguments)); }
    nodes.remove();
    if (Tracer.enabled) { Tracer.leave(); }
  }
}
