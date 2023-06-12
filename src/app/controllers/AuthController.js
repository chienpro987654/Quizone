const User = require("../models/User");
const jwt = require("jsonwebtoken");

//expired time for jwt here is 3 days, as seconds
const maxAge = 3*24*60*60;

const createToken = (id) => {
    return jwt.sign({ id }, 'quizone secret', {
        expiresIn: maxAge,
    });
}

class AuthController
{
    login(req, res, next) {
        res.render("auth/login");
    }

    signup(req, res, next) {
        res.render("auth/signup");
    }

    logout(req, res, next) {
        res.cookie('jwt','',{maxAge: 1});
        res.redirect("/");
    }

    async login_post(req, res, next) {
        const {email, password} = req.body;
        try {
            const user = await User.login(email,password);
            const token  =  createToken(user._id);
            res.cookie('jwt',token, { httpOnly: true, maxAge: maxAge*1000});//cookie count as milliseconds

            res.redirect("/home");
        } catch (error) {
            console.log(error);
        }
        res.render("auth/login");
    }

    async signup_post(req, res, next) {
        const {email, password} = req.body;
        try {
            var user = await User.create({email, password});
            const token  =  createToken(user._id);
            res.cookie('jwt',token, { httpOnly: true, maxAge: maxAge*1000});//cookie count as milliseconds

            res.redirect("/home");
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = new AuthController;