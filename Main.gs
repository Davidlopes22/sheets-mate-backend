const SHEET_ID = "_SHEETID_PLACEHOLDER_"
const PAGE_NAME = "_PAGENAME_PLACEHOLDER_"

const googleUrl = "https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${PAGE_NAME}"
const googleUrlToGetPageNames = "https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}"

const dataToIdentifyColumns = ["sheetId","permissionToken"]
const dataToIdentifyColumnsWithPage = ["sheetId","permissionToken","pageName"]


function doGet(e) {
  if (isMissingProperties(e.parameters, ["actionRequest"])) {
    return errorMessage("Missing request actionRequest");
  } 
  const requestAction = e.parameter.actionRequest;
  switch(requestAction) {
    case "generateCode": return generateCode(e);
    case "getColumns": return getColumns(e);
    case "getSheetsTitles": return getSheetsTitles(e);

    default: return errorMessage("Invalid request action");
  }
}
function getColumns(e){
  
  if (isMissingProperties(e.parameters, dataToIdentifyColumnsWithPage)) {
    return errorMessage("Missing parameter");
  }
  const data = buildJsonByQuery(e)
  var url = buildUrl(googleUrl,data)
  const dataTest = callUrl(url, data["permissionToken"])
  const columns = iterateOverSheetAndIdentifyColumns(dataTest,data["rowInputByUser"])
  return columns;
}

function iterateOverSheetAndIdentifyColumns(data,rowPosition){
  values = data.values
  if(!rowPosition && rowPosition!=0){
      
      var n = 1;
      for(value in values){
        row = values[value]
        if(row.length){
            return returnColumnsAsArray(row,n)
        }
        n++
      }
      return errorMessage("Empty sheet")
  }
  else{
        row = values[rowPosition-1]
        console.log(row)
        if(row.length){
            return returnColumnsAsArray(row,rowPosition)
        }
        return errorMessage("No column has been identified")
  }
  
}
function checkColumnNameExists(data, targetName) {
  for (let i = 0; i < data.length; i++) {
    if (data[i].columnName === targetName) {
      return true; // Name found
    }
  }
  return false; // Name not found
}

function returnColumnsAsArray(columns,rowPosition){
  var returnData = []

  var columnsToReturn = []
  var n = 1;
  for(column in columns){
    value = columns[column]
    if(value){
      if(!checkColumnNameExists(columnsToReturn, value)){
        columnsToReturn.push({position:n,columnName:value})
      }else{
        return errorMessage("duplicate name on column!")
      }
    }
    n++
  }
  returnData = {
    columns: columnsToReturn,
    row: rowPosition
  }
  return successMessage(returnData);
}
function getSheetsTitles(e){
  if(isMissingProperties(e.parameters,dataToIdentifyColumns)){
    return errorMessage("Missing parameter");
    
  }
  var titles = [];
  const jsonData = buildJsonByQuery(e);
  const url = buildUrl(googleUrlToGetPageNames, jsonData)
  const data = callUrl(url, jsonData["permissionToken"])
  const sheetsProperties = data["sheets"]
    for(var propertie in sheetsProperties){
      titles.push(sheetsProperties[propertie].properties.title)
    }
  return successMessage(titles);
}
function isMissingProperties(jsonData, properties) {
  for(propertie in properties){
    if(!jsonData[properties[propertie]])
      return true;
  }
  return false;
}
function entryIsValid(jsonData){
  if(!jsonData)
    return false;
  jsonData = JSON.parse(jsonData)

  if(isMissingProperties(jsonData,["permissionToken","sheetId","pageName"]))
    return false;

  return true;
}

function buildUrl(url ,jsonData){
  return  url.replace("${SHEET_ID}", jsonData["sheetId"]).replace("${PAGE_NAME}", jsonData["pageName"]);
}

function callUrl(url, token){
  try{
    var options = {
      headers: {
        "Authorization": "Bearer " + token
      }
    };
    console.log(options)
    console.log(url)
    var response = UrlFetchApp.fetch(url, options);
    var data = JSON.parse(response.getContentText());
    return data;
  }catch(e){
    console.log("ERROR: " + e)
  }
  

}

function buildJsonByQuery(e){
  var jsonData = {};
  for (var paramName in e.parameters) {
    if(paramName != "actionRequest"){

      jsonData[paramName] = e.parameters[paramName][0]
    }
  }
    return jsonData;
}

function formatString(str){

  const normalizedString = str.normalize('NFD');
  const regex = /[\u0300-\u036f]/g;

  let result = normalizedString.replace(regex, '');
  return result.replace(/[^\w]/gi, '');

}
function generateCode(e){
  const spreadSheetUrl = 'https://docs.google.com/spreadsheets/d/${SHEET_ID}/'

  const jsonData = buildJsonByQuery(e, ["permissionToken","sheetId","pageName","rowInputByUser"]);
  const url = spreadSheetUrl.replace("${SHEET_ID}",jsonData["sheetId"])

  let code = codeBase.replace("${URL}",url).replace("${ROW_COLUMNS}",jsonData["rowInputByUser"])
  .replace("${COLUMNS_ARRAY}",jsonData["columnsArray"]).replace(/\${PAGE_NAME_WITHOUT_FORMATTER}/g,jsonData["pageName"]);

  const formatedPageName = formatString(jsonData["pageName"])
  code = code.replace(/\${PAGE_NAME}/g,formatedPageName)
  return successMessage(code)

}