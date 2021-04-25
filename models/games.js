module.exports = (sequelize, DT) => sequelize.define('game', {
    duration: { type: DT.STRING },
    pointsLost: { type: DT.SMALLINT },
    pointsWon: { type: DT.SMALLINT }
});