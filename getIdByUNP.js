const fs = require('fs');
const path = require('path');

const loadFilePath = path.join(__dirname, 'resources/reorgLicensesArray13012024.json');
const checkedFilePath = path.join(__dirname, 'resources/reorgLicensesArrayWithId15012024.json');
const failsFilePath = path.join(__dirname, 'resources/failedReorgLicensesArrayWithId15012024.json');

const licensesArrayJSON = fs.readFileSync(loadFilePath);
const licensesArray = JSON.parse(licensesArrayJSON);
const failLicensesArray = [];

let success = 0;
let fails = 0;

const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJNSU5UUkxPIiwicm9sZSI6WyJsaWNlbnNpbmdPcmdhbiIsIm1hbmFnZXIiXSwibmJmIjoxNzA1MzQ2NDY1LCJleHAiOjE3MDUzNzUyNjUsImlhdCI6MTcwNTM0NjQ2NX0.-ox8aimZ4TX1J3eYARFPyY2kQ2CNsYn3cfkBANDTvvMYABEXhvBphQwshY0-pjmauw1KNbL6MgkHiSkyx6Ft3A';

async function getId(licenseObj) {
  try {
    let response = await fetch(
      'https://license.gov.by/api/licenses/getDisplayAll?' + `unp=${licenseObj['UNP']}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json, text/plain, */*',
          Referer: 'https://license.gov.by/license/viewOwnLicensiat'
        },
      });
    if (response.ok) {
      let json = await response.json();
      licenseObj['id'] = json['items'][0]['id'];
      licenseObj['erlLicenseNumber'] = json['items'][0]['generatedNumber'];
      success++;
    }
  } catch (e) {
    fails++;
    console.log(`Fail to get data UNP: ${licenseObj['UNP']}`);
    failLicensesArray.push(licenseObj);
    fs.writeFileSync(failsFilePath, JSON.stringify(failLicensesArray));
  }
}

async function getAllId(licensesArray) {
  const totalLicenses = licensesArray.length;

  for (const [index, licenseObj] of licensesArray.entries()) {
    if (!licenseObj['id']) {
      await getId(licenseObj);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Done ${index + 1} of ${totalLicenses}. Success: ${success}. Failed: ${fails}.`);
    if (index % 50 === 0 || index + 1 === totalLicenses) {
      fs.writeFileSync(checkedFilePath, JSON.stringify(licensesArray));
    }
  }
}

getAllId(licensesArray);
