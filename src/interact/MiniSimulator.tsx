import { useEffect, useRef, MutableRefObject, useCallback } from "react";
import {
  AspectRatio,
  Box,
} from "@chakra-ui/react";
import { SimulatorDeviceConnection } from "../device/simulator";
import { useLogging } from "../logging/logging-hooks";
import { MAIN_FILE } from "../fs/fs"

const simulatorURL = "https://olivercwy.github.io/microbit-simulator-build/simulator.html"

interface SimulatorProps {
    size: number,
    debug?: boolean,
    flashTrigger?: any,
    onRequestCode?: () => void,
    code: MutableRefObject<string>,
    show?: boolean,
}

export const Simulator = ({
    size,
    debug,
    code,
    flashTrigger,
    onRequestCode,
    show
}: SimulatorProps) => {

    const ref = useRef<HTMLIFrameElement>(null);
    const logging = useLogging();
    const simulator = useRef(
        new SimulatorDeviceConnection(logging, () => {
            return ref.current;
        })
    );

    const flash = useCallback(() => {
        let actualCode = code.current;
        if (debug) console.log(actualCode);
        const iframe = ref.current;
        if (!iframe) {
            throw new Error("Missing simulator iframe.");
        }
        const sim = simulator.current;

        const dataSource = {
          async files() {
            return {
              [MAIN_FILE]: new TextEncoder().encode(actualCode),
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
    },[code, debug])
    
    const onRequestCodeProxy = useCallback(() => {onRequestCode && onRequestCode()}, [onRequestCode])

    useEffect(() => {
        const sim = simulator.current;
        sim.initialize();
        sim.addListener("request_flash", () => {
            onRequestCodeProxy()
            flash()
        });
        return () => {
            sim.dispose();
        };
    }, [onRequestCodeProxy, flash]);

    useEffect(() => {
        flash()
    },[flashTrigger, flash]);

    useEffect(()=>{
        const sim = simulator.current
        sim.setDisplay(show === undefined ? true : show)
    },[show])

    return (
        <Box width={size} height={size} overflow="hidden" textAlign='center'>
            <AspectRatio ratio={191.27 / 155.77}  position="relative" left="-95.7%" top="-77.3%" width="290%" maxH="300%" >
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