const fs = require('fs');
const path = require('path');

const loadFilePath = path.join(__dirname, 'resources/simpleLicensesArray.json');
const checkedFilePath = path.join(__dirname, 'resources/checkedLicensesArray.json');

const simpleLicensesJSON = fs.readFileSync(loadFilePath);
const simpleLicensesArray = JSON.parse(simpleLicensesJSON);

let success = 0;
let fails = 0;


async function checkLicense(licenseObj) {
  try {
    let response = await fetch(
      'http://egr.gov.by/api/v2/egr/getShortInfoByRegNum/' + licenseObj['UNP']);
    if (response.ok) {
      let json = await response.json();
      licenseObj['status'] = json[0]['nsi00219']['vnsostk'];
      if (json[0]['dto']) {
        licenseObj['dateExclude'] = json[0]['dto'];
      }
      success++;
    }
  } catch (e) {
    fails++;
    console.log(e);
  }
}

async function checkAllLicenses(licensesArray) {
  const totalLicenses = licensesArray.length;
  for (const [index, licenseObj] of licensesArray.entries()) {
    await checkLicense(licenseObj);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Done ${index + 1} of ${totalLicenses}. Success: ${success}. Failed: ${fails}.`);
    if (index % 50 === 0 || index + 1 === totalLicenses) {
      fs.writeFileSync(checkedFilePath, JSON.stringify(simpleLicensesArray));
    }
  }
}

checkAllLicenses(simpleLicensesArray);

// [{
//     "ngrn": 691990278,
//     "dfrom": "2016-05-16T21:00:00.000+00:00",
//     "dto": "2019-06-16T21:00:00.000+00:00",
//     "nsi00219": {"vnsostk": "Исключен из ЕГР", "nsi00219": 35961, "nksost": 2},
//     "vfio": "Ломако Анатолий Войтехович"
// }]

// [{
//     "ngrn": 191800394,
//     "dfrom": "2013-01-23T21:00:00.000+00:00",
//     "nsi00219": {"vnsostk": "Действующий", "nsi00219": 33512, "nksost": 1},
//     "vnaim": "Общество с ограниченной ответственностью \"Ратипа Логистика\"",
//     "vn": "ООО \"Ратипа Логистика\"",
//     "vfn": "Ратипа Логистика"
// }]
