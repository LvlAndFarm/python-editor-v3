import { HStack, Text } from "@chakra-ui/react";
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
import React, { useRef, useState, useEffect, useCallback } from "react";
import { PortalFactory } from "./CodeMirror";
import { LineInfo } from "./LineInfoContext";
import "./reactWidgetExtension.css";
import { Simulator, SimulatorFunctions } from "../../simulator/MiniSimulator"
import {
  AspectRatio,
  Box,
  LayoutProps
} from "@chakra-ui/react";

/**
 * An example react component that we use inside a CodeMirror widget as
 * a proof of concept.
 */
interface MethodCallProps {
  lineInfo: LineInfo;
}

const previewModuleNames = ["display","music"]

const MethodCallComponent: React.FC<MethodCallProps> = ({ lineInfo }) => {
  const {
    callInfo: { name, arguments: args, moduleName, indent },
  } = lineInfo;

  const code = useCallback(()=>{
    let line = "";
    if (moduleName) line += moduleName + ".";
    line += name+"("+args.join(",")+")";
    let code = "from microbit import *\n";
    if (moduleName) code +=`
try:
  import ${moduleName}
except:pass
`
    code += line
    return code
  }, [moduleName, name])

  const lineSize = "14pt";
  const buttonSize = "14pt";
  const boardSize = "50pt";
  const functions: SimulatorFunctions = {}
  const [size, setSize] = useState(buttonSize)
  const indentTransform = `translateX(${9 * indent}pt)`
  const [transform, setTransform] = useState("translateY(25%)")
  const [displayBoard, setDisplay] = useState(false)
  const [display, setStyleDisplay] = useState("inline-block")

  const eventListeners : Record<string, (data: any) => any> = {}

  const buttonLayout = () => {
    setDisplay(false);
    setSize(buttonSize);
    setTransform("translateY(25%)");
    setStyleDisplay("inline-block");
  }

  const boardLayout = () => {
    setDisplay(true);
    setSize(boardSize);
    setTransform("");
    setStyleDisplay("");
  }

  eventListeners[EVENT_REQUEST_FLASH] = () => {
    const flash = functions.flash
    if (flash === undefined) {
      throw new Error("Minisimulator not correctly setup!")
    }
    if (moduleName === "display") boardLayout()
    flash && flash(code())
  }

  const stop = () => {
    const simulatorStop = functions.stop
    if (simulatorStop === undefined) {
      throw new Error("Minisimulator not correctly setup!")
    }
    if (moduleName === "display") buttonLayout()
    simulatorStop()
  }

  eventListeners[EVENT_SERIAL_DATA] = (data: any) => {
    if (!(data === ">>> ")) return
    if (moduleName === "display" && name === "show") setTimeout(stop, 1000)
    else stop()
  }

  // console.log(eventListeners)

  const simulator = <Simulator 
    eventListeners={eventListeners}
    size={size}
    displayBoard={displayBoard}
    functions={functions}
    // debug={true}
  />

  if (!(moduleName && previewModuleNames.indexOf(moduleName) > -1)) return <></>

  //return simulator;
  return <Box display={display} transform={indentTransform + transform} top="25%" position="relative">
    {simulator}
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
