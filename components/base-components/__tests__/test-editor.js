import { SpecRegistry } from '@jl-fc/core';
import { renderTestEditor } from '@jl-fc/test-helpers';

import { defaultPlugins, defaultSpecs } from './all-base-components';

export const defaultTestEditor = ({ specRegistry, plugins } = {}) => {
  if (!(specRegistry instanceof SpecRegistry)) {
    specRegistry = new SpecRegistry(defaultSpecs(specRegistry));
  }

  if (!plugins || !Array.isArray(plugins)) {
    plugins = defaultPlugins(plugins);
  }

  return renderTestEditor({
    specRegistry,
    plugins,
  });
};
