/*
Contents of this file will be moved to another location with modification
for previewing the code in the editor
*/

import { Box, VStack, Button, Textarea } from "@chakra-ui/react";
import { useState, useRef } from "react";
import { Simulator, flashType } from "./MiniSimulator"

const InteractArea = () => {

  let code = "from microbit import *\ndisplay.show(Image.HEART)"
  let flash = useRef<flashType>(null)
  let [show, setShow] = useState(true)
  let [size, setSize] = useState(175)

  return (
    <VStack spacing={5} bg="gray.25" height="100%">
      <Simulator
        flash={flash}
        size={size}
        displayBoard={show}
        debug={true}
        requestCode={
          ()=>code
        }
      />
      <Box>
        <Button onClick={
            () => {
              flash.current && flash.current(code)
            }
        }>
            send code
        </Button>
        <Button onClick={
          () => {
            setShow(show => !show)
          }
        }>toggle display</Button>
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