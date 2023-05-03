import typeshedJson from "../micropython/main/typeshed.en.json"

export interface TypedParameter{
    parameterName:string,
    range?: number[],
    type:string,
    defaultValue:any
}
export interface TypedFunctionSignature{
    name:string,
    parameters:TypedParameter[],
    returnType:string
}
export interface TypeshedFilesType{
    [fileName:string]:string
}
export interface TypeshedInfo{
    [funcName:string]:TypedFunctionSignature;
}
export const typeFiles:TypeshedFilesType=typeshedJson.files;
export function typeshedJsonToMap():TypeshedInfo{
    var ret:TypeshedInfo={};
    for(let file in typeFiles){
        var typeInfo=typeFiles[file]
        var moduleName=file.replace("/typeshed/","").replaceAll(".pyi","").replaceAll("/",".");

        var functions=typeInfo.split("def ")   
        //the first item will always be imports
        for(var i=1;i<functions.length;i++){
           // console.log("*******************")
            var currentDef=functions[i]
            var funcName=currentDef.split("(")[0].trim()
            //console.log(funcName)
            //console.log(currentDef)

            if(currentDef.split("->").length>=2){
                var [params,returnTypeRaw]=currentDef.split("->")

                var returnType=returnTypeRaw.split(":")[0].trim();
                
                params=params.split("(")[1].split(")")[0].replaceAll("\n","").replaceAll(" ","")
               // console.log(params)
                //ignore complex types
                let paramsList:TypedParameter[]=[];
                
                if(params.includes("Tuple")||params.includes("Union"))continue;
                var commaSplit=params.split(",")
                    for(let paramTypePair of commaSplit){
                       // console.log(paramTypePair);
                        if(paramTypePair.includes(":")){
                            var [label,type]=paramTypePair.split(":")
                            //console.log(label)
                            if(type.includes("=")){
                                var [trueType,optionalValue]=type.split("=")
                                paramsList.push({parameterName:label,type:trueType,defaultValue:optionalValue})
                               // console.log(trueType)
                               // console.log(optionalValue)
                            }
                            else{
                                paramsList.push({parameterName:label,type:type,defaultValue:null})

                               // console.log(type)
                            }

                    }
                    }
                var sign:TypedFunctionSignature={name:funcName,
                returnType:returnType,
                parameters:paramsList
                };
                //console.log(moduleName+"."+funcName);
                ret[moduleName+"."+funcName]=sign;
            }
        }     
    }
    console.log(ret);
    return ret 
}

export function inferTypeinfoFromArgs(args: string[]): TypedParameter[] {
    return args.map((arg, i) => {
        // Try to convert arg to number
        let type = "str"
        const int = parseInt(arg)
        const float = parseFloat(arg)
        if (!isNaN(int)) {
            // Is an int or float
            type = "float"
        }
        return {
            parameterName: `Parameter ${i+1}`,
            defaultValue: null,
            type
        }
    })
}

// export const typeshedInfo = typeshedJsonToMap()
// STUB definition due to project time constraints
// The following modules are covered:
// microbit

enum ParameterType {
    Int = "int", 
    Float = "float", 
    String = "string", 
    SoundEffect = "soundeffect",
    Boolean = "boolean",
    Image = "image",
    Tuple = "tuple",
    Volume = "volume",
    PixelCoordinates = "pixelCoordinates", //for get_pixel
    PixelCoordinatesWithBrightness = "pixelCoordinatesWithBrightness", //for set_pixel
    Text = "text"
    //scrolls string by default, but converts integer/float input to string using str() - wasn't sure whether to just put
    //String or make a new type.
}

export const typeshedInfo: TypeshedInfo = {
  "stdlib.builtins.sleep": {
    name: "sleep",
    parameters: [
      {
        parameterName: "duration",
        type: ParameterType.Float,
        range: [0, 10000],
        defaultValue: "1",
      },
    ],
    returnType: "None",
  },


  "stdlib.microbit.display.get_pixel": {
    name: "get_pixel",
    parameters: [
      {
        parameterName: "coordinates",
        type: ParameterType.PixelCoordinates,
        defaultValue: null,
      },
    ],
    returnType: "ParameterType.Int",
  },

  "stdlib.microbit.display.set_pixel": {
    name: "set_pixel",
    parameters: [
      {
        parameterName: "coordinates",
        type: ParameterType.PixelCoordinates,
        defaultValue: null,
      },
      {
        parameterName: "brightness",
        type: "ParameterType.Int",
        defaultValue: "1",
        range: [0, 9],
      }
    ],
    returnType: "None",
  },

  "stdlib.microbit.display.scroll": {
    name: "scroll",
    parameters: [
      {
        parameterName: "text",
        type: ParameterType.Text,
        defaultValue: "Hello",
      },
      {
        parameterName: "delay",
        type: ParameterType.Int,
        defaultValue: "100",
        range: [10, 800],
      },
      {
        parameterName: "wait",
        type: ParameterType.Boolean,
        defaultValue: "True",
      },
      {
        parameterName: "loop",
        type: ParameterType.Boolean,
        defaultValue: "False",
      },
      {
        parameterName: "monospace",
        type: ParameterType.Boolean,
        defaultValue: "False",
      },
    ],
    returnType: "None",
  },

  "stdlib.microbit.display.show": {
    name: "show",
    parameters: [
      {
        parameterName: "image",
        type: ParameterType.Image,
        defaultValue: "Hello",
      },
      {
        parameterName: "delay",
        type: ParameterType.Int,
        defaultValue: "100",
        range: [10, 800],
      },
      {
        parameterName: "wait",
        type: ParameterType.Boolean,
        defaultValue: "True",
      },
      {
        parameterName: "loop",
        type: ParameterType.Boolean,
        defaultValue: "False",
      },
      {
        parameterName: "clear",
        type: ParameterType.Boolean,
        defaultValue: "False",
      },
    ],
    returnType: "None",
  },

  "stdlib.microbit.scale": {
    name: "scale",
    parameters: [
      {
        parameterName: "value",
        type: ParameterType.Float,
        defaultValue: "0",
        range: [-1000, 1000],
      },
      {
        parameterName: "from_",
        type: ParameterType.Tuple,
        defaultValue: null,
      },
      {
        parameterName: "to",
        type: ParameterType.Tuple,
        defaultValue: null,
      },
    ],
    returnType: "None",
  },

  "stdlib.microbit.set_volume": {
    name: "set_volume",
    parameters: [
        {
            parameterName: "volume",
            type: ParameterType.Int,
            defaultValue: "100",
            range: [0, 255],
        }
    ],
    returnType: "None",
  },

  "stdlib.microbit.audio.play": {
    name: "play",
    parameters: [
      {
        parameterName: "Sound",
        type: ParameterType.SoundEffect,
        defaultValue: null,
      },
    ],
    returnType: "None",
  },
};