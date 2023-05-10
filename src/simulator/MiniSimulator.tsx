/* 
 * A mini-simulator that behaves slightly different than the original one, with simpler interfaces
 * currently used by the code editor for preview of a single line of code
 * by the Oxford student group 10
*/

import { useEffect, useRef, useCallback } from "react";
import {
  AspectRatio,
  Box,
  LayoutProps
} from "@chakra-ui/react";
import { SimulatorDeviceConnection } from "../device/simulator";
import { useLogging } from "../logging/logging-hooks";
import { MAIN_FILE } from "../fs/fs"

// Custom simulator page for now, will be updated later
const simulatorURL = "https://olivercwy.github.io/microbit-simulator-build/simulator.html"

// The functions for interaction with the mini-simulator
export interface SimulatorFunctions {
    flash?: (code: string) => Promise<void>,
    stop?: () => Promise<void>
}

interface SimulatorProps {
    size: LayoutProps["width"],                             // size of the component
    debug?: boolean,                                        // whether to log debugging information
    displayBoard?: boolean,                                 // whether to display the simulator board
    eventListeners?: Record<string, (data: any) => any>,    // custom event listeners
    functions?: SimulatorFunctions
}

export const Simulator = ({
    size,
    debug,
    displayBoard,
    eventListeners,
    functions
}: SimulatorProps) => {

    const ref = useRef<HTMLIFrameElement>(null);
    const logging = useLogging();
    const simulator = useRef(
        new SimulatorDeviceConnection(logging, () => {
            return ref.current;
        })
    );

    const flash = useCallback((code: string) => {
        if (debug) console.debug(code);
        const iframe = ref.current;
        if (!iframe) {
            throw new Error("Missing simulator iframe.");
        }
        const sim = simulator.current;

        const dataSource = {
          async files() {
            return {
              [MAIN_FILE]: new TextEncoder().encode(code),
            };
          },
          fullFlashData() {
            throw new Error("Unsupported");
          },
          partialFlashData() {
            throw new Error("Unsupported");
          },
        };

        return sim.flash(dataSource, {
          partial: false,
          progress: () => {},
        });
    },[debug])

    if (functions){
        functions.flash = flash
        functions.stop = () => {
            const iframe = ref.current;
            if (!iframe) {
                throw new Error("Missing simulator iframe.");
            }
            const sim = simulator.current;

            return sim.stop()
        }
    }

    useEffect(() => {
        const sim = simulator.current;
        sim.initialize();
        for (const key in eventListeners) {
            const listener = eventListeners[key];
            if (debug) console.log(key, listener)
            listener && sim.addListener(key, listener);
        }
        return () => {
            sim.dispose();
        };
    }, [eventListeners, debug]);

    useEffect(()=>{
        simulator.current.setDisplay(displayBoard === undefined ? true : displayBoard)
    },[displayBoard])

    return (
        <Box width={size} height={size} overflow="hidden">
            <AspectRatio ratio={850 / 650}  position="relative" left="-95.7%" top="-77.3%" width="290%" maxH="300%" >
                <Box
                    ref={ref}
                    as="iframe"
                    src={simulatorURL}
                    frameBorder="no"
                    scrolling="no"
                    allow="autoplay;microphone"
                    sandbox="allow-scripts allow-same-origin"
                />
            </AspectRatio>
        </Box>
    );
}
