const { Game } = require("../models");
async function createGame(pointsLost, pointsWon, duration, winnerId, players) {
    try {
        const game = await Game.create({ pointsLost, pointsWon, duration, winnerId });
        await game.addPlayers(players);
    } catch (error) {
        console.error(error);
    }
}
module.exports = { createGame };