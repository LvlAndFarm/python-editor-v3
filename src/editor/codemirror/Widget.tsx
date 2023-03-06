import { syntaxTree } from "@codemirror/language";
import { Range } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { createPortal } from "react-dom";

class CheckboxWidget extends WidgetType {
  toDOM() {
    const dom = document.getElementById("something");
    if (!dom) {
      return document.createElement("div");
    }
    createPortal(<></>, dom);
    return dom;
  }

  ignoreEvent() {
    return false;
  }
}

function renderWidgets(view: EditorView) {
  const widgets: Range<Decoration>[] = [];
  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (view.state.doc.sliceString(node.from, node.to) === "True") {
          // Just render the widget when we see "True"
          let deco = Decoration.widget({
            widget: new CheckboxWidget(),
            side: 1,
          });
          widgets.push(deco.range(node.to));
        }
      },
    });
  }
  return Decoration.set(widgets);
}

export const testPlugin = () => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = renderWidgets(view);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = renderWidgets(update.view);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
};
