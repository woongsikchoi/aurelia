import { Writable } from '@aurelia/kernel';
import { ITemplate, TemplateDefinition, TemplatePartDefinitions } from './definitions';
import { INodeSequenceFactory, NodeSequenceFactory } from './dom';
import { INode } from './dom.interfaces';
import { IRenderable, IRenderContext } from './lifecycle';
import { createRenderContext, ITemplateFactory } from './rendering-engine';

// This is the main implementation of ITemplate.
// It is used to create instances of IView based on a compiled TemplateDefinition.
// TemplateDefinitions are hand-coded today, but will ultimately be the output of the
// TemplateCompiler either through a JIT or AOT process.
// Essentially, CompiledTemplate wraps up the small bit of code that is needed to take a TemplateDefinition
// and create instances of it on demand.
/** @internal */
export class CompiledHTMLTemplate implements ITemplate {
  public readonly factory: INodeSequenceFactory;
  public readonly renderContext: IRenderContext;

  private templateDefinition: TemplateDefinition;

  constructor(parentRenderContext: IRenderContext, templateDefinition: TemplateDefinition) {
    this.templateDefinition = templateDefinition;

    this.factory = NodeSequenceFactory.createFor(this.templateDefinition.template);
    this.renderContext = createRenderContext(parentRenderContext, this.templateDefinition.dependencies);
  }

  public render(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): void {
    const nodes = (renderable as Writable<IRenderable>).$nodes = this.factory.createNodeSequence();
    (renderable as Writable<IRenderable>).$context = this.renderContext;
    this.renderContext.render(renderable, nodes.findTargets(), this.templateDefinition, host, parts);
  }
}

export class HTMLTemplateFactory implements ITemplateFactory {
  public create(parentRenderContext: IRenderContext, definition: TemplateDefinition): ITemplate {
    return new CompiledHTMLTemplate(parentRenderContext, definition);
  }
}
