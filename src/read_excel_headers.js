const xlsx = require('xlsx');

const workbook = xlsx.readFile('C:\\Users\\nyoon\\OneDrive\\문서\\카카오톡 받은 파일\\미식 인사목록(26.03.04).xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Get the top rows as an array of arrays to inspect the header structure
const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
console.log(data.slice(0, 5)); // Print first 5 rows to see where headers are
