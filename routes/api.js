var express = require('express');
var request = require('request');
var router = express.Router();

var getPodcast = (number, cb) => {
    request(
        'http://jakoszczedzacpieniadze.pl/' + number,
        (err, res, body) => {
            cb(body);
        }
    )
};

router.get('/', function (req, res, next) {
    getPodcast('099', (body) => {
        res.json({ 'respondx': body });
    });
});

module.exports = router;
