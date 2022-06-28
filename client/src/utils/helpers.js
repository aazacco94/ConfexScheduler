import XLSX from 'xlsx';

/**
 * Returns a list of values of all the checkboxes that are checked.
 *
 * @param nodeList a list of checkbox nodes
 * @returns {*[]} a list of values corresponding to checked boxes
 */
const getCheckboxValues = nodeList => {
  if (!nodeList) {
    return [];
  }
  const checkboxes = [...nodeList.values()];
  return checkboxes.filter(cb => cb.checked).map(cb => cb.value);
};

/** Truncates a string by adding ellipses. */
const truncate = (string, maxLength) => (
  (string.length > maxLength)
    ? `${string.substr(0, maxLength - 1)}...`
    : string
);

const queryFormatter = (original, type) => {
  let formatted = '';
  if (original.length === 1) {
    formatted = `${type}=${original[0]}`;
  }
  if (original.length > 1) {
    for (let i = 1; i < original.length; i += 1) {
      formatted += `|${original[i]}`;
    }
  }

  if (original.length === 0) {
    formatted = null;
  }
  return formatted;
};

async function excelToJson(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Invalid file'));
    }

    file.arrayBuffer().then(buffer => {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstWorksheet = workbook.Sheets[workbook.SheetNames[0]];
      const sessions = XLSX.utils.sheet_to_json(firstWorksheet);
      const secondWorksheet = workbook.Sheets[workbook.SheetNames[1]];
      const hotels = XLSX.utils.sheet_to_json(secondWorksheet);
      const thirdWorksheet = workbook.Sheets[workbook.SheetNames[2]];
      const speakers = XLSX.utils.sheet_to_json(thirdWorksheet);
      const allSheets = { sessions, hotels, speakers };
      resolve(allSheets);
    });
  });
}

/**
 * Finds a room object by id from a list.
 *
 * @param list a list of room objects
 * @param id the id of the room to find
 * @returns {*|undefined} the room object if it was found,
 *     otherwise undefined
 */
const findRoomById = (list, id) => {
  if (list === undefined) {
    return undefined;
  }
  return list.find(r => r.RoomID === parseInt(id, 10));
};

/**
 * Finds the index of a room object by id from a list.
 *
 * @param list a list of room objects
 * @param id the id of the room whose index needs to be found
 * @returns {Number|undefined} the index if the room id is found,
 *     otherwise undefined
 */
const findRoomIndexById = (list, id) => {
  if (list === undefined) {
    return undefined;
  }
  return list.findIndex(r => r.RoomID === parseInt(id, 10));
};

export {
  excelToJson,
  findRoomById,
  findRoomIndexById,
  getCheckboxValues,
  queryFormatter,
  truncate,
};
