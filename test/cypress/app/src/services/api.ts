import { HttpClient } from '@aurelia/fetch-client';
import { inject } from '@aurelia/kernel';

@inject(HttpClient)
export class Api {
  constructor(private readonly http: HttpClient) { }

  getUsers() {
    return this.http.fetch('https://jsonplaceholder.typicode.com/users');
  }

  getPosts() {
    return this.http.fetch('https://jsonplaceholder.typicode.com/posts');
  }

  getPhotos() {
    return this.http.fetch('https://jsonplaceholder.typicode.com/photos');
  }
}
