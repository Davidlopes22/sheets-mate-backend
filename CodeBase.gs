const codeBase = "const spreadsheetUrl = '${URL}'\n" +
                "const file = SpreadsheetApp.openByUrl(spreadsheetUrl);\n" +
                "const ${PAGE_NAME}SheetName = '${PAGE_NAME_WITHOUT_FORMATTER}';\n" +
                "const ${PAGE_NAME}Sheet = file.getSheetByName(${PAGE_NAME}SheetName);\n" +
                "\n" +
                "// **************************************\n" +
                "// Columns Name info - any careless change can break the logic\n" +
                "// **************************************\n" +
                "const columnsNameRow = ${ROW_COLUMNS};\n" +
                "//column [columnPosition,NameColumn,requiredField]\n" +
                "const columns${PAGE_NAME}Sheet = ${COLUMNS_ARRAY}\n" +
                "\n" +
                "\n" +
                "// **************************************\n" +
                "// Request\n" +
                "// **************************************\n" +
                "function doGet(e) {\n" +
                "  if (isMissingProperties(e, ['actionRequest'])) {\n" +
                "    return errorMessage('Missing request actionRequest');\n" +
                "  } \n" +
                "  const requestAction = e.parameter.actionRequest;\n" +
                "  switch(requestAction) {\n" +
                "    case 'deleteMultipleRows': return deleteRows(e, Pagina1Sheet,columnsPagina1Sheet,true);\n" +
                "    case 'deleteOne': return deleteRows(e,Pagina1Sheet,columnsPagina1Sheet,false);\n"+
                "    case 'getAll': return getAll(${PAGE_NAME}Sheet, columns${PAGE_NAME}Sheet);\n" +
                "    case 'get${PAGE_NAME}': return get${PAGE_NAME}(e, ${PAGE_NAME}Sheet , columns${PAGE_NAME}Sheet);\n" +
                "    default: return errorMessage('Invalid request action');\n" +
                "  }\n" +
                "}\n" +
                "\n" +
                "function doPost(e){\n" +
                "\n" +
                "    if (isMissingProperties(e, ['actionRequest'])) {\n" +
                "        return errorMessage('Missing request actionRequest');\n" +
                "      } \n" +
                "    const requestAction = e.parameter.actionRequest;\n" +
                "    var jsonData = e.postData?.contents;\n" +
                "\n" +
                "    if(!jsonData)\n" +
                "      return errorMessage('post data cannot be empty')\n" +
                "\n" +
                "    jsonData = JSON.parse(jsonData)\n" +
                "    switch(requestAction) {\n" +
                "        case 'singleInsertOn${PAGE_NAME}': return singleInsertOn${PAGE_NAME}(jsonData, ${PAGE_NAME}Sheet, columns${PAGE_NAME}Sheet);\n"+
                "        case 'multipleInsertOn${PAGE_NAME}': return multipleInsertOn${PAGE_NAME}(jsonData, ${PAGE_NAME}Sheet, columns${PAGE_NAME}Sheet);\n" +
                "        case 'updateByquery': return updateByQuery(e, jsonData, ${PAGE_NAME}Sheet, columns${PAGE_NAME}Sheet);\n" +
                "        case 'updateOneByquery': return updateOneRowByQuery(e,jsonData, ${PAGE_NAME}Sheet, columns${PAGE_NAME}Sheet)\n" +
                "        default: return errorMessage('Invalid request action');\n" +
                "      }\n" +
                "}\n" +
                "\n" +
                "\n" +
                "// **************************************\n" +
                "// Utils\n" +
                "// **************************************\n" +
                "\n" +
                "// **************************************\n" +
                "// ///// Validation\n" +
                "// **************************************\n" +
                "//VALIDATE IF ALL COLUMNS ARE INSIDE A JSON\n" +
                "function validateEntryData(json,columns){\n" +
                "  for(var column in columns){\n" +
                "        var columnName = columns[column][1]\n" +
                "        var data = json[columnName]\n" +
                "        if(!data && columns[column][2]){\n" +
                "          return false\n" +
                "        }\n" +
                "      }\n" +
                "  return true;\n" +
                "}\n" +
                "\n" +
                "function validateUpdateData(json,columns){\n" +
                "  for(var column in columns){\n" +
                "        var columnName = columns[column][1]\n" +
                "        var data = json[columnName]\n" +
                "        \n" +
                "        if(json.hasOwnProperty(columnName) && (data == null || data == undefined || data == \"\") && columns[column][2]){\n" +
                "          return false\n" +
                "        }\n" +
                "      }\n" +
                "  return true;\n" +
                "}\n" +
                "function validateParamsNames(params, columns){\n" +
                "  for (var paramName in params) {\n" +
                "      if(paramName != 'actionRequest'){\n" +
                "        var found = false;\n" +
                "        for(var column in columns){\n" +
                "                if(paramName == columns[column][1]){\n" +
                "                  found = true;\n" +
                "                  break;\n" +
                "                }      \n" +
                "          }\n" +
                "          if (!found) return false;\n" +
                "      }\n" +
                "  }\n" +
                "  return true;\n" +
                " \n" +
                "}\n" +
                "\n" +
                "function validateFieldsOnJsonAreValid(jsonData, columns){\n" +
                "  for (var data in jsonData) {\n" +
                "    var found = false;\n" +
                "    for(var column in columns){\n" +
                "      if(data == columns[column][1]){\n" +
                "                  found = true;\n" +
                "                  break;\n" +
                "                }  \n" +
                "    }\n" +
                "    if (!found) return false;\n" +
                "  }\n" +
                "  return true;\n" +
                "}\n" +
                "\n" +
                "function validateFieldsToSearch(fieldsToSearch, postData){\n" +
                "  if(fieldsToSearch.length == 0 || postData.length == 0)\n" +
                "    return false;\n" +
                "  return true;\n" +
                "}\n" +
                "\n" +
                "// **************************************\n" +
                "// ///// END - Validation\n" +
                "// **************************************\n" +
                "\n" +
                "function findRowByData(jsonData, sheet, fieldsToSearch, columnsSheet){\n" +
                "\n" +
                "  if(validateFieldsToSearch(fieldsToSearch, jsonData)){\n" +
                "    var rowsToReturn = [];\n" +
                "  // first position of a column to aux calculate positions\n" +
                "    const columnsIndexOffset = columnsSheet[0][0];\n" +
                "\n" +
                "    var dataRange = sheet.getDataRange();\n" +
                "    var rowCount = dataRange.getLastRow();\n" +
                "\n" +
                "    var valuesOnTable = dataRange.offset(0, columnsSheet[0][0]-1, rowCount,columnsSheet.length).getValues();\n" +
                "    const columnsName = valuesOnTable[columnsNameRow-1];\n" +
                "    // traverse rows to find match data\n" +
                "    for( var i = columnsNameRow; i < rowCount; i ++ ){\n" +
                "     \n" +
                "        for(var j = 0;j<fieldsToSearch.length ;j ++ ){\n" +
                "          var keyPosition = fieldsToSearch[j][0] - columnsIndexOffset;\n" +
                "          var dataOnjson = jsonData[columnsName[keyPosition]]\n" +
                "          if(dataOnjson != valuesOnTable[i][keyPosition])\n" +
                "            break;\n" +
                "          //this is to see if all fieldsTosearch match with the data\n" +
                "          else if(j == fieldsToSearch.length - 1){\n" +
                "            rowsToReturn.push(i+1);\n" +
                "          }\n" +
                "        }\n" +
                "      }\n" +
                "    return rowsToReturn;\n" +
                "  }\n" +
                "  else return errorMessage('Fields to find/post must be higher than 0');\n" +
                "  \n" +
                "}\n" +
                "\n" +
                "\n" +
                "function buildDataToInsert(json, columns){\n" +
                "  var rowContents = [];\n" +
                "  for(var column in columns){\n" +
                "      var columnName = columns[column][1]\n" +
                "      var data = json[columnName]\n" +
                "      if(columnName){\n" +
                "         if(data)\n" +
                "           rowContents.push(data)\n" +
                "         else rowContents.push('null')\n"+
                "      }else rowContents.push('')\n" +
                "    }\n" +
                "    return [rowContents]\n" +
                "}\n" +
                "\n" +
                "\n" +
                "// **************************************\n" +
                "// Messages\n" +
                "// **************************************\n" +
                "\n" +
                "function errorMessage(msg) {\n" +
                "  const output = JSON.stringify({success: false, message: msg});\n" +
                "  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);\n" +
                "}\n" +
                "\n" +
                "function successMessage(msg) {\n" +
                "  const output = JSON.stringify({success: true, message: msg});\n" +
                "  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);\n" +
                "}\n" +
                "function successObjects(msg) {\n" +
                "  const output = JSON.stringify({success: true, objects: msg});\n" +
                "  return ContentService.createTextOutput(output).setMimeType(ContentService.MimeType.JSON);\n" +
                "}\n" +
                "// **************************************\n" +
                "// END - Messages\n" +
                "// **************************************\n" +
                "\n" +
                "function isMissingProperties(e, properties) {\n" +
                "  const filtered = properties.filter(p => e.parameter.hasOwnProperty(p));\n" +
                "  return filtered.length != properties.length;\n" +
                "}\n" +
                "\n" +
                "\n" +
                "// **************************************\n" +
                "// INSERT \n" +
                "// **************************************\n" +
                "function singleInsertOn${PAGE_NAME}(jsonData, sheet, sheetColumns){\n" +
                    " if(!validateEntryData(jsonData,sheetColumns))\n" +
                    "    return errorMessage('required field must have a value')\n" +
                    "  if(!validateFieldsOnJsonAreValid(jsonData, sheetColumns))\n" +
                    "    return errorMessage('Some dataName on json was not found on our sheet');\n" +
                    "  var jsonToInsert = buildDataToInsert(jsonData,sheetColumns)\n" +
                    "  jsonToInsert = convertJsonToList(jsonToInsert)\n" +
                    "  var lastRow = sheet.getLastRow() + 1;\n" +
                    "  var range = sheet.getRange(lastRow,sheetColumns[0][0],1,sheetColumns.length);\n" +
                    "  range.setValues(jsonToInsert);\n" +
                    "  return successMessage('Row added!');\n" +
                    "}\n" +
                "function multipleInsertOn${PAGE_NAME}(jsonData, sheet, sheetColumns){\n" +
                "  if(jsonData.length<=1)\n" +
                "    return errorMessage('Empty object or just one object')\n" +
                "  for(object in jsonData){\n" +
                "    if(!validateEntryData(jsonData[object],sheetColumns))\n" +
                "       return errorMessage('required field must have a value')\n" +
                "    if(!validateFieldsOnJsonAreValid(jsonData[object], sheetColumns))\n" +
                "      return errorMessage('Some dataName on json was not found on our sheet');\n"+
                "  }" +
                "\n" +
                "  for (var i = 0; i < jsonData.length; i++){\n" +
                "      var jsonToInsert = buildDataToInsert(jsonData[i],sheetColumns)\n" +
                "      jsonToInsert = convertJsonToList(jsonToInsert)\n" +
                "      var lastRow = sheet.getLastRow() + 1;\n" +
                "      var range = sheet.getRange(lastRow,sheetColumns[0][0],1,sheetColumns.length);\n" +
                "      range.setValues(jsonToInsert);\n" +
                "  }\n" +
                "  return successMessage('Rows added!');\n" +
                "}\n" +
                "\n" +
                "function convertJsonToList(json) {\n" +
                "  var data = [];\n" +
                "\n" +
                "  for (var i = 0; i < json.length; i++) {\n" +
                "    var item = json[i];\n" +
                "\n" +
                "    data.push(Object.values(item));\n" +
                "  }\n" +
                "  return data;\n" +
                "}\n" +
                "\n" +
                "// **************************************\n" +
                "// Update\n" +
                "// **************************************\n" +
                "function updateRow(range, jsonDataToUpdate, columns){\n" +
                "    var data = range.getValues()[0];\n" +
                "     // first position of a column to aux calculate positions\n" +
                "    for(var column in columns){\n" +
                "      var dataFromJson = jsonDataToUpdate[columns[column][1]]\n" +
                "      \n" +
                "      if(dataFromJson != undefined){\n" +
                "        data[column] = dataFromJson;\n" +
                "      }\n" +
                "    }\n" +
                "    range.setValues([data]);\n" +
                "}\n" +
                "// **************************************\n" +
                "// //////Query\n" +
                "// **************************************\n" +
                "function buildJsonByQuery(e, columns){\n" +
                "  var fieldsToSearch = []\n" +
                "  var jsonData = {};\n" +
                "  for (var paramName in e.parameters) {\n" +
                "    if(paramName != 'actionRequest'){\n" +
                "      for(var column in columns){\n" +
                "            if(paramName == columns[column][1])\n" +
                "              fieldsToSearch.push([columns[column][0], paramName, columns[column][2]]);\n" +
                "              \n" +
                "      }\n" +
                "      jsonData[paramName] = e.parameters[paramName][0]\n" +
                "    }\n" +
                "  }\n" +
                "  var dataToReturn = [jsonData, fieldsToSearch];\n" +
                "    return dataToReturn;\n" +
                "}\n" +
                "\n" +
                "\n" +
                "function updateByQuery(e,jsonDataUpdate, sheet, columns){\n" +
                "\n" +
                "  if(!validateParamsNames(e.parameters,columns))\n" +
                "    return errorMessage('Some parameter was not found');\n" +
                "  if(!validateFieldsOnJsonAreValid(jsonDataUpdate, columns))\n" +
                "    return errorMessage('Some dataName on json was not found on our sheet');\n" +
                "\n" +
                "  const auxData = buildJsonByQuery(e, columns);\n" +
                "  const jsonData = auxData[0];\n" +
                "  const fieldsToSearch = auxData[1];\n" +
                "\n" +
                "  if(!validateUpdateData(jsonDataUpdate,columns))\n" +
                "    return errorMessage('required field must have a value');\n" +
                "  var rows = findRowByData(jsonData,sheet,fieldsToSearch, columns);\n" +
                "  let count = 0;\n"+
                "  for(row in rows){\n" +
                "    var range = sheet.getRange(rows[row], columns[0][0],1,columns.length);\n" +
                "    updateRow(range, jsonDataUpdate, columns)\n" +
                "    count ++;\n"+
                "  }\n" +
                "return successMessage(count + \" row(s) updated\")\n"+
                "}\n" +
                "\n" +
                "function updateOneRowByQuery(e,jsonDataUpdate, sheet, columns){\n" +
                "  if(!validateParamsNames(e.parameters,columns))\n" +
                "    return errorMessage('Some parameter was not found');\n" +
                "  if(!validateFieldsOnJsonAreValid(jsonDataUpdate, columns))\n" +
                "    return errorMessage('Some dataName on json was not found on our sheet');\n" +
                "\n" +
                "  const auxData = buildJsonByQuery(e, columns);\n" +
                "  const jsonData = auxData[0];\n" +
                "  const fieldsToSearch = auxData[1];\n" +
                "\n" +
                "  var row = findRowByData(jsonData,sheet,fieldsToSearch, columns);\n" +
                "  if(row.length>1)\n" +
                "    return errorMessage('More than one row found with these parameters');\n" +
                "  if(row.length == 0)\n" +
                "    return errorMessage('No row found with these parameters');\n" +
                "  if(!validateUpdateData(jsonDataUpdate,columns))\n" +
                "    return errorMessage('required field must have a value');\n" +
                "  var range = sheet.getRange(row[0], columns[0][0],1,columns.length);\n" +
                "  updateRow(range, jsonDataUpdate, columns);\n" +
                "  return successMessage('One row was updated');\n" +
                "  \n" +
                "}\n" +
                "// **************************************\n" +
                "// ////// END - Query\n" +
                "// ************************************** \n" +
                "\n" +
                "\n" +
                "function getAll(sheet, columns){    \n" +
                    "    let rows = []\n" +
                    "    var dataRange = sheet.getDataRange();\n" +
                    "    var rowCount = dataRange.getLastRow();\n" +
                    "     for( var i = columnsNameRow + 1; i <= rowCount; i ++ ){\n" +
                    "        rows.push(i);\n" +
                    "      }\n" +
                    "  var formatedRowsData = getRowsData(sheet,rows, columns)\n" +
                    "  return successObjects(formatedRowsData)\n" +
                    "}\n" +
                "\n" +
                "function get${PAGE_NAME}(e, sheet, columns) {\n" +
                "  if(!validateParamsNames(e.parameters,columns))\n" +
                "    return errorMessage('Some parameter was not found');\n" +
                "  const auxData = buildJsonByQuery(e, columns);\n" +
                "  const jsonData = auxData[0];\n" +
                "  const fieldsToSearch = auxData[1];\n" +
                "  var rows = findRowByData(jsonData,sheet,fieldsToSearch, columns);\n" +
                "  var formatedRowsData = getRowsData(sheet,rows, columns)\n" +
                "  return successObjects(formatedRowsData)\n" +
                "\n" +
                "}\n" +
                "\n" +
                "function setNameOnColumnDataRow(row, columnNames){\n" +
                "  var data = [];\n" +
                "  \n" +
                "  var formattedRowData = {};\n" +
                "  for (var j = 0; j < columnNames.length; j++) {\n" +
                "    var column = columnNames[j];\n" +
                "    var columnName = column[1];\n" +
                "    formattedRowData[columnName] = row[j];\n" +
                "  }\n" +
                "  data.push(formattedRowData);\n" +
                "\n" +
                "  return data;\n" +
                "}\n" +
                "function getRowsData(sheet,rowsToRetrieve,columns) {\n" +
                "  var data = [];\n" +
                "  \n" +
                "  for (var i = 0; i < rowsToRetrieve.length; i++) {\n" +
                "    var row = rowsToRetrieve[i];\n" +
                "    var rowData = sheet.getRange(row, columns[0][0], 1, columns.length).getValues()[0];\n" +
                "    data.push(setNameOnColumnDataRow(rowData, columns));\n" +
                "  }\n" +
                "\n" +
                "  return data;\n" +
                "}\n" +
                "\n" +
                "// **************************************\n" +
                "// Delete\n" +
                "// **************************************\n" +
                "function deleteRows(e, sheet, columns,multipleRows){\n" +
                "\n" +
                "  var rowsToDelete = [];\n" +
                "  if(!validateParamsNames(e.parameters,columns))\n" +
                "    return errorMessage('Some parameter was not found');\n" +
                "\n" +
                "  const auxData = buildJsonByQuery(e, columns);\n" +
                "  const jsonData = auxData[0];\n" +
                "  const fieldsToSearch = auxData[1];\n" +
                "\n" +
                "  if(!validateFieldsOnJsonAreValid(jsonData, columns))\n" +
                "    return errorMessage('Some dataName on json was not found on our sheet');\n" +
                "  rowsToDelete = findRowByData(jsonData, sheet, fieldsToSearch, columns)\n" +
                "\n" +
                "  if(!multipleRows && rowsToDelete.length>1)\n" +
                "      return errorMessage(\"Multiple rows found when wanted to delete one\")\n" +
                "\n" +
                "  var auxDelete = 0;\n" +
                "  //every time some row is deleted we need to remove a position from previous rows we found \n" +
                "  for(var p in rowsToDelete){\n" +
                "    sheet.deleteRow(rowsToDelete[p] - auxDelete);\n" +
                "    auxDelete++;\n" +
                "  }\n" +
                "  return successMessage(auxDelete + ' row(s) was deleted!');\n" +
                "}\n"+
                "// **************************************\n" +
                "// END - Delete\n" +
                "// **************************************\n"