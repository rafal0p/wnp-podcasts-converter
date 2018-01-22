var express = require('express');
var request = require('request');
var htmlparser = require('htmlparser');
var select = require('soupselect').select;
var html = require('htmlparser-to-html');
var Epub = require("epub-gen");
const path = require('path');

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
            var epub = new Epub({
                title: "WNP " + number,
                author: "Michał Szafrański",
                content: [
                    {
                        title: "Treść podcastu",
                        data: pressreleaseHtml
                    }
                ]
            }, "./wnp" + number + ".epub");
            epub.promise.then(() => {
                cb(pressreleaseHtml);
            },
            (err) => {
                console.log(err);
            }
        )
        }
    )
};

router.get('/', function (req, res, next) {
    getPodcast('099', (body) => {
        res.json({ 'response': body });
    });
});

router.get('/:number', (req, res, next) => {
    getPodcast(req.params.number, (body) => {
        var parentDir = path.join(__dirname, "../");
        var filename = 'wnp' + req.params.number + '.epub';
        res.sendFile(parentDir + '/' + filename);
    });
});

module.exports = router;
