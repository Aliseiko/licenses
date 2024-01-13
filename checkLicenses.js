const fs = require('fs');
const path = require('path');

const loadFilePath = path.join(__dirname, 'resources/checkedLicensesArray12012024.json');
const checkedFilePath = path.join(__dirname, 'resources/checkedLicensesArray13012024.json');
const failsFilePath = path.join(__dirname, 'resources/failedLicensesArray13012024.json');

const simpleLicensesJSON = fs.readFileSync(loadFilePath);
const simpleLicensesArray = JSON.parse(simpleLicensesJSON);
const failLicensesArray = [];

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
    console.log(`Fail to get data UNP: ${licenseObj['UNP']}`);
    failLicensesArray.push(licenseObj);
    fs.writeFileSync(failsFilePath, JSON.stringify(failLicensesArray));
  }
}

async function checkAllLicenses(licensesArray) {
  const totalLicenses = licensesArray.length;

  for (const [index, licenseObj] of licensesArray.entries()) {
    if (!licenseObj['status']) {
      await checkLicense(licenseObj);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Done ${index + 1} of ${totalLicenses}. Success: ${success}. Failed: ${fails}.`);
    if (index % 50 === 0 || index + 1 === totalLicenses) {
      fs.writeFileSync(checkedFilePath, JSON.stringify(simpleLicensesArray));
    }
  }
}

checkAllLicenses(simpleLicensesArray);

