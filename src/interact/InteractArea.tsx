/*
Contents of this file will be moved to another location with modification
for previewing the code in the editor
*/

import { Box, VStack, Button, Textarea } from "@chakra-ui/react";
import { SimulatorBox } from "../simulator/Simulator"
import { useCallback, useRef, useState, useEffect } from "react";
import { useLogging } from "../logging/logging-hooks";
import { useIntl } from "react-intl";
import { SimulatorDeviceConnection } from "../device/simulator";

interface Flash {
  flash: (code: string) => void
}

interface PreviewProps {
  size: number;
  flash: Flash; // tried to use useCallback and useState but did not work
}

export const AudioPreview = ({ 
  size,
  flash
}:PreviewProps) => {
  return (
  <Box width={size} height={size} overflow="hidden">
    placeholder for audio preview
  </Box>
  )
}

export const LEDPreview = ({ // is it possible to also create an emulator that do not play sound
  size,
  flash
}:PreviewProps) => {
  const ref = useRef<HTMLIFrameElement>(null);
  const intl = useIntl();
  const logging = useLogging();

  const simulator = useRef(
    new SimulatorDeviceConnection(logging, () => {
      return ref.current;
    })
  );
  useEffect(() => {
    const sim = simulator.current;
    sim.initialize();
    return () => {
      sim.dispose();
    };
  }, []);

  flash.flash = (code: string) => {
    console.log(code);
    const iframe = ref.current;
    // const button = iframe.contentWindow!.document.querySelector("button.play-button");
    if (!iframe) {
      console.log(size)
      throw new Error("Missing simulator iframe.");
    }
    // console.log(iframe.contentWindow!.document.querySelector("button.play-button"))
    iframe.contentWindow!.postMessage(
      {
        kind: "flash",
        filesystem: {
          "main.py": new TextEncoder().encode(code),
        },
      },
      "*",
    );
  }
  return (
    <Box width={size} height={size} overflow="hidden" textAlign='center'>
      <Box position="relative" left="-95.7%" top="-77.3%" width="290%" maxH="300%">
        <SimulatorBox
          reference={ref}
          intl={intl}
        />
      </Box>
    </Box>
  )
}

const InteractArea = () => {

  let code = "from microbit import *\ndisplay.show(Image.HEART)";
  let [size, setSize] = useState(175)
  let flash: Flash = {
    flash: (code) => {}
  }

  return (
    <VStack spacing={5} bg="gray.25" height="100%">
      <LEDPreview size={size} flash={flash} />
      <Box>
        <Button onClick={
            ()=> {
              flash.flash(code)
            }
        }>
            send code
        </Button>
      </Box>
      <Textarea
        bg="gray.10"
        defaultValue={size}
        onChange={
          (e) => {
            setSize(parseInt(e.target.value));
          }
        }
      >
      </Textarea>
      <Textarea
        bg="gray.10"
        placeholder="code snippet here"
        defaultValue={code}
        onChange={
          (e) => {
            code = e.target.value
          }
        }
      >
      </Textarea>
    </VStack>
  )
}

export default InteractArea