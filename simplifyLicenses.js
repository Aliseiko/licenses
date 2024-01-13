const fs = require('fs');
const path = require('path');

const loadFilePath = path.join(__dirname, 'resources/allValidLicenses12012024.json');
const saveFilePath = path.join(__dirname, 'resources/simpleLicensesArray12012024.json');

function simplifyLicense(fullLicenseObject) {
  const licenseOwnersInfo = fullLicenseObject['LicenseObjects'][0]['LicenseOwnersInfo'];
  const obj = {
    'UNP': licenseOwnersInfo['UNP'],
  };
  if (licenseOwnersInfo['LicenseOwnerTypeCode'] === '1') {
    obj['OrgName'] = licenseOwnersInfo['OrgName'];
    obj['ownerType'] = 'ЮЛ';
  } else if (licenseOwnersInfo['LicenseOwnerTypeCode'] === '2') {
    obj['FIO'] = licenseOwnersInfo['Surname'] + ' ' + licenseOwnersInfo['Firstname'] + ' ' + licenseOwnersInfo['Middlename'];
    obj['ownerType'] = 'ИП';
  } else if (licenseOwnersInfo['LicenseOwnerTypeCode'] === '6') {
    obj['FIO'] = licenseOwnersInfo['Surname'] + ' ' + licenseOwnersInfo['Firstname'] + ' ' + licenseOwnersInfo['Middlename'];
    obj['ownerType'] = 'ФЛ';
  } else {
    obj['ownerType'] = 'Неизвестно';
  }
  return obj;
}

const fullLicensesJSON = fs.readFileSync(loadFilePath);
const fullLicensesArray = JSON.parse(fullLicensesJSON);
const simpleLicensesArray = fullLicensesArray.map(simplifyLicense);
fs.writeFileSync(saveFilePath, JSON.stringify(simpleLicensesArray));

