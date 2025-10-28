import jwt from 'jsonwebtoken'
import { User } from '../src/models/user.model'

const verifyJWT = async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token) {
            return res.
            status(401)
            .json(
                {error: "Unauthorizes request, token missing"}
            );
        }
    
        const decodedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._d).select(
            "-password -refreshToken"
        );

        if(!user){
            return res.
            status(401)
            .json({
                error: "Invalid access token"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}

export {verifyJWT}