const express = require('express');
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth');


router.post('/tasks',auth, async (req, res) => {

    const task = new Task({
        ...req.body,
        author: req.user._id
    })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (error) {
        res.status(400).send(err)
    }

})

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate()

        res.send(req.user.tasks)
    } catch (error) {
        res.status(404).send('Not found')
    }

})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {

        const task = await Task.findOne({ _id, author: req.user._id })

        if(!task){
            return res.status(404).send()
        }

        res.send(task)

    } catch (error) {

        res.status(500).send()

    }

})

router.patch('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id

    const updates = Object.keys(req.body)
    const fields = ['description', 'completed']
    const isValidUpdate = updates.every(valid => fields.includes(valid))

    if(!isValidUpdate){
        return res.status(404).send({error: 'Invalid Updates!'})
    }

    try {
        const task = await Task.findOne({ _id: id, author: req.user._id })

        if(!task){
            return res.status(404).send()
        }

        updates.forEach(update => task[update] = req.body[update])

        await task.save()


        res.send(task)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req,res) => {
    const id = req.params.id

    try {
        const task = await Task.findOneAndDelete({ _id: id, author: req.user._id})

        if(!task){
            return res.status(404).send({error :'Task not found'})
        }

        res.send(task)
    } catch (error) {
        res.status(500).send(error)
    }
})

module.exports = router