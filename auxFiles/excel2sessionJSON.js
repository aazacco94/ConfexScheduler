const xlsx = require("xlsx");
const fs = require("fs");

// read in excel file and store to a workbook obj
const wb = xlsx.readFile('./ConfexSchedulingTemp.xlsx');

// read sheet from workbook
const ws = wb.Sheets['SessionInformationTemplate'];
// console.log(ws);

// Convert to JSON
const data = xlsx.utils.sheet_to_json(ws, {defval:"none"});
// console.log(data);

// Write JSON data to a file as a string
fs.writeFileSync('./JSONsessions.json', JSON.stringify(data, null, 2));

let sponsors = [];
let name;
let sessionId;
let none = "none";
let sponsorIdx = 0;
for(i = 0; i < data.length; i++){
  name = data[i].Sponsor
  sessionId = data[i].SessionID
  let isNone = name === none
  if(!isNone){
    sponsors.push(
        {
        "Name": name,
        "Scheduled":[
          // {
          //   "SessionID":sessionId,
          //   "RoomID":9999
          // }
        ]
      }
    );
    // console.log(sponsors[sponsorIdx]);
    sponsorIdx++;
  }
}

var seenNames = {};

sponsors = sponsors.filter(function(currentObject) {
    if (currentObject.Name in seenNames) {
        return false;
    } else {
        seenNames[currentObject.Name] = true;
        return true;
    }
});
//console.log(sponsors);

// Write JSON data to a file as a string
fs.writeFileSync('./JSONsponsors.json', JSON.stringify(sponsors, null, 2));