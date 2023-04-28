/**
 * (c) 2021-2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@chakra-ui/layout";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
  Center,
  Divider,
  GridItem,
  Heading,
  Select,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  VStack,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useLineInfo } from "../editor/codemirror/LineInfoContext";
import HeadedScrollablePanel from "./../common/HeadedScrollablePanel";
import { useActiveEditorActions } from "../editor/active-editor-hooks";

const labelStyles1 = {
  mt: "2",
  ml: "-2.5",
  fontSize: "sm",
};

const InteractionArea = () => {
  const [lineInfo] = useLineInfo();
  console.log(lineInfo);
  const activeEditorActions = useActiveEditorActions();

  if (lineInfo?.statementType !== "CALL") return null;

  // const firstArgNum = parseInt(lineInfo.callInfo?.arguments[0]!)

  return (
    <HeadedScrollablePanel>
      <Box m={7}>
        <Heading>Interaction</Heading>

        <Divider borderWidth="2px" />

        <VStack spacing={4} align="stretch">
          {lineInfo.callInfo?.arguments.map((arg, i) => (
            <React.Fragment key={i}>
              <Text p={5} as="b">
                <FormattedMessage id="Start Frequency" />
              </Text>
              <Box m={10}>
                <Slider
                  focusThumbOnChange={false}
                  aria-label="slider-ex-6"
                  onChange={(val) => {
                    const argCopy = [...lineInfo.callInfo!.arguments];
                    argCopy[i] = val.toString();
                    activeEditorActions?.dispatchTransaction(
                      lineInfo.createArgumentUpdate(argCopy)
                    );
                  }}
                  value={parseInt(arg!)}
                  max={5000}
                >
                  <SliderMark value={150} {...labelStyles1}>
                    0
                  </SliderMark>
                  <SliderMark value={2500} {...labelStyles1}>
                    2500
                  </SliderMark>
                  <SliderMark value={4800} {...labelStyles1}>
                    5000
                  </SliderMark>
                  <SliderMark
                    value={parseInt(arg!)}
                    textAlign="center"
                    bg="blue.500"
                    color="white"
                    mt="-10"
                    ml="-5"
                    w="12"
                  >
                    {parseInt(arg!)}
                  </SliderMark>
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
              </Box>

              <Divider borderWidth="2px" />
            </React.Fragment>
          ))}
        </VStack>
      </Box>
    </HeadedScrollablePanel>
  );

  return ExampleSoundInteraction();
};

const ExampleSoundInteraction = () =>  {

  const [sliderValue1, setSliderValue1] = useState(128)
  const [sliderValue2, setSliderValue2] = useState(128)
  const [sliderValue3, setSliderValue3] = useState(2500)
  const [sliderValue4, setSliderValue4] = useState(2500)
  const [sliderValue5, setSliderValue5] = useState(500)

  const labelStyles1 = {
    mt: "2",
    ml: "-2.5",
    fontSize: "sm",
  };

  return (
    <HeadedScrollablePanel>
      <Box m={7}>
        <Heading>Interaction</Heading>

        <Divider borderWidth="2px" />

        <VStack spacing={4} align="stretch">
          <Text p={5} as="b">
            <FormattedMessage id="Start Frequency" />
          </Text>
          <Box m={10}>
            <Slider
              aria-label="slider-ex-6"
              onChange={(val) => setSliderValue3(val)}
              max={5000}
            >
              <SliderMark value={150} {...labelStyles1}>
                0
              </SliderMark>
              <SliderMark value={2500} {...labelStyles1}>
                2500
              </SliderMark>
              <SliderMark value={4800} {...labelStyles1}>
                5000
              </SliderMark>
              <SliderMark
                value={sliderValue3}
                textAlign="center"
                bg="blue.500"
                color="white"
                mt="-10"
                ml="-5"
                w="12"
              >
                {sliderValue3}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="End Frequency" />
          </Text>
          <Box m={10}>
            <Slider
              aria-label="slider-ex-6"
              onChange={(val) => setSliderValue4(val)}
              max={5000}
            >
              <SliderMark value={150} {...labelStyles1}>
                0
              </SliderMark>
              <SliderMark value={2500} {...labelStyles1}>
                2500
              </SliderMark>
              <SliderMark value={4800} {...labelStyles1}>
                5000
              </SliderMark>
              <SliderMark
                value={sliderValue4}
                textAlign="center"
                bg="blue.500"
                color="white"
                mt="-10"
                ml="-5"
                w="12"
              >
                {sliderValue4}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Duration" />
          </Text>
          <Box m={10}>
            <Slider aria-label='slider-ex-6' onChange={(val) => setSliderValue5(val)} min={1} max={999}>
              <SliderMark value={10} {...labelStyles1}>
                1
              </SliderMark>
              <SliderMark value={500} {...labelStyles1}>
                500
              </SliderMark>
              <SliderMark value={960} {...labelStyles1}>
                999
              </SliderMark>
              <SliderMark
                value={sliderValue5}
                textAlign='center'
                bg='blue.500'
                color='white'
                mt='-10'
                ml='-5'
                w='12'
              >
                {sliderValue5}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Start Volume" />
          </Text>
          <Box m={10}>
            <Slider
              aria-label="slider-ex-6"
              onChange={(val) => setSliderValue1(val)}
              max={255}
            >
              <SliderMark value={10} {...labelStyles1}>
                0
              </SliderMark>
              <SliderMark value={128} {...labelStyles1}>
                128
              </SliderMark>
              <SliderMark value={245} {...labelStyles1}>
                255
              </SliderMark>
              <SliderMark
                value={sliderValue1}
                textAlign="center"
                bg="blue.500"
                color="white"
                mt="-10"
                ml="-5"
                w="12"
              >
                {sliderValue1}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="End Volume" />
          </Text>
          <Box m={10}>
            <Slider
              aria-label="slider-ex-6"
              onChange={(val) => setSliderValue2(val)}
              max={255}
            >
              <SliderMark value={10} {...labelStyles1}>
                0
              </SliderMark>
              <SliderMark value={128} {...labelStyles1}>
                128
              </SliderMark>
              <SliderMark value={245} {...labelStyles1}>
                255
              </SliderMark>
              <SliderMark
                value={sliderValue2}
                textAlign="center"
                bg="blue.500"
                color="white"
                mt="-10"
                ml="-5"
                w="12"
              >
                {sliderValue2}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Waveform" />
          </Text>
          <Select placeholder="Select option">
            <option value="option1">Sine</option>
            <option value="option2">Sawtooth</option>
            <option value="option3">Triangle</option>
            <option value="option4">Square</option>
            <option value="option5">Noise</option>
          </Select>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Effect" />
          </Text>
          <Select placeholder="None">
            <option value="option1">Tremolo</option>
            <option value="option2">Vibrato</option>
            <option value="option3">Warble</option>
          </Select>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Shape" />
          </Text>
          <Select placeholder="Select option">
            <option value="option1">Linear</option>
            <option value="option2">Curve</option>
            <option value="option3">Log</option>
          </Select>

          <Divider borderWidth="2px" />
        </VStack>
      </Box>
    </HeadedScrollablePanel>
  );
};

export const ExampleGraphicsInteraction = () => {

  const [selectedValues, setSelectedValues] = useState<Array<number | null>>(Array(25).fill(0));

  const handleMenuClick = (index: number, value: number) => {
    setSelectedValues(prevValues => {
      const newValues = [...prevValues];
      newValues[index] = value;
      return newValues;
    });
  };

  const handleReset = () => {
    setSelectedValues(Array(25).fill(0));
  };

  const colorSchemeMap: { [key: number]: string } = {
    0: "black",
    1: "#330000",
    2: "#4d0000",
    3: "#660000",
    4: "#800000",
    5: "#990000",
    6: "#b30000",
    7: "#cc0000",
    8: "#e60000",
    9: "#ff0000",
  };

  const getColor = (i: number) => {
    const value = selectedValues[i];
    if (value !== null) {
      return colorSchemeMap[value];
    }
    return "black";
  };

  function pixelGrid(){
    const pixelValues = [];
    for (let i = 0; i < 25; i++){
      pixelValues.push(
        <GridItem w='100%' h='10'>
        <Center><Menu>
          <MenuButton as={Button} size='sm' bg={getColor(i)}>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleMenuClick(i, 0)}>0</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 1)}>1</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 2)}>2</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 3)}>3</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 4)}>4</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 5)}>5</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 6)}>6</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 7)}>7</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 8)}>8</MenuItem>
            <MenuItem onClick={() => handleMenuClick(i, 9)}>9</MenuItem>
          </MenuList>
        </Menu></Center>
        </GridItem>
      )
    }
    return(
      <Box m ={4} borderWidth='10px' borderRadius='md' borderColor={'black'} bg='black'>
        <SimpleGrid gap={1} p={5} columns={5}>
          {pixelValues}
        </SimpleGrid>
        <Box mt={4}>
            <Center><Button onClick={handleReset} bg='white'>Reset</Button></Center>
          </Box>
      </Box>
    )
  }

  
  return (
    <HeadedScrollablePanel>
      <Box m={7}>
        <VStack spacing={4} align="stretch">
          <Text p={5} as="b">
            <FormattedMessage id="Pixels" />
          </Text>

        <Text p={5} as='b'>
          <FormattedMessage id="Pixels" />
        </Text>

        {pixelGrid()}

      </VStack>
    </Box>
  </HeadedScrollablePanel>
  )
}

export default InteractionArea;
