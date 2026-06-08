const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('Running translations.test.js...');

// 1. Verify translations file exists and parses as valid JSON
console.log('  Verifying translations JSON integrity...');
const filePath = path.join(__dirname, '..', 'public', 'translations.json');
assert.ok(fs.existsSync(filePath), 'translations.json file must exist');

let translations;
try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    translations = JSON.parse(rawData);
} catch (error) {
    assert.fail(`translations.json is not valid JSON: ${error.message}`);
}

assert.ok(translations.en, 'English ("en") translations must be defined');
assert.ok(translations.es, 'Spanish ("es") translations must be defined');

console.log('  ✓ JSON integrity verified.');

// 2. Verify English and Spanish keys alignment
console.log('  Verifying locale keys alignment...');
const enKeys = Object.keys(translations.en).sort();
const esKeys = Object.keys(translations.es).sort();

const missingInEs = enKeys.filter(key => !translations.es.hasOwnProperty(key));
const missingInEn = esKeys.filter(key => !translations.en.hasOwnProperty(key));

if (missingInEs.length > 0) {
    console.error('  ✗ Missing Spanish translations for keys:', missingInEs);
}
if (missingInEn.length > 0) {
    console.error('  ✗ Missing English translations for keys:', missingInEn);
}

assert.strictEqual(missingInEs.length, 0, `There are ${missingInEs.length} keys in English that are missing in Spanish.`);
assert.strictEqual(missingInEn.length, 0, `There are ${missingInEn.length} keys in Spanish that are missing in English.`);

console.log('  ✓ Locale keys alignment verified (English and Spanish are in perfect sync).');
console.log('✓ All translations.test.js tests passed!');
