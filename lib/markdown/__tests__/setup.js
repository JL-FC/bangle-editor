/**
 * @jest-environment jsdom
 */

/** @jsx psx */
import {
  blockquote,
  bold,
  bulletList,
  code,
  codeBlock,
  doc,
  hardBreak,
  heading,
  horizontalRule,
  image,
  italic,
  link,
  listItem,
  orderedList,
  paragraph,
  strike,
  text,
  underline,
} from '@jl-fc/base-components';
import { SpecRegistry } from '@jl-fc/core';
import { table, tableCell, tableHeader, tableRow } from '@jl-fc/table';

import { markdownParser } from '../src/markdown-parser';
import { markdownSerializer } from '../src/markdown-serializer';

const specRegistry = new SpecRegistry([
  // nodes
  doc.spec(),
  paragraph.spec(),
  text.spec(),

  bulletList.spec(),
  heading.spec(),
  blockquote.spec(),
  codeBlock.spec(),
  hardBreak.spec(),
  listItem.spec(),
  orderedList.spec(),
  image.spec(),
  horizontalRule.spec(),

  // table nodes
  table,
  tableCell,
  tableHeader,
  tableRow,

  // marks
  bold.spec(),
  code.spec(),
  italic.spec(),
  link.spec(),
  strike.spec(),
  underline.spec(),
]);

const serializer = markdownSerializer(specRegistry);
const parser = markdownParser(specRegistry);

export const serialize = async (doc) => {
  let content = doc;
  if (typeof doc === 'function') {
    content = doc(specRegistry.schema);
  }
  return serializer.serialize(content);
};

export const parse = async (md) => {
  return parser.parse(md);
};
