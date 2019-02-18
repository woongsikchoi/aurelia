import { Api } from './../../services/api';
import { customElement } from '@aurelia/runtime';
import { inject } from '@aurelia/kernel';

import template from './posts.html';

@inject(Api)
@customElement({
  name: 'posts',
  template
})
export class Posts {
  private posts: any[];

  constructor(private readonly api: Api) {

  }

  public async enter() {
    const res = await this.api.getPosts();
    const posts = await res.json();

    this.posts = posts;

    console.log(this.posts);
  }
}
