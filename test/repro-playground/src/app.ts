import './app.scss';

import { customElement, ICustomElement } from '@aurelia/runtime';

import template from './app.html';

export interface App extends ICustomElement<HTMLElement> {}

@customElement({ name: 'app', template })
export class App {
  public game = {
    id: 1,
    players: [
      {
        characters: [
          {
            name: 'Character 1',
            id: 1
          },
          {
            name: 'Character 2',
            id: 2
          }
        ]
      },
      {
        characters: [
          {
            name: 'Character 3',
            id: 3
          },
          {
            name: 'Character 4',
            id: 4
          }
        ]
      }
    ]
  };
}
