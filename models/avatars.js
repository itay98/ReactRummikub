module.exports = (sequelize, DT) => sequelize.define('avatar', {
    image: { type: DT.TEXT, allowNull: false },
    nickname: { type: DT.STRING, unique: true, },
    premium: { type: DT.BOOLEAN }
});