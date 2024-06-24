import { bold, doc, hardBreak, paragraph, text } from '@jl-fc/base-components';
import { SpecRegistry } from '@jl-fc/core';
import { MarkType, NodeType } from '@jl-fc/pm';

test('Loads node and marks schema correctly', () => {
  const schema = new SpecRegistry([
    doc.spec(),
    text.spec(),
    hardBreak.spec(),
    paragraph.spec(),
    bold.spec(),
  ]).schema;
  expect(schema.nodes).toMatchObject({
    doc: expect.any(NodeType),
    hardBreak: expect.any(NodeType),
    paragraph: expect.any(NodeType),
    text: expect.any(NodeType),
  });

  expect(schema.topNodeType.name).toBe('doc');

  expect(schema.marks).toEqual({
    bold: expect.any(MarkType),
  });
});

test('Loads default nodes', () => {
  const schema = new SpecRegistry([hardBreak.spec(), bold.spec()]).schema;
  expect(schema.nodes).toMatchObject({
    doc: expect.any(NodeType),
    hardBreak: expect.any(NodeType),
    paragraph: expect.any(NodeType),
    text: expect.any(NodeType),
  });

  expect(schema.topNodeType.name).toBe('doc');

  expect(schema.marks).toEqual({
    bold: expect.any(MarkType),
  });
});
