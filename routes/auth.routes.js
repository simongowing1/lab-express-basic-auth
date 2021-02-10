const router = require("express").Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');

router.get("/signup", (req, res, next) => {
    res.render("../views/signup");
  });

  router.get("/login", (req, res, next) => {
    res.render("../views/login");
  });

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    User.findOne({ username: username })
        .then(userFromDB => {
            if (userFromDB === null) {
                res.render('login', {message: 'Invalid credentials'});
                return;
            }

            if (bcrypt.compareSync(password, userFromDB.password)) {
                console.log(req.session)
                req.session.user = userFromDB;
                res.redirect("/profile");
            } else {
                res.render('login,', { message: 'Invalid credentials'});
            }

        })
})

router.get("/profile", (req, res, next) => {
    res.render("../views/profile");
  });

router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    console.log (username, password)
    const salt = bcrypt.genSaltSync();
    const hash = bcrypt.hashSync(password, salt);
    User.create({ username: username, password: hash})
    .then(userFromDB => {
        console.log(`User ${userFromDB.username} has been created`);
        res.redirect('/')
    })
})

module.exports = router