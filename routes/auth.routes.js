const router = require("express").Router();
const User = require('../models/User.model');
const bcrypt = require('bcrypt');
const passport = require('passport');

router.get("/", (req, res, next) => {
    res.render("../views/index")
})

router.get("/signup", (req, res, next) => {
    res.render("../views/signup");
  });

  router.get("/login", (req, res, next) => {
    res.render("../views/login");
  });

router.post( '/login', (req, res, next) => {
    passport.authenticate('local', (err, theUser, failureDetails) =>
    {
        if (err){
            return next(err);
        }

        if (!theUser) {
            res.render('login', { message: 'Invalid credentials'});
            return;
        }

        req.login(theUser, err => {
            if (err) {
                return next(err);
            }
            res.redirect("/private");
        })
  }) (req, res, next);
});

// router.post("/login", (req, res) => {
//     const { username, password } = req.body;
//     User.findOne({ username: username })
//         .then(userFromDB => {
//             if (userFromDB === null) {
//                 res.render('login', {message: 'Invalid credentials'});
//                 return;
//             }

//             if (bcrypt.compareSync(password, userFromDB.password)) {
//                 console.log(req.session)
//                 req.session.user = userFromDB;
//                 res.redirect("/private");
//             } else {
//                 res.render('login', { message: 'Invalid credentials'});
//             }

//         })
// })

router.get("/private", (req, res) => {
    if (!req.user) {
        res.redirect('/login');
        console.log('PRIVATE!')
        return;
    } else
        res.render("../views/private", {user:req.user});
  });

router.get("/main", (req, res, next) => {
    if (!req.user) {
        res.redirect('/login');
        console.log('PRIVATE!')
        return;
    } else
        res.render("../views/main", {user:req.user})
})

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