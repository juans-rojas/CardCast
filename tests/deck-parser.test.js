const assert = require('assert');
const { parseDeckList, detectGameType } = require('../public/js/deck-parser');

console.log('Running deck-parser.test.js...');

// 1. Test Game Type Detection
console.log('  Testing game type detection...');

// Pokemon TCG list indicators
assert.strictEqual(detectGameType('Pokemon: 15\nTrainer: 30\nEnergy: 15'), 'pokemon');
assert.strictEqual(detectGameType('Energy: 4'), 'pokemon');
assert.strictEqual(detectGameType('4 Hoothoot SCR 114'), 'pokemon');

// MTG list indicators
assert.strictEqual(detectGameType('4 Lightning Bolt (ELD) 123'), 'magic');
assert.strictEqual(detectGameType('Deck\n4 Sol Ring'), 'magic');
assert.strictEqual(detectGameType('Sideboard\n1 Mox Emerald'), 'magic');

console.log('  ✓ Game type detection tests passed.');

// 2. Test Pokemon Deck List Parsing
console.log('  Testing Pokemon deck list parsing...');

const pokemonDeckText = `
Pokemon: 1
4 Hoothoot SCR 114

Trainer: 2
4 Professor's Research
1 Nest Ball

Energy: 1
3 Basic {D} Energy SVE 15
`;

const parsedPokemon = parseDeckList(pokemonDeckText);

assert.strictEqual(parsedPokemon.pokemon.length, 1);
assert.deepStrictEqual(parsedPokemon.pokemon[0], {
    quantity: 4,
    name: 'Hoothoot',
    setCode: 'SCR',
    number: '114',
    fullName: 'Hoothoot SCR 114'
});

assert.strictEqual(parsedPokemon.trainers.length, 2);
assert.strictEqual(parsedPokemon.trainers[0].name, "Professor's Research");
assert.strictEqual(parsedPokemon.trainers[0].quantity, 4);
assert.strictEqual(parsedPokemon.trainers[1].name, 'Nest Ball');
assert.strictEqual(parsedPokemon.trainers[1].quantity, 1);

assert.strictEqual(parsedPokemon.energy.length, 1);
assert.deepStrictEqual(parsedPokemon.energy[0], {
    quantity: 3,
    name: 'Basic Darkness Energy',
    setCode: 'SVE',
    number: '15',
    fullName: 'Basic Darkness Energy SVE 15'
});

console.log('  ✓ Pokemon deck list parsing tests passed.');

// 3. Test MTG Deck List Parsing
console.log('  Testing MTG deck list parsing...');

const mtgDeckText = `
Deck
4 Lightning Bolt (JMP) 342
1 Sol Ring [Commander Legends]
4 Llanowar Elves

Sideboard
1 Mox Emerald (VMA) 5
`;

const parsedMTG = parseDeckList(mtgDeckText);

assert.strictEqual(parsedMTG.cards.length, 3);
assert.deepStrictEqual(parsedMTG.cards[0], {
    quantity: 4,
    name: 'Lightning Bolt',
    setCode: 'JMP',
    number: '342',
    fullName: 'Lightning Bolt (JMP) 342'
});
assert.deepStrictEqual(parsedMTG.cards[1], {
    quantity: 1,
    name: 'Sol Ring',
    setCode: '',
    setName: 'Commander Legends',
    number: '',
    fullName: 'Sol Ring [Commander Legends]'
});
assert.strictEqual(parsedMTG.cards[2].name, 'Llanowar Elves');
assert.strictEqual(parsedMTG.cards[2].quantity, 4);

assert.strictEqual(parsedMTG.sideboard.length, 1);
assert.deepStrictEqual(parsedMTG.sideboard[0], {
    quantity: 1,
    name: 'Mox Emerald',
    setCode: 'VMA',
    number: '5',
    fullName: 'Mox Emerald (VMA) 5'
});

console.log('  ✓ MTG deck list parsing tests passed.');
console.log('✓ All deck-parser.test.js tests passed!');
