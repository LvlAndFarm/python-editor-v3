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

class TestWidget extends WidgetType {
  constructor(private domNode: React.RefObject<HTMLDivElement>) {
    super();
  }

  toDOM() {
    if (this.domNode.current) {
      createPortal(<></>, this.domNode.current);
      return this.domNode.current;
    }
    return document.createElement("div");
  }

  ignoreEvent() {
    return false;
  }
}

function renderWidgets(
  view: EditorView,
  domNode: React.RefObject<HTMLDivElement>
) {
  const widgets: Range<Decoration>[] = [];
  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (view.state.doc.sliceString(node.from, node.to) === "True") {
          // Just render the widget when we see "True"
          let deco = Decoration.widget({
            widget: new TestWidget(domNode),
            side: 1,
          });
          widgets.push(deco.range(node.to));
        }
      },
    });
  }
  return Decoration.set(widgets);
}

export const testPlugin = (domNode: React.RefObject<HTMLDivElement>) => {
  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;

      constructor(view: EditorView) {
        this.decorations = renderWidgets(view, domNode);
      }

      update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged)
          this.decorations = renderWidgets(update.view, domNode);
      }
    },
    {
      decorations: (v) => v.decorations,
    }
  );
};
