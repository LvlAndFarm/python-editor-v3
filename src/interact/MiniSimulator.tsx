import { useEffect, useRef } from "react";
import {
  AspectRatio,
  Box,
} from "@chakra-ui/react";
import { SimulatorDeviceConnection } from "../device/simulator";
import { useLogging } from "../logging/logging-hooks";
import { MAIN_FILE } from "../fs/fs"

const simulatorURL = "https://python-simulator.usermbit.org/v/0.1/simulator.html"

interface SimulatorProps {
    size: number,
    debug?: boolean,
    flashTrigger?: any,
    onRequestCode?: () => void,
    code: string,
    displayBoard?: boolean,
}

export const Simulator = ({
    size,
    debug,
    code,
    flashTrigger,
    onRequestCode,
    displayBoard
}: SimulatorProps) => {

    const ref = useRef<HTMLIFrameElement>(null);
    const logging = useLogging();
    const simulator = useRef(
        new SimulatorDeviceConnection(logging, () => {
            return ref.current;
        })
    );

    const flash = (code: string) => {
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
    }
    
    useEffect(() => {
        const sim = simulator.current;
        sim.initialize();
        sim.addListener("request_flash", () => {
            onRequestCode && onRequestCode()
            flash(code)
        });
        return () => {
            sim.dispose();
        };
    }, []);

    useEffect(() => {
        flash(code)
    },[code, flashTrigger]);

    useEffect(()=>{
        const sim = simulator.current;
        displayBoard = displayBoard || true
        sim.setDisplay(displayBoard)
    },[displayBoard])

    return (
        <Box width={size} height={size} overflow="hidden" textAlign='center'>
            <AspectRatio ratio={191.27 / 155.77} width="100%">
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