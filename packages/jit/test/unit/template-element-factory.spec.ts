import {
  DOM
} from '../../../runtime/src/index';
import {
  HTMLTemplateElementFactory
} from '../../src/index';
import { expect } from 'chai';

describe('TemplateFactory', () => {

  it('template-wrapped markup string', () => {
    const sut = new HTMLTemplateElementFactory();
    const markup = `<template><div class="au">foo</div></template>`;

    const expectedHTML = markup;
    const actualHTML = sut.create(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('non-template-wrapped markup string', () => {
    const sut = new HTMLTemplateElementFactory();
    const markup = `<div class="au">foo</div>`;

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.create(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('double template-wrapped markup string', () => {
    const sut = new HTMLTemplateElementFactory();
    const markup = `<template><div class="au">foo</div></template>`.repeat(2);

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.create(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('double non-template-wrapped markup string', () => {
    const sut = new HTMLTemplateElementFactory();
    const markup = `<div class="au">foo</div>`.repeat(2);

    const expectedHTML = `<template>${markup}</template>`;
    const actualHTML = sut.create(markup).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('template node', () => {
    const sut = new HTMLTemplateElementFactory();
    const markup = `<div class="au">foo</div>`;
    const node = DOM.createTemplate(markup);

    const expectedHTML = `<template>${markup}</template>`
    const actualHTML = sut.create(node).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('non-template node', () => {
    const sut = new HTMLTemplateElementFactory();
    const markup = `<div class="au">foo</div>`;
    const node = DOM.createTemplate(markup).content.firstElementChild;

    const expectedHTML = `<template>${markup}</template>`
    const actualHTML = sut.create(node).outerHTML;

    expect(actualHTML).to.equal(expectedHTML);
  });

  it('template node with parent', () => {
    const sut = new HTMLTemplateElementFactory();
    const markup = `<template><div class="au">foo</div></template>`;
    const node = DOM.createTemplate(markup).content.firstElementChild;

    expect(node.parentNode).not.to.equal(null);

    const expectedHTML = markup;
    const actualNode = sut.create(node);

    expect(actualNode.outerHTML).to.equal(expectedHTML);
    expect(actualNode.parentNode).to.equal(null);
  });
});
