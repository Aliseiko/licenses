const fs = require('fs');
const path = require('path');

const loadFilePath = path.join(__dirname, 'resources/egrLicensesArrayWithId15012024.json');
const saveFilePath = path.join(__dirname, 'resources/erlSuspendedLicenses18012024.json');
const failsFilePath = path.join(__dirname, 'resources/failedErlSuspend18012024.json');

const licensesArrayJSON = fs.readFileSync(loadFilePath);
const licensesArray = JSON.parse(licensesArrayJSON);
const failLicensesArray = [];

let success = 0;
let fails = 0;

const token = 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJBbGlzZWlrbyIsInJvbGUiOiJsaWNlbnNpbmdPcmdhbiIsIm5iZiI6MTcwNTU4ODE5MywiZXhwIjoxNzA1NjE2OTkzLCJpYXQiOjE3MDU1ODgxOTN9.kyNy7Q_t4V3hDvVmnrEx0Bts8p01RJC8nqwLbYriYtSS_WZ88Qg1pWBV3qlTDkbvArNsoPX-afaX5ylr9fXsSg';

function convertToGMT3(dateString) {
  let date = new Date(dateString);

  let gmt3Date = new Date(date.getTime() + 3 * 60 * 60 * 1000);

  let year = gmt3Date.getUTCFullYear();
  let month = (gmt3Date.getUTCMonth() + 1).toString().padStart(2, '0');
  let day = gmt3Date.getUTCDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

async function suspendLicense(licenseObj) {
  const suspendData = {
    'LicenseId': licenseObj['id'],
    'ReModificationId': 4,
    'DecisionDate': convertToGMT3(licenseObj['dateExclude']),
    'DecisionNumber': 'подпункт 1.1 пункта 1 статьи 39 Закона Республики Беларусь от 14.10.2022 № 213-З',
    'SuspensionDateStart': convertToGMT3(licenseObj['dateExclude']),
    'SuspensionDateEnd': null
  };

  try {
    let response = await fetch(
      'https://license.gov.by/api/LicenseChange/ChangeLicenseStatus', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: JSON.stringify(suspendData)
      });
    if (response.ok) {
      licenseObj['isSuspended'] = true;
      success++;
    }
  } catch (e) {
    fails++;
    console.log(`Fail to suspend license UNP: ${licenseObj['UNP']}`);
    failLicensesArray.push(licenseObj);
    fs.writeFileSync(failsFilePath, JSON.stringify(failLicensesArray));
  }
}

async function suspendAllLicenses(licensesArray) {
  const totalLicenses = licensesArray.length;

  for (const [index, licenseObj] of licensesArray.entries()) {
    if (!licenseObj['isSuspended']) {
      await suspendLicense(licenseObj);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Done ${index + 1} of ${totalLicenses}. Success: ${success}. Failed: ${fails}.`);
    if (index % 50 === 0 || index + 1 === totalLicenses) {
      fs.writeFileSync(saveFilePath, JSON.stringify(licensesArray));
    }
  }
}

suspendAllLicenses(licensesArray);
