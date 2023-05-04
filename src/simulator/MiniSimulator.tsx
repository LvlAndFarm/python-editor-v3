import { useEffect, useRef, MutableRefObject, useCallback } from "react";
import {
  AspectRatio,
  Box,
  LayoutProps
} from "@chakra-ui/react";
import { SimulatorDeviceConnection, EVENT_STATE_CHANGE, EVENT_REQUEST_FLASH } from "../device/simulator";
import { useLogging } from "../logging/logging-hooks";
import { MAIN_FILE } from "../fs/fs"

const simulatorURL = "https://olivercwy.github.io/microbit-simulator-build/simulator.html"
// const simulatorURL = "http://localhost:8000/simulator.html"

export interface SimulatorFunctions {
    flash?: (code: string) => Promise<void>,
    stop?: () => Promise<void>
}

interface SimulatorProps {
    size: LayoutProps["width"],
    debug?: boolean,
    displayBoard?: boolean,
    eventListeners?: Record<string, (data: any) => any>,
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
        if (debug) console.log(code);
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
    },[displayBoard, simulator.current])

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
