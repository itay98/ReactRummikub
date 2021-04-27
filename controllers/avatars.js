const { Avatar } = require("../models");
async function getAvByNN(nickname, res) {
    try {
        const avatar = await Avatar.findOne({ attributes: ["id", "image"], where: { nickname } });
        res.send(avatar);
    } catch (error) {
        console.error(error)
    }
}
async function getPremAv(res) {
    try {
        const avatars = await Avatar.findAll({
            attributes: ["id", "image", "nickname"], order: ["nickname"], where: { premium: true }
        });
        res.send(avatars);
    } catch (error) {
        console.error(error)
    }
}
module.exports = { getAvByNN, getPremAv };