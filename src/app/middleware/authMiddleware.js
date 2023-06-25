const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    // console.log(req);
    // const token = req.cookies.jwt;
    const token = req.headers.authorization;
    if (token) {
        jwt.verify(token, 'quizone secret', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                // res.redirect('/auth/login');
                res.json({
                    status: "error",
                    error: "AUTHENTICATION_FAILED",
                })
            } else {
                let user = await User.findById(decodedToken.id);
                req.user = user;
                console.log(decodedToken);
                next();
                // res.send("True");
            }
        });
    } else {
        // res.redirect('/auth/login');
        // next();
        res.send("Error");
        res.json({
            status: "error",
            error: "Not Login",
        })
    }
}

const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, 'quizone secret', async (err, decodedToken) => {
            if (err) {
                console.log(err);
                req.user = null;
                res.locals.user = null;
                next();
            }
            else {
                // console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                req.user = user;
                // console.log(user);
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };