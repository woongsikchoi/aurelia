import 'reflect-metadata';
import { init, Element, HTMLElement } from './basichtml';
import { DOM, Aurelia } from './runtime';

const doc = init().document;
DOM.setHtmlReference(doc as any, Element as any, HTMLElement as any, class SVGElement_ {} as any);

import { BasicConfiguration } from './jit';

import { customElement } from './runtime';
import { Widgets } from 'blessed';

@customElement({
  name: 'app',
  template: 
	`<template>
		<form width="50%" height="50%" keys border="line" content="Project Configuration">
			<checkbox checked.two-way="useWebpack" keys content="Use Webpack?" top="1" />
			<checkbox checked.two-way="useTypeScript" keys content="Use TypeScript?" top="2" />
			<box top="3" content="Project Name" />
			<textbox value.two-way="projectName" keys top="4" height="2" style="bg: red; bg.focus: blue" input-on-focus />
		</form>
		<box
			top="0" left="50%" width="50%" height="25%"
			text="\${useWebpack ? 'webpack' : 'requirejs'} + \${useTypeScript ? 'TypeScript' : 'JavaScript'}" />
		<box
			top="25%" left="50%" width="50%" height="25%"
			text="Summary:\nProject Name: \${projectName}\nWebpack: \${useWebpack}\nTypeScript:\${useTypeScript}" />
  </template>`
})
export class App {

	projectName: string = "Aurelia CLI";
	message: string;
	useWebpack: boolean = true;
	useTypeScript: boolean = true;
	summary: string = '';

  constructor() {
	}
}

new Aurelia()
	.register(
		// DebugConfiguration,
		BasicConfiguration,
	)
	.app({
		component: App,
		screen: {
			
		}
	})
	.start();
