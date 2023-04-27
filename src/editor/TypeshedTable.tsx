import typeshedJson from "../micropython/main/typeshed.en.json"

export interface TypedParameter{
    parameterName:String,
    type:string,
    defaultValue:any
}
export interface TypedFunctionSignature{
    name:String,
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