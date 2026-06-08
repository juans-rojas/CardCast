/**
 * CardCast Test Suite Runner
 * Runs all unit tests and reports results.
 */
const path = require('path');

console.log('====================================');
console.log('CardCast Test Suite');
console.log('====================================');

try {
    // Execute test suites
    require('../tests/deck-parser.test.js');
    console.log('');
    require('../tests/translations.test.js');
    console.log('');
    require('../tests/database.test.js');
    
    console.log('');
    console.log('====================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY! (100%)');
    console.log('====================================');
    process.exit(0);
} catch (error) {
    console.error('');
    console.error('====================================');
    console.error('TEST SUITE FAILURE!');
    console.error(error.stack || error);
    console.error('====================================');
    process.exit(1);
}
