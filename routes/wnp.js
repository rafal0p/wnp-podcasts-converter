var express = require('express');
var request = require('request');
var htmlparser = require('htmlparser');
var select = require('soupselect').select;
var html = require('htmlparser-to-html');
var Epub = require("epub-gen");
const path = require('path');

var router = express.Router();

var getPressRelease = (body) => {
    const handler = new htmlparser.DefaultHandler();
    const parser = new htmlparser.Parser(handler);
    parser.parseComplete(body);
    return select(handler.dom, 'div.pressrelease-content');
}

var getPodcast = (number, cb) => {
    request(
        'http://jakoszczedzacpieniadze.pl/' + number,
        (err, res, body) => {
            if (err) {
                cb(err);
            } else {
                if (res.statusCode == 404) {
                    cb({ err: 'No such podcast yet.' });
                } else {
                    var pressrelease = getPressRelease(body);
                    if (pressrelease.length == 0) {
                        cb({ err: 'No pressrelease.' });
                    } else {
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
                            cb(null);
                        }, (err) => {
                            cb(err);
                        })
                    }
                }
            }
        }
    )
};

var validatePodcast = (number, cb) => {
    const isValid = /^\d\d\d$/.test(number);
    if (isValid) {
        cb();
    } else {
        cb({ err: 'Invalid podcast number.' });
    }
}

router.get('/', function (req, res, next) {
    getPodcast('099', (body) => {
        res.json({ 'response': body });
    });
});

router.get('/:number', (req, res, next) => {
    validatePodcast(req.params.number, (err) => {
        if (err) {
            res.send(err);
        } else {
            getPodcast(req.params.number, (err) => {
                if (err) {
                    res.send(err);
                } else {
                    var parentDir = path.join(__dirname, "../");
                    var filename = 'wnp' + req.params.number + '.epub';
                    res.download(parentDir + '/' + filename, filename);
                }
            });
        }
    })
});

module.exports = router;
