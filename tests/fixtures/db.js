const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Task = require('../../src/models/task');


const user1Id = new mongoose.Types.ObjectId()

const user1 = {
    _id: user1Id,
    name: 'Phoolandevi',
    email: 'example@email.com',
    password: 'cutting123',
    tokens: [{
        token: jwt.sign({_id: user1Id}, process.env.JWT_SECRET)
    }]
}

const user2Id = new mongoose.Types.ObjectId()

const user2 = {
    _id: user2Id,
    name: 'Phoolandevi',
    email: 'gmail@email.com',
    password: 'cutting123',
    tokens: [{
        token: jwt.sign({_id: user2Id}, process.env.JWT_SECRET)
    }]
}

const task1 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Jest do it!',
    completed: false,
    author: user1Id
}

const task2 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Jestin Beiber',
    completed: true,
    author: user1Id
}

const task3 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Jestice League',
    completed: true,
    author: user2Id
}

const setupDB = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(user1).save()
    await new User(user2).save()
    await new Task(task1).save()
    await new Task(task2).save()
    await new Task(task3).save()
}

module.exports = {
    setupDB,
    user1,
    user1Id,
    user2,
    user2Id,
    task3,
    task2,
    task1
}