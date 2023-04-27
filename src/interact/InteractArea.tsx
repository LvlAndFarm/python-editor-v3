/*
Contents of this file will be moved to another location with modification
for previewing the code in the editor
*/

import { Box, VStack, Button, Textarea } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { Simulator } from "./MiniSimulator"

const InteractArea = () => {

  let code = useRef("from microbit import *\ndisplay.show(Image.HEART)")
  let [flashTrigger, setFlashTrigger] = useState(false)
  let [show, setShow] = useState(true)
  let [size, setSize] = useState(175)

  return (
    <VStack spacing={5} bg="gray.25" height="100%">
      <Simulator
        code={code}
        flashTrigger={flashTrigger}
        size={size}
        show={show}
        debug={true}
      />
      <Box>
        <Button onClick={
            () => {
              setFlashTrigger(flashTrigger => !flashTrigger)
            }
        }>
            send code
        </Button>
        <Button onClick={
          () => {
            setShow(show => !show)
          }
        }>toggle display</Button>
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
        defaultValue={code.current}
        onChange={
          (e) => {
            code.current = e.target.value
          }
        }
      >
      </Textarea>
    </VStack>
  )
}

export default InteractArea