var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({'respond': ' with json'});
});

module.exports = router;
