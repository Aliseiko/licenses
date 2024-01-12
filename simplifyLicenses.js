const fs = require('fs');
const path = require('path');

const loadFilePath = path.join(__dirname, 'resources/allValidLicenses.json');
const saveFilePath = path.join(__dirname, 'resources/simpleLicensesArray.json');

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

// LicenseObjects Example
// {
//   'LicenseObjects': [
//     {
//       'LicenseOwnersInfo': {
//         'LicenseOwnerTypeCode': '1',
//         'UNP': '791294787',
//         'OrgName': 'Частное унитарное предприятие "ТревелТрак"',
//         'NameShort': 'Частное предприятие "ТревелТрак"',
//         'Address': {
//           'CountryCode': '112',
//           'soato': '7235501000',
//           'Street': '60 лет Октября',
//           'StreetTypeCode': '1',
//           'BuildingNumberId': '17Б',
//           'OfficeNumber': 'пом. 1',
//           'PostCode': '213654'
//         }
//       },
//       'Licenses': [
//         {
//           'LicensingAuthorityCode': '33200',
//           'ActivityCode': '13',
//           'ServicesInfo': [
//             {
//               'ServiceCode': '130400',
//               'ServiceStatusCode': '1',
//               'ServiceDateStart': '2024-01-03'
//             }
//           ],
//           'LicenseNumber': '02190/6-85716',
//           'ERLLicenseNumber': '13240000079529',
//           'LicenseStatusCode': '1',
//           'DecisionNumber': '26-ЛИ',
//           'DecisionDate': '2023-12-28',
//           'LicenseTerritory': {
//             'CountryCode': '112',
//             'soato': '0'
//           },
//           'LicenseActionCode': '02'
//         }
//       ]
//     }
//   ]
// };
