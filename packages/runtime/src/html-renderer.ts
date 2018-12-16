import { IContainer, inject, IRegistry, Tracer } from '@aurelia/kernel';
import { Binding } from './binding/binding';
import { IEventManager } from './binding/event-manager';
import { BindingType, IExpressionParser } from './binding/expression-parser';
import { InterpolationBinding, MultiInterpolationBinding } from './binding/interpolation-binding';
import { Listener } from './binding/listener';
import {
  IListenerBindingInstruction,
  IStylePropertyBindingInstruction,
  ITextBindingInstruction,
  TargetedInstructionType
} from './definitions';
import { DOM } from './dom';
import { IHTMLElement, INode } from './dom.interfaces';
import { BindingMode, IObserverLocator } from './interfaces';
import { IRenderable, IRenderContext } from './lifecycle';
import { addBindable, ensureExpression, IInstructionRenderer, instructionRenderer } from './rendering-engine';

const slice = Array.prototype.slice;

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.textBinding)
/** @internal */
export class TextBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: ITextBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('TextBindingRenderer.render', slice.call(arguments)); }
    const next = target.nextSibling;
    if (DOM.isMarker(target)) {
      DOM.remove(target);
    }
    let bindable: MultiInterpolationBinding | InterpolationBinding;
    const expr = ensureExpression(this.parser, instruction.from, BindingType.Interpolation);
    if (expr.isMulti) {
      bindable = new MultiInterpolationBinding(this.observerLocator, expr, next, 'textContent', BindingMode.toView, context);
    } else {
      bindable = new InterpolationBinding(expr.firstExpression, expr, next, 'textContent', BindingMode.toView, this.observerLocator, context, true);
    }
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IEventManager)
@instructionRenderer(TargetedInstructionType.listenerBinding)
/** @internal */
export class ListenerBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private eventManager: IEventManager;

  constructor(parser: IExpressionParser, eventManager: IEventManager) {
    this.parser = parser;
    this.eventManager = eventManager;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: INode, instruction: IListenerBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('ListenerBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsEventCommand | (instruction.strategy + BindingType.DelegationStrategyDelta));
    const bindable = new Listener(instruction.to, instruction.strategy, expr, target, instruction.preventDefault, this.eventManager, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

@inject(IExpressionParser, IObserverLocator)
@instructionRenderer(TargetedInstructionType.stylePropertyBinding)
/** @internal */
export class StylePropertyBindingRenderer implements IInstructionRenderer {
  private parser: IExpressionParser;
  private observerLocator: IObserverLocator;

  constructor(parser: IExpressionParser, observerLocator: IObserverLocator) {
    this.parser = parser;
    this.observerLocator = observerLocator;
  }

  public render(context: IRenderContext, renderable: IRenderable, target: IHTMLElement, instruction: IStylePropertyBindingInstruction): void {
    if (Tracer.enabled) { Tracer.enter('StylePropertyBindingRenderer.render', slice.call(arguments)); }
    const expr = ensureExpression(this.parser, instruction.from, BindingType.IsPropertyCommand | BindingMode.toView);
    const bindable = new Binding(expr, target.style, instruction.to, BindingMode.toView, this.observerLocator, context);
    addBindable(renderable, bindable);
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export const HtmlRenderer = {
  register(container: IContainer): void {
    container.register(
      TextBindingRenderer as unknown as IRegistry,
      ListenerBindingRenderer as unknown as IRegistry,
      StylePropertyBindingRenderer as unknown as IRegistry
    );
  }
};
