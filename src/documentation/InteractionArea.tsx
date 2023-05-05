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
  Input,
} from "@chakra-ui/react";
import React, { FC } from "react";
import { FormattedMessage } from "react-intl";
import { useLineInfo } from "../editor/codemirror/LineInfoContext";
import HeadedScrollablePanel from "./../common/HeadedScrollablePanel";
import { useActiveEditorActions } from "../editor/active-editor-hooks";
import { inferTypeinfoFromArgs, ParameterType, TypedFunctionSignature, typeshedInfo } from "../editor/TypeshedTable";
import { ImageMap } from "../editor/codemirror/code-sharing/imageMaps";

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

  let typeInfo: TypedFunctionSignature|undefined = undefined;

  const qualifiedName = lineInfo.callInfo.moduleName ? 
    `${lineInfo.callInfo.moduleName}.${lineInfo.callInfo.name}` :
     lineInfo.callInfo.name;
  const typeshedId = `stdlib.builtins.${qualifiedName}`
  const typeshedMicrobitId = `stdlib.microbit.${qualifiedName}`;

  if (typeshedInfo[typeshedId]) {
    typeInfo = typeshedInfo[typeshedId]
  } else if (typeshedInfo[typeshedMicrobitId]) {
    typeInfo = typeshedInfo[typeshedMicrobitId]
  }

  if (typeInfo === undefined) {
    console.log("Inferred type info from arguments instead")
    typeInfo = {
      name: qualifiedName,
      parameters: inferTypeinfoFromArgs(lineInfo.callInfo.arguments),
      returnType: "any"
    }
  }

  const onChangeHandler = (i: number) => (val: any) => {
    const argCopy = [...lineInfo.callInfo!.arguments];
    argCopy[i] = val.toString();
    activeEditorActions?.dispatchTransaction(
      lineInfo.createArgumentUpdate(argCopy)
    );
  }

  
  // const firstArgNum = parseInt(lineInfo.callInfo?.arguments[0]!)

  return (
    <HeadedScrollablePanel>
      <Box m={7}>
        <Heading>Interaction</Heading>

        <Divider borderWidth="2px" />
        <Text p={5} as="b">
          Function: {qualifiedName}
        </Text>

        <VStack spacing={4} align="stretch">
          {lineInfo.callInfo?.arguments.map((arg, i) => {
            switch (typeInfo?.parameters[i].type) {
              case "int":
              case "float":
                return (
                  <React.Fragment key={i}>
                    <Text p={5} as="b">
                      <FormattedMessage
                        id={typeInfo?.parameters[i].parameterName}
                      />
                    </Text>
                    <VarSlider min={typeInfo?.parameters[i].range?.[0]||0} 
                               max={typeInfo?.parameters[i].range?.[1]||5000}
                               value={parseInt(arg!)}
                               defaultVal={typeInfo?.parameters[i].defaultValue||2500}
                               onChange={onChangeHandler(i)} />

                    <Divider borderWidth="2px" />
                  </React.Fragment>
                );

              case ParameterType.Image:
                return <ImageEditor values={image2array(arg)} onChange={(val) => {
                  // We receive an array of ints, which we convert back to string form
                  const imgString = `Image("${val.slice(0,5).join("")}:${val.slice(5,10).join("")}:${val.slice(10,15).join("")}`
                  + `:${val.slice(15,20).join("")}:${val.slice(20,25).join("")}")`
                  onChangeHandler(i)(imgString)
                }}/>

              case ParameterType.SoundEffect:
                return <SoundEditor sound={parseSound(arg)} onChange={sound => {
                  // Construct the argument list as named parameters to prevent ambiguity
                  const argString = Object.entries(sound).map(([key, value]) => {
                    // We need to qualify these enum values just in case they're not in scope
                    if (["fx", "shape", "waveform"].includes(key)) {
                      return `${key}=audio.SoundEffect.${value}`
                    } else {
                      return `${key}=${value}`
                    }
                  }).join(", ")
                  // SoundEffect is also qualified for the same reason above
                  onChangeHandler(i)(`audio.SoundEffect(${argString})`)
                }}/>
            
              default:
                return (
                  <React.Fragment key={i}>
                    <Text p={5} pb={0} as="b">
                      <FormattedMessage
                        id={typeInfo?.parameters[i].parameterName}
                      />
                    </Text>
                    <Input
                      value={arg}
                      onChange={(e) => {
                        onChangeHandler(i)(e.target.value);
                      }}
                    />

                    <Divider borderWidth="2px" />
                  </React.Fragment>
                );
            }
          })}
        </VStack>
      </Box>
    </HeadedScrollablePanel>
  );
};

interface SoundEditorProps {
  sound: Sound,
  onChange: (sound: Sound) => void
}

interface VarSliderProps {
  min: number,
  max: number,
  value?: number,
  defaultVal: number,
  onChange: (value: number) => void
}
const VarSlider: FC<VarSliderProps> = ({min, max, value, defaultVal, onChange}) => {
  // Future work: Improve a11y (aria-label)
  return (
    <Box m={10}>
    <Slider
      aria-label="variable-slider"
      onChange={onChange}
      value={value||defaultVal}
      max={max}
    >
      <SliderMark value={min} {...labelStyles1}>
        {min}
      </SliderMark>
      <SliderMark value={Math.round((min+max)/2)} {...labelStyles1}>
         {Math.round((min+max)/2)}
      </SliderMark>
      <SliderMark value={max} {...labelStyles1}>
        {max}
      </SliderMark>
      <SliderMark
        value={value||defaultVal}
        textAlign="center"
        bg="blue.500"
        color="white"
        mt="-10"
        ml="-5"
        w="12"
      >
        {value||defaultVal}
      </SliderMark>
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
  </Box>
  )
}

const SoundEditor: FC<SoundEditorProps> = ({sound, onChange}) =>  {
  // We've passed in the sound object and mutate it before we call notify
  const onChangeHandler = (param: string, value: any) => {
    // We know that param must be part of the sound object as we've hardcoded the fields
    (sound as Record<string, any>)[param] = value;
    onChange(sound)
  }

  return (
    <>
          <Text p={5} as="b">
            <FormattedMessage id="Start Frequency" />
          </Text>
          <VarSlider min={0} max={9999} value={sound.freq_start} defaultVal={5000}
            onChange={val => onChangeHandler("freq_start", val)} />

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="End Frequency" />
          </Text>
          <VarSlider min={0} max={9999} value={sound.freq_end} defaultVal={5000}
            onChange={val => onChangeHandler("freq_end", val)} />

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Duration" />
          </Text>
          <VarSlider min={0} max={9999} value={sound.duration} defaultVal={5000}
            onChange={val => onChangeHandler("duration", val)} />

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Start Volume" />
          </Text>
          <VarSlider min={0} max={255} value={sound.vol_start} defaultVal={255}
            onChange={val => onChangeHandler("vol_start", val)} />

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="End Volume" />
          </Text>
          <VarSlider min={0} max={255} value={sound.vol_end} defaultVal={255}
            onChange={val => onChangeHandler("vol_end", val)} />

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Waveform" />
          </Text>
          <Select value={sound.waveform||soundWaveforms.Square} onChange={e => onChangeHandler("waveform", e.target.value)}>
            {Object.entries(soundWaveforms).map(([key, val]) => (
              <option value={val}>{key}</option>
            ))}
          </Select>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Effect" />
          </Text>
          <Select value={sound.fx||soundFx.None} onChange={e => onChangeHandler("fx", e.target.value)}>
            {Object.entries(soundFx).map(([key, val]) => (
              <option value={val}>{key}</option>
            ))}
          </Select>

          <Divider borderWidth="2px" />

          <Text p={5} as="b">
            <FormattedMessage id="Shape" />
          </Text>
          <Select value={sound.shape||soundShape.Log} onChange={e => onChangeHandler("shape", e.target.value)}>
            {Object.entries(soundShape).map(([key, val]) => (
              <option value={val}>{key}</option>
            ))}
          </Select>

          <Divider borderWidth="2px" />
    </>
  );
};

type ImageArray = number[];
interface ImageEditorProps {
  values: ImageArray,
  onChange: (val: ImageArray) => void
}

const ImageEditor: FC<ImageEditorProps> = ({ values, onChange }) => {

  // const [selectedValues, setSelectedValues] = useState<Array<number>>(values);

  const handleMenuClick = (index: number, value: number) => {
    // setSelectedValues(prevValues => {
      // const newValues = [...values];
      values[index] = value;
      onChange(values)
    // });
  };

  const handleReset = () => {
    // setSelectedValues(Array(25).fill(0));
    onChange(Array(25).fill(0))
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
    const value = values[i];
    if (value !== null) {
      return colorSchemeMap[value];
    }
    return "black";
  };

  /* 5x5 grid simulating pixels for display.show(Image()) function */
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

  
  return pixelGrid()
}

export default InteractionArea;

function image2array(arg: string): ImageArray {
  if (arg.startsWith("Image.")) {
    // Image variable is used
    if (ImageMap[arg.slice("Image.".length).toLowerCase()]) {
      return [...ImageMap[arg.slice("Image.".length).toLowerCase()]]
    }
    return Array(25).fill(0)
  } else {
    // A string of numbers is used instead
    console.log(arg.slice(7,-2).split(":").flatMap(arr => arr.split('')).map(Number))
    return arg.slice(7,-2).split(":").flatMap(arr => arr.split('').map(Number))
  }
}

const soundWaveforms = {
  Square: "WAVEFORM_SQUARE",
  Sine: "WAVEFORM_SINE",
  Triangle: "WAVEFORM_TRIANGLE",
  Sawtooth: "WAVEFORM_SAWTOOTH",
  Noise: "WAVEFORM_NOISE"
}

const soundFx = {
  Vibrato: "FX_VIBRATO",
  Tremolo: "FX_TREMOLO",
  Warble: "FX_WARBLE",
  None: "FX_NONE"
}

const soundShape = {
  Linear: "SHAPE_LINEAR",
  Curve: "SHAPE_CURVE",
  Log: "SHAPE_LOG"
}

interface Sound {
  freq_start?: number,
  freq_end?: number,
  duration?: number,
  vol_start?: number,
  vol_end?: number,
  waveform?: string,
  fx?: string,
  shape?: string
}

function parseSound(soundStr: string): Sound {
  const extract = (raw: string) => raw.split(".").slice(-1)[0]
  // Fragile pattern matching, but it works for most cases
  const soundObj = {

  }
  const firstParen = soundStr.indexOf('SoundEffect(')
  if (firstParen === -1) return soundObj
  const soundArgs = soundStr.slice(firstParen+'SoundEffect('.length, -1).split(",").map(e => e.trim())
  for (let arg of soundArgs) {
    if (arg.includes("=")) {
      // Named parameter
      const [key, val] = arg.split("=");
      (soundObj as Record<string, any>)[key] = ["fx", "waveform", "shape"].includes(key) ? extract(val) : Number(val)
    }
  }
  return soundObj
}