import userModel from '../models/user.model.js';
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';


export const createUserController = async (req, res) => {
    
    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({errors : errors.array() });
    
    try {
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT(); 

        delete user._doc.password;

        res.status(201).json({user, token});

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        const msg = error.errors ? Object.values(error.errors)[0].message : error.message;
        res.status(400).json({ message: msg });
    }
} 


export const loginController = async (req, res) => {

    const errors = validationResult(req);

    if(!errors.isEmpty())
        return res.status(400).json({errors : errors.array() });
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await userModel.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials. User not found."
            })
        }

        const isMatch = await user.isValidPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials. Incorrect password."
            })
        };

        const token = await user.generateJWT();

        delete user._doc.password;

        res.status(200).json({ user, token });
        
    } catch (error) {
        res.status(400).json({ message: error.message });
    }

}


export const profileController = async (req, res) => {
    res.status(200).json({
        user : req.user
    });
}


export const logoutController = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }
        try {
            await redisClient.set(token, 'logout', 'EX',  60 * 60 * 24);
        } catch (_err) {
        }

        res.status(200).json({
            message : 'Logged out successfully'
        });
    } 
    catch (err) {
        console.log(err);
        res.status(400).json({ message: err.message });
    }
}


export const getAllUsersController = async (req, res) => {
    try {

        const loggedInUserId = req.user._id;
        
        const allUsers = await userService.getAllUsers({ userId: loggedInUserId });

        return res.status(200).json({
            users: allUsers
        })
        
    } catch (error) {
        console.log(error)
        res.status(400).json({errors : error.message})
    }
}