var express = require('express');
var http = require('http');
var router = express.Router();

var getPageContent = function (succ) {
    http.get(
        'http://jakoszczedzacpieniadze.pl',
        (getRes) => {
            getRes.setEncoding('utf8');
            let fullPage = '';
            getRes.on('data', (chunk) => {
                fullPage += chunk;
            })
            getRes.on('end', () => {
                succ(fullPage);
            })
        }
    );
}

router.get('/', function (req, res, next) {
    getPageContent(content => {
        res.json({ 'respond': content });
    });
});

module.exports = router;
