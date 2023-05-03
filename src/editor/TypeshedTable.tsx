import typeshedJson from "../micropython/main/typeshed.en.json"

export interface TypedParameter{
    parameterName:string,
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
    SoundEffect = "soundeffect"
}

export const typeshedInfo: TypeshedInfo = {
  "stdlib.builtins.sleep": {
    name: "sleep",
    parameters: [
      {
        parameterName: "duration",
        type: ParameterType.Float,
        defaultValue: "1",
      },
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