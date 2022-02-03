/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, Flex } from "@chakra-ui/layout";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import {
  SplitView,
  SplitViewDivider,
  SplitViewRemainder,
  SplitViewSized,
} from "../common/SplitView";
import { SizedMode } from "../common/SplitView/SplitView";
import { ConnectionStatus } from "../device/device";
import { useConnectionStatus } from "../device/device-hooks";
import EditorArea from "../editor/EditorArea";
import { MAIN_FILE } from "../fs/fs";
import { useProject } from "../project/project-hooks";
import ProjectActionBar from "../project/ProjectActionBar";
import SerialArea from "../serial/SerialArea";
import SideBar from "./SideBar";
import { useSelection } from "./use-selection";

const sidebarMinimums: [number, number] = [380, 580];
const serialMinimums: [number, number] = [380, 580];

/**
 * The main app layout with resizable panels.
 */
const Workbench = () => {
  const [selection, setSelection] = useSelection();
  const intl = useIntl();
  const { files } = useProject();
  const setSelectedFile = useCallback(
    (file: string) => {
      setSelection({ file, location: { line: undefined } });
    },
    [setSelection]
  );
  useEffect(() => {
    // No file yet or selected file deleted? Default it.
    if (
      (!selection || !files.find((x) => x.name === selection.file)) &&
      files.length > 0
    ) {
      const defaultFile = files.find((x) => x.name === MAIN_FILE) || files[0];
      setSelectedFile(defaultFile.name);
    }
  }, [selection, setSelectedFile, files]);

  const fileVersion = files.find((f) => f.name === selection.file)?.version;

  const connected = useConnectionStatus() === ConnectionStatus.CONNECTED;
  const [serialStateWhenOpen, setSerialStateWhenOpen] =
    useState<SizedMode>("compact");
  const serialSizedMode = connected ? serialStateWhenOpen : "collapsed";
  const [sidebarState, setSidebarState] = useState<SizedMode>("open");
  const initialSize = useMemo((): number => {
    return Math.min(
      700,
      Math.max(sidebarMinimums[0], Math.floor(window.innerWidth * 0.35))
    );
  }, []);
  const [sidebarSize, setSidebarSize] = useState<number>(initialSize);
  const [serialSize, setSerialSize] = useState<number>(serialMinimums[0]);
  return (
    <Flex className="Workbench">
      <SplitView
        direction="row"
        width="100%"
        minimums={sidebarMinimums}
        sizedPaneSize={sidebarSize}
        setSizedPaneSize={setSidebarSize}
        setSidebarState={setSidebarState}
      >
        <SplitViewSized>
          <SideBar
            as="section"
            aria-label={intl.formatMessage({ id: "sidebar" })}
            selectedFile={selection.file}
            onSelectedFileChanged={setSelectedFile}
            flex="1 1 100%"
            sidebarState={sidebarState}
            setSidebarState={setSidebarState}
            setSidebarSize={setSidebarSize}
            minimums={sidebarMinimums}
          />
        </SplitViewSized>
        <SplitViewDivider />
        <SplitViewRemainder>
          <Flex
            as="main"
            flex="1 1 100%"
            flexDirection="column"
            height="100%"
            boxShadow="4px 0px 24px #00000033"
          >
            <SplitView
              direction="column"
              minimums={serialMinimums}
              compactSize={SerialArea.compactSize}
              height="100%"
              mode={serialSizedMode}
              sizedPaneSize={serialSize}
              setSizedPaneSize={setSerialSize}
            >
              <SplitViewRemainder>
                <Box height="100%" as="section">
                  {selection && fileVersion !== undefined && (
                    <EditorArea
                      key={selection.file + "/" + fileVersion}
                      selection={selection}
                      onSelectedFileChanged={setSelectedFile}
                    />
                  )}
                </Box>
              </SplitViewRemainder>
              <SplitViewDivider />
              <SplitViewSized>
                <SerialArea
                  as="section"
                  compact={serialSizedMode === "compact"}
                  onSizeChange={setSerialStateWhenOpen}
                  aria-label={intl.formatMessage({ id: "serial-terminal" })}
                />
              </SplitViewSized>
            </SplitView>
            <ProjectActionBar
              as="section"
              aria-label={intl.formatMessage({ id: "project-actions" })}
              borderTopWidth={2}
              borderColor="gray.200"
            />
          </Flex>
        </SplitViewRemainder>
      </SplitView>
    </Flex>
  );
};

export default Workbench;
