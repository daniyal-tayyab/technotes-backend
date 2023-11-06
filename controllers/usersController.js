const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

// @desc Get all users
// @route GET /users
// @access Private
const getAllUsers = asyncHandler(async (req, res) => {
    // select will exclude password in response and lean will send only the json data no other 
    // extra methods etc
    const users = await User.find().select('-password').lean();
    if(!users?.length) {
        return res.status(200).json({message: "No user found"});
    }
    res.status(200).json({users})
});

// @desc Create new user
// @route POST /users
// @access Private
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body;

    // confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        return res.status(400).json({message: 'All fields are required'});   
    }

    // check for duplicates
    const duplicate = await User.findOne({ username }).lean().exec();
    if(duplicate) {
        return res.status(409).json({message: 'Duplicate username'});
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const userObject = { username, password: hashedPassword, roles };
    // create and store new user
    const user = await User.create(userObject);
    if(user) {
        res.status(201).json({message: `New user ${username} created`});
    } else {
        res.status(400).json({message: "Invalid user data recieved"});
    }
});

// @desc Update a user
// @route PATCH /users
// @access Private
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body;
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({message: "All fields are required"});
    }

    const user = await User.findById(id).exec();
    if(!user) {
        return res.status(400).json({message: "User not found!"});
    }

    // Allow updates to original user
    const duplicate = await User.findOne({username}).lean().exec();
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({messgae: "Duplicate username"});
    }

    user.username = username;
    user.roles = roles;
    user.active = active;
    if(password) {
        user.password = await bcrypt.hash(password, 10);
    }
    const updatedUser = await user.save();
    res.status(200).json({message: `${updatedUser.username} updated`});
});

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body;

    if(!id) {
        return res.status(400).json({message: "User id is required"});
    }

    const note = await Note.findOne({user: id}).lean().exec();
    if(note) {
        return res.status(400).json({message: "User has assigned notes"});
    }

    const user = await User.findById(id).exec();

    if(!user) {
        res.status(400).json({message: "User not found"});
    }

    const result = await user.deleteOne();
    const reply = `${result.username} with ID ${result._id} deleted`;
    res.status(200).json(reply);
});

module.exports = {
    getAllUsers,
    createNewUser,
    updateUser,
    deleteUser
};