import { defaultPlugins, defaultSpecs } from '@jl-fc/all-base-components';
import { NodeViewProps, PluginKey, SpecRegistry } from '@jl-fc/core';
import { FloatingMenu, floatingMenu } from '@jl-fc/react-menu';
import { sticker } from '@jl-fc/react-sticker';
import React from 'react';

import { setupReactEditor, win } from '../../setup/entry-helpers';

export default function setup() {
  win.commands = {
    floatingMenu: floatingMenu.commands,
    sticker: sticker.commands,
  };

  win.floatMenuKey = new PluginKey('floatingmenukey');

  const renderNodeViews = ({ node, ...args }: NodeViewProps) => {
    if (node.type.name === 'sticker') {
      return <sticker.Sticker node={node} {...args} />;
    }
    return undefined;
  };

  const specRegistry = new SpecRegistry([...defaultSpecs(), sticker.spec()]);
  const plugins = () => [
    ...defaultPlugins(),
    sticker.plugins(),
    floatingMenu.plugins({
      key: win.floatMenuKey,
    }),
  ];

  setupReactEditor({
    children: React.createElement(FloatingMenu, {
      menuKey: win.floatMenuKey,
    }),
    specRegistry,
    plugins,
    renderNodeViews,
    id: 'pm-root',
  });
}
