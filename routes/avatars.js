const router = require('express').Router();
const { getAvByNN,getPremAv } = require("../controllers/avatars");

router.get('/nickname', async (req, res) => getAvByNN(req.query.name, res));
router.get('/premAv', async (req, res) => getPremAv(res));
module.exports = router;