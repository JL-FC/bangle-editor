import { EditorView, Selection } from '@jl-fc/pm';

export function setSelectionNear(view: EditorView, pos: number) {
  let tr = view.state.tr;
  view.dispatch(tr.setSelection(Selection.near(tr.doc.resolve(pos))));
}
