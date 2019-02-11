import { TraceConfiguration, DebugConfiguration } from '@aurelia/debug';
import { Aurelia } from '@aurelia/runtime';
import { BasicConfiguration } from '@aurelia/jit-html-browser';
import { App } from './app';
import { Tracer, DI } from '@aurelia/kernel';

DebugConfiguration.register();
TraceConfiguration.register();
Tracer.enabled = true;
Tracer.enableLiveLogging({
  di: false,
  jit: false,
  rendering: false,
  lifecycle: true,
  binding: true,
  attaching: true,
  mounting: true,
  observation: true
});

const container = DI.createContainer(BasicConfiguration);
const au = window['au'] = new Aurelia(container);
au.app({ host: document.querySelector('app'), component: App });
au.start();

window['app'] = au.root();
