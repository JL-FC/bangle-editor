import { isMarkActive } from 'bangle-utils/src/prosemirror-utils';
import { toggleMark } from 'prosemirror-commands';
import React from 'react';

import * as dinos from 'dinos';

export const typeaheadItems = [
  {
    icon: (
      <span className={`icon has-text-grey-dark`}>
        <i className={`fas fa-heading`} title={'heading'} />
      </span>
    ),
    title: 'Heading 2',
    getInsertNode: (editorState) => {
      return editorState.schema.nodes.heading.createChecked({ level: 2 });
    },
  },
  {
    icon: (
      <span className={`icon has-text-grey-dark`}>
        <i className={`fas fa-heading`} title={'heading'} />
      </span>
    ),
    title: 'Heading 3',
    getInsertNode: (editorState) => {
      return editorState.schema.nodes.heading.createChecked({ level: 3 });
    },
  },
  ...dinos.typeaheadItems,
];
