import { defaultPlugins } from '@jl-fc/all-base-components';
import { parseFromClipboard, serializeForClipboard } from '@jl-fc/pm';

import { setupReactEditor, win } from '../../setup/entry-helpers';

win.__serializeForClipboard = serializeForClipboard;
win.__parseFromClipboard = parseFromClipboard;

export default function setup() {
  win.commands = {};

  const plugins = () => [...defaultPlugins()];

  setupReactEditor({ id: 'pm-root', plugins });
}
