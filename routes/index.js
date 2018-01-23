var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Więcej niż oszczędzanie pieniędzy.' });
});

module.exports = router;
