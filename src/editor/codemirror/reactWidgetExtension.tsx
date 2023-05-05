import { EVENT_REQUEST_FLASH } from "../../device/simulator";
import { EVENT_SERIAL_DATA } from "../../device/device";
import { syntaxTree } from "@codemirror/language";
import {
  EditorState,
  Extension,
  StateField,
  Transaction,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { SyntaxNode } from "@lezer/common";
import React, { useRef, useState, useCallback } from "react";
import { PortalFactory } from "./CodeMirror";
import { LineInfo } from "./LineInfoContext";
import "./reactWidgetExtension.css";
import { Simulator, SimulatorFunctions } from "../../simulator/MiniSimulator"
import { Box } from "@chakra-ui/react";

/**
 * A mini-simulator as a preview of the selected line of code
 */
interface MethodCallProps {
  lineInfo: LineInfo;
}

// only display the simulator for the following modules
const previewModuleNames = ["display","music","speech","audio"]

const MethodCallComponent: React.FC<MethodCallProps> = ({ lineInfo }) => {
  const {
    callInfo: { name, arguments: args, moduleName, indent },
  } = lineInfo;

  // Try to generate the complete programme
  const code = useCallback(()=>{
    let line = "";
    if (moduleName) line += moduleName + ".";
    line += name+"("+args.join(",")+")";
    let code = "from microbit import *\n";
    // If extra module is specified, try to import it
    if (moduleName) code +=`
try:
  import ${moduleName}
except:pass
`
    code += line
    return code
  }, [moduleName, name, args])

  // The different layouts of the widget
  const buttonSize = "14pt";
  const boardSize = "50pt";
  const [size, setSize] = useState(buttonSize)

  const buttonLayout = () => {
    setDisplay(false);
    setSize(buttonSize);
    setStyleDisplay("inline-block");
  }

  const boardLayout = () => {
    setDisplay(true);
    setSize(boardSize);
    setStyleDisplay("");
  }

  // Indent of the widget
  const indentTransform = `translateX(${9 * indent}pt)`

  // Initial state of the simulator
  const [displayBoard, setDisplay] = useState(false)
  const [display, setStyleDisplay] = useState("inline-block")
  
  // The functions to flash or stop the simulator
  const functions: SimulatorFunctions = {}

  // Event listeners on the simulator
  const eventListeners : Record<string, (data: any) => any> = {}

  // The start timestamp to be modified when flash
  const start = useRef(0);

  eventListeners[EVENT_REQUEST_FLASH] = () => {
    if (functions.flash === undefined) {
      throw new Error("Minisimulator not correctly setup!")
    }
    if (moduleName === "display") boardLayout()
    start.current = Date.now()
    functions.flash(code())
  }

  const stop = () => {
    if (functions.stop === undefined) {
      throw new Error("Minisimulator not correctly setup!")
    }
    if (moduleName === "display") buttonLayout()
    functions.stop()
  }

  // When the execution has finished
  eventListeners[EVENT_SERIAL_DATA] = (data: any) => {

    // Ignore the other outputs
    if (!(data === ">>> ")) return

    // When it shows the board
    const delay = 2000 - (Date.now() - start.current)
    if (moduleName === "display") setTimeout(stop, delay)
    else stop()
  }

  // Place the if argument here because of React restrictions
  if (!(moduleName && previewModuleNames.indexOf(moduleName) > -1)) return <></>

  return <Box display={display} transform={indentTransform} position="relative">
    <Simulator 
      eventListeners={eventListeners}
      size={size}
      displayBoard={displayBoard}
      functions={functions}
    />
  </Box>
};

function node2str(node: SyntaxNode, state: EditorState) {
  return state.sliceDoc(node.from, node.to);
}

function line2LineInfo(
  line: SyntaxNode,
  createPortal: PortalFactory,
  state: EditorState
): LineInfo | undefined {
  if (line.type.name !== "ExpressionStatement") return undefined;

  if (line.firstChild?.type.name !== "CallExpression") return undefined;

  let moduleName, method;
  if (line.firstChild.firstChild?.type.name === "MemberExpression") {
    console.log(line)
    moduleName = node2str(line.firstChild.firstChild?.firstChild!, state);
    method = node2str(line.firstChild.firstChild?.lastChild!, state);
  } else {
    moduleName = undefined;
    method = node2str(line.firstChild.firstChild!, state);
  }

  const argList = line.firstChild.lastChild;
  let arg = argList?.firstChild;
  let args = [];
  const excluded = ["(", ")", ","];
  // The first element is always the open parenthesis, so it's skipped
  arg = arg?.nextSibling;
  while (arg) {
    if (excluded.includes(arg.type.name)) {
      arg = arg?.nextSibling;
      continue;
    }
    args.push(node2str(arg, state));
    arg = arg?.nextSibling;
  }

  console.log(module, method, args.length);

  const createArgumentUpdate = (args: string[]): Transaction => {
    console.log("Updating args", {
      from: line.firstChild!.lastChild?.from!,
      to: line.firstChild!.lastChild?.to!,
      insert: args.join(", "),
    });
    // state.doc.replace(line.firstChild!.lastChild?.from!, line.firstChild!.lastChild?.to!, state.toText(args.join(", ")))
    return state.update({
      changes: {
        from: line.firstChild!.lastChild?.from!,
        to: line.firstChild!.lastChild?.to!,
        insert: `(${args.join(", ")})`,
      },
      // selection: state.selection.replaceRange(
      //   EditorSelection.range(line.firstChild!.lastChild?.from!, line.firstChild!.lastChild?.to!)
      // )
    });
  };

  return {
    statementType: "CALL",
    callInfo: {
      moduleName,
      name: method,
      arguments: args,
      // Counts the difference in chars between the line start and the actual statement
      indent: line.from - state.doc.lineAt(line.from).from,
    },
    createArgumentUpdate,
  };
}

/**
 * This widget will have its contents rendered by the code in CodeMirror.tsx
 * which it communicates with via the portal factory.
 */
class ExampleReactBlockWidget extends WidgetType {
  private portalCleanup: (() => void) | undefined;

  constructor(
    private createPortal: PortalFactory,
    private element: JSX.Element
  ) {
    super();
  }

  toDOM() {
    const dom = document.createElement("div");
    dom.style.display = "inline";
    this.portalCleanup = this.createPortal(dom, this.element);
    return dom;
  }

  destroy(dom: HTMLElement): void {
    if (this.portalCleanup) {
      this.portalCleanup();
    }
  }

  ignoreEvent() {
    return true;
  }
}

/**
 * A toy extension that creates a wiget after the first line.
 */
export const reactWidgetExtension = (
  createPortal: PortalFactory,
  // Publishes information on the current line to React context
  setLineInfo: (lineInfo: LineInfo | undefined) => void
): Extension => {
  const getSyntaxAtCursor = (state: EditorState, cursor: number) => {
    let nodeStack: SyntaxNode[] = [];

    syntaxTree(state).iterate({
      from: cursor,
      to: cursor,
      enter(node) {
        // console.log(node.type.name, node.from, node.to)
        nodeStack.push(node.node);
      },
      // leave(node) {
      //   if (enabled) {
      //     innermost = node
      //   }
      // }
    });

    let currentLine = nodeStack[nodeStack.length - 1];
    // We ignore the outmost node as that is always going to be the global script node
    for (
      let i = nodeStack.length - 1, line = state.doc.lineAt(cursor);
      i > 0;
      i--
    ) {
      if (nodeStack[i].from < line.from && nodeStack[i].to > line.to) {
        break;
      }
      currentLine = nodeStack[i];
    }
    console.log(nodeStack);
    // console.log("finished iterating", nodeStack[nodeStack.length - 1].type.name)
    return {
      currentLine,
      nodeStack,
      innermostNode: nodeStack[nodeStack.length - 1],
    };
  };

  const decorate = (state: EditorState) => {
    // Just put a widget at the start of the document.
    // A more interesting example would look at the cursor (selection) and/or syntax tree.
    const selRange = state.selection.asSingle().ranges[0];
    if (!selRange.empty) {
      return Decoration.set([]);
    }

    // const currentLine = state.doc.lineAt(selRange.to)
    const syntaxAtCursor = getSyntaxAtCursor(state, selRange.to);

    // const endOfFirstLine = state.doc.lineAt(0).to;

    // const lineHighlight = Decoration.mark({
    //   attributes: {
    //     style: "background: red;"
    //   },
    //   class: "current-line"
    // })

    const nodeHighlight = Decoration.mark({
      attributes: {
        style: "background: green;",
      },
      class: "current-line",
    });

    const ranges = [
      // lineHighlight.range(currentLine.from, currentLine.to),
      nodeHighlight.range(
        syntaxAtCursor.innermostNode.from,
        syntaxAtCursor.innermostNode.to
      ),
    ];

    const lineInfo = line2LineInfo(
      syntaxAtCursor.currentLine,
      createPortal,
      state
    );

    // Publish info to React context.
    // We could do just this for the non-widget scenario.
    setLineInfo(lineInfo);
    if (lineInfo) {
      const widgetSpec = {
        block: true,
        widget: new ExampleReactBlockWidget(
          createPortal,
          <MethodCallComponent lineInfo={lineInfo} />
        ),
        side: 1,
      }
      ranges.push(
        Decoration.widget(widgetSpec).range(syntaxAtCursor.currentLine.to)
      );
    }

    return Decoration.set(ranges);
  };

  const stateField = StateField.define<DecorationSet>({
    create(state) {
      return decorate(state);
    },
    update(widgets, transaction) {
      // if (transaction.docChanged) {
      return decorate(transaction.state);
      // }
      // return widgets.map(transaction.changes);
    },
    provide(field) {
      return EditorView.decorations.from(field);
    },
  });
  return [stateField];
};
