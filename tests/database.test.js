const assert = require('assert');
const CardDatabase = require('../src/database');

console.log('Running database.test.js...');

// Initialize database in memory
const db = new CardDatabase(':memory:');

// 1. Verify table initialization
console.log('  Testing game initialization...');
assert.strictEqual(db.hasGameData('pokemon'), false);
assert.strictEqual(db.hasGameData('magic'), false);

const stats = db.getGameStats();
assert.ok(stats.length >= 2, 'Should have initialized games in the database');
const pokemonGame = stats.find(g => g.id === 'pokemon');
assert.strictEqual(pokemonGame.card_count, 0);

console.log('  ✓ Game initialization tests passed.');

// 2. Test Single Card Insertion and Querying
console.log('  Testing card insertion and retrieval...');

const sampleCard = {
    id: 'pokemon_scr_114',
    game: 'pokemon',
    product_id: 'scr_114',
    name: 'Hoothoot',
    set_name: 'Stellar Crown',
    set_code: 'scr',
    set_abbreviation: 'SCR',
    card_number: '114',
    image_url: 'https://tcgplayer-cdn.tcgplayer.com/product/123_200w.jpg',
    local_image: null,
    rarity: 'Common',
    card_type: 'Pokemon',
    card_text: 'Triple Draw: Draw 3 cards.',
    hp: 60,
    stage: 'Basic'
};

const insertResult = db.insertCard(sampleCard);
assert.strictEqual(insertResult.action, 'inserted');
assert.strictEqual(insertResult.id, 'pokemon_scr_114');

// Verify retrieve
const retrievedCard = db.getCard('pokemon', 'pokemon_scr_114');
assert.ok(retrievedCard, 'Should retrieve inserted card');
assert.strictEqual(retrievedCard.name, 'Hoothoot');
assert.strictEqual(retrievedCard.hp, 60);
assert.strictEqual(retrievedCard.set_abbreviation, 'SCR');

console.log('  ✓ Card insertion and retrieval tests passed.');

// 3. Test Searching
console.log('  Testing card searching...');

// Regular query
let searchResults = db.searchCards('pokemon', 'Hoothoot');
assert.strictEqual(searchResults.length, 1);
assert.strictEqual(searchResults[0].name, 'Hoothoot');

// Search with set and number
searchResults = db.searchCards('pokemon', 'Hoothoot SCR 114');
assert.strictEqual(searchResults.length, 1);
assert.strictEqual(searchResults[0].name, 'Hoothoot');

// Search with set only
searchResults = db.searchCards('pokemon', 'Hoothoot SCR');
assert.strictEqual(searchResults.length, 1);
assert.strictEqual(searchResults[0].name, 'Hoothoot');

console.log('  ✓ Card search tests passed.');

// 4. Test Bulk Insertion
console.log('  Testing bulk card insertion...');

const bulkCards = [
    {
        id: 'pokemon_scr_115',
        game: 'pokemon',
        product_id: 'scr_115',
        name: 'Noctowl',
        set_name: 'Stellar Crown',
        set_code: 'scr',
        set_abbreviation: 'SCR',
        card_number: '115',
        image_url: 'https://tcgplayer-cdn.tcgplayer.com/product/124_200w.jpg',
        rarity: 'Uncommon',
        card_type: 'Pokemon'
    },
    {
        id: 'pokemon_scr_116',
        game: 'pokemon',
        product_id: 'scr_116',
        name: 'Nest Ball',
        set_name: 'Scarlet & Violet',
        set_code: 'sv1',
        set_abbreviation: 'SVI',
        card_number: '181',
        image_url: 'https://tcgplayer-cdn.tcgplayer.com/product/125_200w.jpg',
        rarity: 'Common',
        card_type: 'Trainer'
    }
];

const bulkResults = db.bulkInsertCards(bulkCards);
assert.strictEqual(bulkResults.inserted, 2);

db.updateGameInfo('pokemon');
assert.strictEqual(db.hasGameData('pokemon'), true);

const updatedStats = db.getGameStats().find(g => g.id === 'pokemon');
assert.strictEqual(updatedStats.card_count, 3); // 1 single + 2 bulk

console.log('  ✓ Bulk card insertion tests passed.');

// 5. Test Recent Cards and Data Clearing
console.log('  Testing recent cards and clearing data...');

const recent = db.getRecentCards('pokemon', 5);
assert.ok(recent.length > 0, 'Should have recent cards after retrieval');

// Clear game data
db.clearGameData('pokemon');
assert.strictEqual(db.hasGameData('pokemon'), false);

const postClearStats = db.getGameStats().find(g => g.id === 'pokemon');
assert.strictEqual(postClearStats.card_count, 0);

console.log('  ✓ Recent cards and clearing data tests passed.');

db.close();
console.log('✓ All database.test.js tests passed!');
