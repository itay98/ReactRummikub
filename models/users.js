module.exports = (sequelize, DT) => sequelize.define('user', {
    username: { type: DT.STRING, unique: true },
    password: { type: DT.STRING },
    email: { type: DT.STRING, unique: true },
    token: { type: DT.UUID },
    balance: { type: DT.SMALLINT, defaultValue: 20 },
    active: { type: DT.BOOLEAN },
    premAv: { type: DT.BOOLEAN }
});