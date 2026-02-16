import userModel from '../models/user.model.js';


export const createUser = async ({
    email, password
}) => {

    if(!email || !password) {
        throw new Error('Email and Password are required');
    }

    const hashed = await userModel.hashpassword(password)

    const user = await userModel.create({
        email,
        password : hashed
    });

    return user;
    
}

export const getAllUsers = async ({userId}) => {
    const users = userModel.find({
        _id : {$ne : userId}
    });
    return users;
}