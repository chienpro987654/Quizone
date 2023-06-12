const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req,res,next)=>{
    const token = req.cookies.jwt;
    if (token){
        jwt.verify(token,'quizone secret',(err, decodedToken)=>{
            if (err) {
                console.log(err.message);
                res.redirect('/auth/login');
            } else {
                // console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/auth/login');
    }
}

const checkUser = (req,res,next) => {
    const token = req.cookies.jwt;
    if (token){
        jwt.verify(token,'quizone secret',async (err, decodedToken)=>{
            if (err) {
                console.log(err);
                res.locals.user = null;
                next();
            }
            else {
                // console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                // console.log(user);
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = {requireAuth,checkUser};