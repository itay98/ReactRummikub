const router = require('express').Router();
const { addUser, getUserAttById, checkCred, getUserGames, checkUnique, updateField, unlockPremAv, login, weeklyWinningsLB,
    forgotCred, resetPass, joinGame, addPoints, sendActEm, contact, topBalanceLB } = require("../controllers/users");

router.post('/', (req, res) => addUser(req.body, res));
router.post('/addPoints', (req, res) => addPoints(req.body, res));
router.post('/login', (req, res) => login(req.body, res));
router.post('/contact', (req, res) => contact(req.body, res));
router.post('/startGame', (req, res) => joinGame(req.body, res));
router.post('/unlockPremAv', (req, res) => unlockPremAv(req.body, res));
router.put('/update', (req, res) => updateField(req.body, res));
router.put('/resetPass', (req, res) => resetPass(req.body, res));
router.get('/', (req, res) => getUserAttById(req.query, res));
router.get('/games', (req, res) => getUserGames(req.query.id, res));
router.get('/checkCred', (req, res) => checkCred(req.query, res));
router.get('/sendActEm', (req, res) => sendActEm(req.query, res));
router.get('/forgot', (req, res) => forgotCred(req.query.e, res));
router.get('/checkUnique', (req, res) => checkUnique(req.query, res));
router.get('/topBalance', (req, res) => topBalanceLB(req.query.id, res));
router.get('/weeklyWinnings', (req, res) => weeklyWinningsLB(res));
module.exports = router;