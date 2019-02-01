import { DI, IContainer } from '@aurelia/kernel';
import { RuntimeBasicConfiguration } from '@aurelia/runtime';

/**
 * A DI configuration object containing nativescript-specific registrations:
 * - `BasicConfiguration` from `@aurelia/runtime`
 */
export const BasicConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeBasicConfiguration
      .register(container);
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
