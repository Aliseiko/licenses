const fs = require('fs');
const path = require('path');

const loadFilePath = path.join(__dirname, 'resources/checkedLicensesArray13012024.json');
const egrFilePath = path.join(__dirname, 'resources/egrLicensesArray13012024.json');
const reorgFilePath = path.join(__dirname, 'resources/reorgLicensesArray13012024.json');

const checkedLicensesArrayJSON = fs.readFileSync(loadFilePath);
const checkedLicensesArray = JSON.parse(checkedLicensesArrayJSON);

const egrLicensesArray = [];
const reorgLicensesArray = [];

checkedLicensesArray.forEach(licenseObj => {
  if (licenseObj['status'] === 'Исключен из ЕГР') {
    egrLicensesArray.push(licenseObj);
  } else if (licenseObj['status'] === 'Прекращение деятельности в результате реорганизации') {
    reorgLicensesArray.push(licenseObj);
  }
});

fs.writeFileSync(egrFilePath, JSON.stringify(egrLicensesArray));
fs.writeFileSync(reorgFilePath, JSON.stringify(reorgLicensesArray));
