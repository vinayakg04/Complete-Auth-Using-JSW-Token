import { Jwt } from "jsonwebtoken";
import UserModel from "../models/User";

var checkUserAuth = async (req, res) => {
    let token
    const { authorization } = req.headers
    if (authorization && authorization.startsWith('Bearer')) {
        try {

            //Get token from header
            token = authorization.split('')[1]
            //verify token
            const { userID } = jwt.verify(token, process.env.JWT_SECRET_KEY)

            //get user from token
            req.user = await UserModel.findById(userID).select(' -password')
            next()

        } catch (e) {
            console.log(e)
            res.status(401).send({ "status": "failed", "message": "Unauthorized User" })

        }

    }
    if (!token) {
        res.status(401).send({ "status": "Failed", "message": "Unauthorized User,No token" })
    }
}


export default checkUserAuth
