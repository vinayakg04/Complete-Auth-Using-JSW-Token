const User = require('../models/User')
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import UserModel from '../models/User';
import transporter from '../config/emailConfig';

class UserController {
    static userRegistration = async (req, res) => {
        const { name, email, password, password_confirmation, tc } = req.body;
        const user = await UserModel.findOne({ email: email })

        //If email of the user already exists
        if (user) {
            res.status(201).send({ "status": "failed", "message": "Email already exists" })
        }
        else {
            if (name && email && password && password_confirmation && tc) {
                if (password === password_confirmation) {

                    try {
                        const salt = await bcrypt.genSalt(10);
                        const hashPassword = bcrypt.hash(password, salt)

                        const doc = new UserModel({
                            name: name,
                            email: email,
                            password: password,
                            tc: tc
                        })

                        await doc.save()
                        const saved_user = await UserModel.findOne({ email: email })

                        //Generate jwt token
                        const token = jwt.sign({ userId: saved_user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" })

                        res.status(201).send({ "status": "success", "message": "Registration Success", "token": token })

                    } catch (e) {
                        res.send({ "status": "failed", "message": "Unable to Register" })

                    }
                }


                else {
                    res.send({ "status": "failed", "message": "Invalid Credentials" })
                }

            }
            else {
                res.send({ "status": "failed", "message": "All fields are required" })
            }

        }



    }
    static userLogin = async () => {
        try {
            const { email, password } = req.body()
            if (email && password) {
                const user = await UserModel.findOne({ email: email })
                if (user != null) {
                    const isMatch = await bcrypt.compare(password, user.password)

                    if ((user.email === email) && isMatch) {

                        //generate jwt token
                        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" })
                        res.send({ "status": "success", "message": "Login Succesful", "token": token })
                    }
                    else {
                        res.send({ "status": "failed", "message": "Invalid Credentials" })
                    }
                }
                else {
                    res.send({ "status": "failed", "message": "You are not a registered user" })
                }
            }
            else {
                res.send({ "status": "failed", "message": "All fields are mandatory" })
            }
        } catch (error) {
            console.log(error)

        }
    }

    //User know the password and wants to change it
    static changeUserPasssword = async (req, res) => {
        const { password, password_confirmation } = req.body
        if (password && password_confirmation) {

            if (password !== password_confirmation) {
                res.send({ "status": "failes", "message": "New password and confirm password doesn't match" })
            }
            else {
                const salt = bcrypt.genSalt(password, salt)
                const newHashPassword = await bcrypt.hash(password, salt, { $set: { password: newHashPassword } })

                //middleware is called
                await UserModel.findByIdAndUpdate(req.user._id)

            }
        } else {
            res.send({ "status": "failed", "message": "All the field are mandatory" })
        }
    }

    static loggedUser = async (req, res) => {
        res.send({ "user": req.user })
    }

    static sendUserPasswordResetEmail = async (req, res) => {
        const { email } = req.body
        if (email) {
            const user = await UserModel.findOne({ email: email })
            if (user) {
                const secret = user._id + process.env.JWT_SECRET_KEY
                const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' })
                const link = `http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`

                //send the email
                let info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject: "GeekShops -Password Rest Link"
                    ,
                    html: `<a>Click Here to rest your password</a>`



                })

                //this will be route made in frontend /api/user/reset/:id/:token

                res.send({ "status": "success", "message": "Password Reset Email sent... Please Check your Email" })


            }
            else {
                res.send({ "status": "failed", "message": "Email doesn't exists" })
            }
        }
        else {
            res.send({ "status": "failed", "message": "Email Field is required" })
        }
    }


    static sendUserPasswordReset = async (req, res) => {
        const { password, password_confirmation } = req.body
        const { id, token } = req.params

        const user = await UserModel.findById(id)
        const new_secret = user._id + process.env.JWT_SECRET_KEY

        try {
            jwt.verify(token, new_secret)
            if (password && password_confirmation) {
                if (password !== password_confirmation) {
                    res.send({ "status": "failed", "message": "Email Field is required" })
                }
                else {
                    const salt = bcrypt.genSalt(10)
                    const newHashPassword = await bcrypt.hash(password, salt)

                    await UserModel.findByIdAndUpdate(req.user._id, { $set: { password: newHashPassword } })
                    res.send({ "status": "success", "message": "Password reset successfully" })
                }
            }
            else {
                res.send({ "status": "failed", "message": "All fields are required" })

            }
        } catch (error) {
            console.log(error)

        }


    }

}

export default UserController