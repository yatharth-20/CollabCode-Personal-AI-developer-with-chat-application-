import jwt from 'jsonwebtoken';
import redisClient from '../services/redis.service.js';


export const authUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token || (req.headers.authorization ? req.headers.authorization.split(' ')[ 1 ] : null);

        if(!token)
            return res.status(401).send({error : "Unauthorized User"});
        
        let isBlackListed = null;
        try {
            isBlackListed = await redisClient.get(token);
        } catch (_err) {
            
            isBlackListed = null;
        }

        if(isBlackListed) {

            res.cookie('token', '');

            return res.status(401).send({error : "Unauthorized User"});
        }
        
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();

    } catch (error) {

        console.log(error);

        return res.status(401).send({error : "Unauthorized User"});
    }
} 