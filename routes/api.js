var express = require('express');
var request = require('request');
var htmlparser = require('htmlparser');
var select = require('soupselect').select;
var html = require('htmlparser-to-html');
var Epub = require("epub-gen");
var router = express.Router();

var getPodcast = (number, cb) => {
    request(
        'http://jakoszczedzacpieniadze.pl/' + number,
        (err, res, body) => {
            var handler = new htmlparser.DefaultHandler();
            var parser = new htmlparser.Parser(handler);
            parser.parseComplete(body);
            var pressrelease = select(handler.dom, 'div.pressrelease-content');
            pressrelease[0].attribs.style = ""; // remove display: none
            var pressreleaseHtml = html(pressrelease)
                .replace(/&nbsp;/g, " ");
            new Epub({
                title: "someebook",
                content: [
                    {
                        title: "sometitle",
                        data: pressreleaseHtml
                    }
                ]
            }, "./some.epub");
            cb(pressreleaseHtml);
        }
    )
};

router.get('/', function (req, res, next) {
    getPodcast('099', (body) => {
        res.json({ 'response': body });
    });
});

module.exports = router;
