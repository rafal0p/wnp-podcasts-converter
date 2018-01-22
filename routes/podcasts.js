var express = require('express');
var request = require('request');
var htmlparser = require('htmlparser');
var select = require('soupselect').select;
var html = require('htmlparser-to-html');
var Epub = require("epub-gen");
const path = require('path');
var fs = require('fs');

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

var validatePodcastName = (name, cb) => {
    if (!name.startsWith('wnp')) {
        cb({ err: 'Invalid filename prefix.' });
    } else if (
        !name.endsWith('epub')
        || name.endsWith('mobi')
    ) {
        cb({ err: 'Invalid filename extension.' });
    } else if (/^wnp\d\d\d\d[.epub|.mobi]$/.test(name)) {
        cb({ err: 'Invalid filename format.' });
    } else {
        const matched = /^wnp(\d\d\d)\.(.{4})$/.exec(name);
        cb(null, matched[1], matched[2]);
    }
}

var validatePodcastNumber = (number, cb) => {
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

router.get('/:podcastName', (req, res, next) => {
    validatePodcastName(req.params.podcastName, (err, number, extension) => {
        if (err) {
            res.send(err);
        } else {
            validatePodcastNumber(number, (err) => {
                if (err) {
                    res.send(err);
                } else {
                    const parentDir = path.join(__dirname, "../");
                    const filename = 'wnp' + number + '.epub';
                    const fullName = parentDir + '/' + filename;
                    fs.exists(fullName, (exists) => {
                        if (exists) {
                            res.download(fullName, filename);
                        } else {
                            getPodcast(number, (err) => {
                                if (err) {
                                    res.send(err);
                                } else {
                                    res.download(fullName, filename);
                                }
                            });
                        }
                    })
                }
            })
        }
    })
});

module.exports = router;
