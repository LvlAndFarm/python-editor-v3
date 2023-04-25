/*
Contents of this file will be moved to another location with modification
for previewing the code in the editor
*/

import { Box, VStack, Button, Textarea } from "@chakra-ui/react";
import { SimulatorBox } from "../simulator/Simulator"
import { useCallback, useRef, useState, useEffect } from "react";
import { LEDSimulator } from "./MiniSimulator"

const InteractArea = () => {

  let [code, setCode] = useState("from microbit import *\ndisplay.show(Image.HEART)")
  let [flashTrigger, setFlashTrigger] = useState(false)
  let [size, setSize] = useState(175)
  let flashObj = {flash: (code: string) => {}}

  return (
    <VStack spacing={5} bg="gray.25" height="100%">
      <LEDSimulator
        code={code}
        flashTrigger={flashTrigger}
        size={size}
      />
      <Box>
        <Button onClick={
            () => {
              setFlashTrigger(flashTrigger => !flashTrigger)
              setCode(code)
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