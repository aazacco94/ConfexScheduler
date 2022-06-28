const xlsx = require("xlsx");
const fs = require("fs");

// read in excel file and store to a workbook obj
const wb = xlsx.readFile('./SpeakerInfo.xlsx');

// read sheet from workbook
const ws = wb.Sheets['Personnel'];
// console.log(ws);

// Convert to JSON
const data = xlsx.utils.sheet_to_json(ws, {defval:"none"});
console.log(data);

// Write JSON data to a file as a string
fs.writeFileSync('./JSONspeakers.json', JSON.stringify(data, null, 2));
