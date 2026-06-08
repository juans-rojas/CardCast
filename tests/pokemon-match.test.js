const assert = require('assert');
const OverlayServer = require('../src/overlay-server');

console.log('Running pokemon-match.test.js...');

// Mock Socket.io class to verify broadcast emissions
class MockSocketIO {
    constructor() {
        this.emitted = [];
    }
    
    emit(event, data) {
        this.emitted.push({ event, data });
    }
    
    // Helper to get last emitted event of a specific type
    getLastEvent(eventName) {
        const events = this.emitted.filter(e => e.event === eventName);
        return events.length > 0 ? events[events.length - 1].data : null;
    }
    
    // Clear event history
    clear() {
        this.emitted = [];
    }
}

const mockIo = new MockSocketIO();
const server = new OverlayServer(mockIo);

// 1. Initial State Checks
console.log('  Testing initial Pokemon match state...');
const initialState = server.getState().pokemonMatch;
assert.strictEqual(initialState.player1.name, 'Player 1');
assert.strictEqual(initialState.player2.name, 'Player 2');
assert.strictEqual(initialState.player1.prizes, 6);
assert.strictEqual(initialState.player2.prizes, 6);
assert.strictEqual(initialState.currentTurn, 1);
assert.strictEqual(initialState.language, 'en');
console.log('  ✓ Initial state checks passed.');

// 2. Test Stadium Updates
console.log('  Testing stadium updates...');
mockIo.clear();
server.updateStadium('Lost City');
assert.strictEqual(server.getState().pokemonMatch.stadium, 'Lost City');

const stadiumEvent = mockIo.getLastEvent('stadium-update');
assert.ok(stadiumEvent);
assert.strictEqual(stadiumEvent.stadium, 'Lost City');
console.log('  ✓ Stadium update tests passed.');

// 3. Test Match Score and Records
console.log('  Testing score and record updates...');
mockIo.clear();
server.updateMatchScore(1, 2);
server.updatePlayerRecord(2, '2-1-0');

const matchState = server.getState().pokemonMatch;
assert.strictEqual(matchState.player1.matchScore, 2);
assert.strictEqual(matchState.player2.record, '2-1-0');

assert.strictEqual(mockIo.getLastEvent('match-score-update').score, 2);
assert.strictEqual(mockIo.getLastEvent('record-update').record, '2-1-0');
console.log('  ✓ Score and record tests passed.');

// 4. Test Active Pokemon & Bench Updates
console.log('  Testing active Pokemon and bench updates...');
mockIo.clear();

const testActive = { 
    name: 'Pikachu ex', 
    hp: 200, 
    damage: 30,
    ability_name: 'Volt Float',
    ability_text: 'If this Pokemon has any Lightning Energy attached...',
    attack1_name: 'Iron Tail',
    attack1_damage: '30x',
    attack1_text: 'Flip a coin until you get tails...'
};
const testBench = [{ 
    name: 'Charmander', 
    hp: 70,
    attack1_name: 'Scratch',
    attack1_damage: '10'
}, { 
    name: 'Squirtle', 
    hp: 60,
    attack1_name: 'Water Gun',
    attack1_damage: '20'
}];

server.updateActivePokemon(1, testActive);
server.updateBench(2, testBench);

const pokemonState = server.getState().pokemonMatch;
assert.deepStrictEqual(pokemonState.player1.active, testActive);
assert.deepStrictEqual(pokemonState.player2.bench, testBench);

assert.deepStrictEqual(mockIo.getLastEvent('active-pokemon').pokemon, testActive);
assert.deepStrictEqual(mockIo.getLastEvent('bench-update').bench, testBench);
console.log('  ✓ Active Pokemon and bench update tests passed (with ability/attacks).');

// 5. Test Turn Actions
console.log('  Testing turn action state tracking...');
mockIo.clear();

server.updateTurnActions(1, { energy: true, supporter: false, retreat: true });
assert.deepStrictEqual(server.getState().pokemonMatch.player1.turnActions, { energy: true, supporter: false, retreat: true });

let turnActionUpdate = mockIo.getLastEvent('turn-actions-update');
assert.strictEqual(turnActionUpdate.player, 1);
assert.deepStrictEqual(turnActionUpdate.actions, { energy: true, supporter: false, retreat: true });

// Reset turn actions
server.resetTurnActions();
assert.deepStrictEqual(server.getState().pokemonMatch.player1.turnActions, { energy: false, supporter: false, retreat: false });
assert.deepStrictEqual(server.getState().pokemonMatch.player2.turnActions, { energy: false, supporter: false, retreat: false });
assert.ok(mockIo.getLastEvent('turn-actions-reset'));
console.log('  ✓ Turn actions tests passed.');

// 6. Test Prize Cards Taking & Resetting
console.log('  Testing prize cards tracking...');
mockIo.clear();

// Take prize 0 for Player 1
server.takePrize(1, 0);
assert.strictEqual(server.getState().pokemonMatch.player1.prizes, 5);
assert.deepStrictEqual(server.getState().pokemonMatch.player1.prizesTaken, [0]);

let prizeTakenEvent = mockIo.getLastEvent('prize-taken');
assert.strictEqual(prizeTakenEvent.player, 1);
assert.strictEqual(prizeTakenEvent.index, 0);
assert.strictEqual(prizeTakenEvent.remaining, 5);

// Reset prizes
server.resetPrizes();
assert.strictEqual(server.getState().pokemonMatch.player1.prizes, 6);
assert.strictEqual(server.getState().pokemonMatch.player1.prizesTaken.length, 0);
assert.ok(mockIo.getLastEvent('prizes-reset'));
console.log('  ✓ Prize cards tests passed.');

// 7. Test Pokémon Match Bulk State Update
console.log('  Testing bulk state updates...');
mockIo.clear();

const updatePayload = {
    player1: { name: 'Satoshi' },
    player2: { name: 'Shigeru' },
    stadium: 'Lost Vacuum',
    showOverlay: true,
    language: 'es'
};

server.updatePokemonMatch(updatePayload);

const bulkUpdatedState = server.getState().pokemonMatch;
assert.strictEqual(bulkUpdatedState.player1.name, 'Satoshi');
assert.strictEqual(bulkUpdatedState.player2.name, 'Shigeru');
assert.strictEqual(bulkUpdatedState.stadium, 'Lost Vacuum');
assert.strictEqual(bulkUpdatedState.showOverlay, true);
assert.strictEqual(bulkUpdatedState.language, 'es');

assert.deepStrictEqual(mockIo.getLastEvent('pokemon-match-update'), updatePayload);
console.log('  ✓ Bulk state updates tests passed.');

console.log('✓ All pokemon-match.test.js tests passed!');
