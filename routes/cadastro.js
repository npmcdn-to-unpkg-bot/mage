var express = require('express');
var passport = require('passport');
var Usuario = require('../models/usuario');
var router = express.Router();

router.post('/', function(req, res) {
    Usuario.register(new Usuario({ username : req.body.username, nome: req.body.nome }), req.body.password, function(err, account) {
        if (err) {
            //return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            //res.redirect('/');
        });
    });
});

module.exports = router;