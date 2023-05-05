# Team 10 Group Design Practical

### Overview
This project includes improvements to the user experience of the editor by adding an interactive sidebar that allows you to visually control the current highlighted function's arguments. This is useful to see what kinds of arguments the function accepts, but also to discover optional arguments that it may take.

## Code-sharing
This feature is enabled by a CodeMirror extension we developed, which is in `src/editor/codemirror/codeSharingExtension.tsx`. On every state change, it parses the current line and updates `LineInfoContext` with information about the current line.
