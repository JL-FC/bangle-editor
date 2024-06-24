import { BaseRawNodeSpec, domSerializationHelpers } from '@jl-fc/core';
import type { MarkdownSerializerState } from '@jl-fc/markdown';
import type { Node } from '@jl-fc/pm';

const name = 'wikiLink';
export const spec = specFactory;

function specFactory(): BaseRawNodeSpec {
  const { toDOM, parseDOM } = domSerializationHelpers(name, {
    tag: 'span',
    parsingPriority: 52,
  });

  return {
    type: 'node',
    name: name,
    schema: {
      attrs: {
        path: {
          default: null,
        },
        title: {
          default: null,
        },
      },
      inline: true,
      group: 'inline',
      selectable: false,
      draggable: true,
      toDOM,
      parseDOM,
    },
    markdown: {
      toMarkdown: (state, node) => {
        state.text('[[', false);
        const { path, title } = node.attrs;
        let content = path;
        if (title && title !== path) {
          content += '|' + title;
        }
        state.text(content, false);
        state.text(']]', false);
      },

      parseMarkdown: {
        wiki_link: {
          block: name,
          getAttrs: (tok) => {
            // @ts-ignore
            if (typeof tok.payload === 'string') {
              // @ts-ignore
              let [path, title] = tok.payload.split('|');
              return { path, title };
            }
            return null;
          },
          noCloseToken: true,
        },
      },
    },
  };
}
