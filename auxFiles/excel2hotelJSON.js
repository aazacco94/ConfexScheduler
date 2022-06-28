const xlsx = require("xlsx");
const fs = require("fs");
const { Console } = require("console");

// read in excel file and store to a workbook obj
const wb = xlsx.readFile('./HotelRoomInfoTemplate.xlsx');

// read sheet from workbook
const ws = wb.Sheets['Hotels'];
// console.log(ws);

// Convert to JSON
const data = xlsx.utils.sheet_to_json(ws, {defval:"none"});
// console.log(data);

// var scheduled = "{\"Scheduled\":[{\"sessionId\":\"0000\", \"date\":\"11/23/2021\",\"time\":\"12:00:AM\"}]}";
// var timestamp = {"sessionId":0000, "start_date":"11/21/2021", "end_date":"11/21/2021", "time":"12:00:AM"}

// var scheduled = []

// scheduled.push(timestamp);

// console.log(scheduled[0])

var newData = [];

data.forEach(function(session) {
  var jsonStr = JSON.stringify(session)
  jsonStr = jsonStr.slice(0, jsonStr.length - 1)

  // jsonStr = jsonStr + ', "Scheduled":[{"sessionId":99999, "start_date":"11/21/2021", "end_date":"11/21/2021", "time":"12:00:AM"}]}'
  jsonStr = jsonStr + ', "Scheduled":[]}'

  var jsonObj = JSON.parse(jsonStr)
  newData.push(jsonObj)
});

console.log(newData);

// Write JSON data to a file as a string
fs.writeFileSync('./JSONhotels.json', JSON.stringify(newData, null, 2));