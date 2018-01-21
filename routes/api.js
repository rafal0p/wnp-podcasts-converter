var express = require('express');
var request = require('request');
var router = express.Router();

router.get('/', function (req, res, next) {
    request(
        'http://jakoszczedzacpieniadze.pl',
        (err, _, body) => {
            res.json({ 'respond': body });
        }
    )
});

module.exports = router;
