import type Token from 'markdown-it/lib/token';
import type { MarkdownSerializerState } from 'prosemirror-markdown';

import type { RawPlugins, RawSpecs } from '@bangle.dev/core';
import {
  chainCommands,
  Command,
  DOMOutputSpec,
  EditorState,
  keymap,
  Node,
  wrappingInputRule,
} from '@bangle.dev/pm';
import { parentHasDirectParentOfType } from '@bangle.dev/pm-commands';
import { createObject, getNodeType } from '@bangle.dev/utils';

import { toggleList } from './list-commands';
import { listIsTight } from './list-is-tight';
import {
  isNodeTodo,
  removeTodo,
  setTodo,
  wrappingInputRuleForTodo,
} from './list-todo';

export const spec = specFactory;
export const plugins = pluginsFactory;
export const commands = {
  toggleBulletList,
  queryIsBulletListActive,
};
export const defaultKeys = {
  toggle: 'Shift-Ctrl-8',
  toggleTodo: 'Shift-Ctrl-7',
};

const name = 'bulletList';

function specFactory(): RawSpecs {
  return {
    type: 'node',
    name,
    schema: {
      content: 'listItem+',
      group: 'block',
      parseDOM: [{ tag: 'ul' }],
      toDOM: (): DOMOutputSpec => ['ul', 0],
      attrs: {
        // a style preference attribute which be used for
        // rendering output.
        // For example markdown serializer can render a new line in
        // between or not.
        tight: {
          default: false,
        },
      },
    },
    markdown: {
      toMarkdown(state: MarkdownSerializerState, node: Node) {
        state.renderList(node, '  ', () => '- ');
      },
      parseMarkdown: {
        bullet_list: {
          block: name,
          getAttrs: (_: any, tokens: Token[], i: number) => {
            return { tight: listIsTight(tokens, i) };
          },
        },
      },
    },
  };
}

function pluginsFactory({
  markdownShortcut = true,
  todoMarkdownShortcut = true,
  keybindings = defaultKeys,
} = {}): RawPlugins {
  return ({ schema }) => {
    const type = getNodeType(schema, name);

    return [
      keybindings &&
        keymap(
          createObject([
            [keybindings.toggle, toggleBulletList()],
            [keybindings.toggleTodo, toggleTodoList()],
          ]),
        ),
      markdownShortcut &&
        wrappingInputRule(/^\s*([-+*])\s$/, type, undefined, (_str, node) => {
          if (node.lastChild && isNodeTodo(node.lastChild, schema)) {
            return false;
          }
          return true;
        }),
      todoMarkdownShortcut &&
        wrappingInputRuleForTodo(/^\s*(\[ \])\s$/, {
          todoChecked: false,
        }),
    ];
  };
}

export function toggleBulletList(): Command {
  const handleBulletLists: Command = (state, dispatch, view) =>
    toggleList(
      getNodeType(state, 'bulletList'),
      getNodeType(state, 'listItem'),
    )(state, dispatch, view);

  return chainCommands(removeTodo, handleBulletLists);
}

export function toggleTodoList(): Command {
  const fallback: Command = (state, dispatch, view) =>
    toggleList(
      getNodeType(state, 'bulletList'),
      getNodeType(state, 'listItem'),
      true,
    )(state, dispatch, view);

  return chainCommands(setTodo, fallback);
}

export function queryIsBulletListActive() {
  return (state: EditorState) => {
    return parentHasDirectParentOfType(getNodeType(state, 'listItem'), [
      getNodeType(state, 'bulletList'),
    ])(state);
  };
}

export function queryIsTodoListActive() {
  return (state: EditorState) => {
    const { schema } = state;

    return (
      parentHasDirectParentOfType(getNodeType(state, 'listItem'), [
        getNodeType(state, 'bulletList'),
      ])(state) && isNodeTodo(state.selection.$from.node(-1), schema)
    );
  };
}
