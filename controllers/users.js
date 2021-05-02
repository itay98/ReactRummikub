const { User, gt, sequelize } = require("../models");
const { v4 } = require('uuid'), bcrypt = require('bcrypt');
const eTP = require('../utils/email'), myEmail = 'React Rummikub ' + process.env.MAILUSER;
const { joinRoom } = require('../utils/rooms');
//setInterval(() => User.destroy({ where: { active: null } }), 1000000000);
async function joinGame({ id, token, players, points }, res) {
    try {
        const user = await User.findByPk(id);
        if (user === null)
            res.send('user id does not exist');
        else {
            const { token: t, balance, username } = user;
            if (token !== t)
                res.send('problem with credentials');
            else
                if (balance < points)
                    res.send('you dont have enough points');
                else {
                    const { image } = await user.getAvatar();
                    joinRoom({ id, username, image }, players, points);
                    res.send();
                }
        }
    } catch (error) {
        console.error(error)
    }
}
function activationEmail(id, token, email) {
    eTP.sendMail({
        from: myEmail, to: email, subject: 'Verification', html: `<div dir="ltr" style="text-align: center">
                <h1>Hello new user!</h1><h2>click the link and wait to see your activation.</h2>
            <a href="https://reactrummikub.netlify.app/activate?i=${id}&t=${token}">activate account</a></div>`
    });
}
async function addUser(data, res) {
    try {
        data.token = v4();
        data.password = await bcrypt.hash(data.password, 8);
        const { id, token, email } = await User.create(data);
        activationEmail(id, token, email);
        res.send({ id, token });
    } catch (error) {
        console.error(error);
    }
}
async function sendActEm({ id, token }, res) {
    try {
        const user = await User.findByPk(id, { attributes: ['token', 'email'] });
        if (user === null)
            res.send('user id not exist');
        else if (user.token !== token)
            res.send('problem with credentials');
        else {
            activationEmail(id, user.token, user.email);
            res.send('Go to your inbox to activate your account');
        }
    } catch (error) {
        console.error(error)
    }
}
async function contact({ id, token, sub, body }, res) {
    try {
        const user = await User.findByPk(id, { attributes: ['token', 'email'] });
        if (user === null)
            res.send('user id not exist');
        else if (user.token !== token)
            res.send('problem with credentials');
        else {
            eTP.sendMail({ to: myEmail, subject: sub, text: body + ' My Email: ' + user.email });
            res.send('Message sent. We will send you an answer email soon');
        }
    } catch (error) {
        console.error(error)
    }
}
async function unlockPremAv({ id, token }, res) {
    try {
        const user = await User.findByPk(id);
        if (user === null)
            res.send('user id not exist');
        else if (user.token !== token)
            res.send('problem with credentials');
        else if (user.balance < 50)
            res.send('you dont have enough points');
        else {
            await user.update({ balance: user.balance - 50, premAv: true });
            res.send();
        }
    } catch (error) {
        console.error(error)
    }
}
async function getUserAttById({ id, a }, res) {
    try {
        const user = await User.findByPk(id, { attributes: a });
        res.send(user);
    } catch (error) {
        console.error(error);
    }
}
async function checkCred({ id, token }, res) {
    try {
        const user = await User.findByPk(id, { attributes: ['token', 'active'] });
        res.send(user && user.token === token && user.active);
    } catch (error) {
        console.error(error);
    }
}
async function checkUnique(field, res) {
    try {
        const user = await User.findOne({ where: field, attributes: ['active'] });
        res.send(user === null);
    } catch (error) {
        console.error(error);
    }
}
async function login({ username, password }, res) {
    try {
        const user = await User.findOne({ where: { username } });
        if (user === null)
            res.send('this username does not exist');
        else if (await bcrypt.compare(password, user.password)) {
            const { id, token, balance, active } = await user.update({ token: v4() });
            res.send({ id, token, balance, active });
        } else
            res.send('that is the wrong password');
    } catch (error) {
        console.error(error)
    }
}
async function forgotCred(email, res) {
    try {
        const user = await User.findOne({ where: { email } });
        if (user === null)
            res.send('this email does not exist');
        else {
            const { id, token, username } = user;
            eTP.sendMail({
                from: myEmail, to: email, subject: 'Forgot Credentials', html: `<div dir="ltr" style="text-align: center">
                <h1>Hello, again! Here to remind you.</h1><h2>in case you forgot your username is:"${username}".</h2>
        <h3>if you forgot your password click the link below to change it to a new password</h3>
    <a href="https://reactrummikub.netlify.app/password?i=${id}&t=${token}">reset password</a></div>`
            });
            res.send('follow the email we sent you');
        }
    } catch (error) {
        console.error(error)
    }
}
async function resetPass({ id, token, password }, res) {
    try {
        const user = await User.findByPk(id);
        if (user === null)
            res.send('user id does not exist');
        else if (user.token !== token)
            res.send('problem with credentials');
        else {
            user.password = await bcrypt.hash(password, 8);
            await user.save({ fields: ['password'] });
            res.send('password changed successfully');
        }
    } catch (error) {
        console.error(error)
    }
}
async function updateField({ id, token, ...field }, res) {
    try {
        const user = await User.findByPk(id);
        if (user === null)
            res.send('user id not exist');
        else if (user.token !== token)
            res.send('problem with credentials');
        else {
            await user.update(field);
            res.send('Updated successfully');
        }
    } catch (error) {
        console.error(error)
    }
}
function updateBalance(id, points) {
    User.update({ balance: sequelize.literal('balance' + points) }, { where: { id } }).catch(e => console.log(e));
}
async function addPoints({ id, points }, res) {
    try {
        const user = await User.findByPk(id);
        const { balance } = await user.increment('balance', { by: points });
        res.json(balance);
    } catch (error) {
        console.error(error)
    }
}
async function getUserGames(id, res) {
    try {
        const user = await User.findByPk(id);
        if (user === null)
            res.send('user id does not exist');
        else {
            const games = await user.getGames({ joinTableAttributes: [], attributes: { exclude: ['id', 'updatedAt'] } });
            res.send(games);
        }
    } catch (error) {
        console.error(error)
    }
}
async function topBalanceLB(id, res) {
    try {
        const leaders = await User.findAll({
            attributes: ["id", "balance", "username"], include: { association: 'avatar', attributes: ['image'] },
            order: [["balance", 'DESC']], limit: 3
        });
        if (leaders.every(u => u.id != id)) {
            var { balance, username, avatar: { image } } = await User.findByPk(id, {
                attributes: ["balance", "username"], include: { association: 'avatar', attributes: ['image'] }
            });
            var rank = await User.count({ where: { balance: { [gt]: balance } } }) + 1;
        }
        res.send({ leaders, balance, username, image, rank });
    } catch (error) {
        console.error(error)
    }
}
async function weeklyWinningsLB(res) {
    try {
        const [users] = await sequelize.query(`SELECT MIN(u.username) AS username, SUM(g."pointsWon") AS points,
        MIN(a.image) AS avatar FROM games g, users u, avatars a
        WHERE u.id = g."winnerId" AND a.id = u."avatarId" AND g."createdAt" > NOW() - INTERVAL '7 days'
        GROUP BY u.id ORDER BY points DESC LIMIT 5`);
        res.send(users);
    } catch (error) {
        console.error(error)
    }
}
module.exports = {
    addUser, getUserAttById, checkCred, getUserGames, checkUnique, sendActEm, updateField, unlockPremAv, login,
    forgotCred, resetPass, joinGame, updateBalance, addPoints, contact, topBalanceLB, weeklyWinningsLB
};