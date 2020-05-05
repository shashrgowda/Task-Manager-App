const express = require('express');
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');
const { welcomeEmail, accountDelete } = require('../emails/account');

router.post('/users', async (req,res) => {
    const user = new User(req.body)

    try {
        await user.save()
        welcomeEmail(user.email, user.name)
        const token = await user.authToken()
        res.status(201).send({user, token})
    } catch (error) {
        res.status(400).send(error)
    }

})

router.post('/users/login', async (req, res) => {

    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.authToken()
        res.send({ user: user.getPublicProfile(), token })
    } catch (error) {
        res.status(400).send()
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send({success: "Logged out."})
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []

        await req.user.save()

        res.send({success: "Logged out of all devices"})
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req,res) => {
    const _id = req.user._id

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid Updates'})
    }

    try {
        const user = await User.findById(_id)

        updates.forEach(update => req.user[update] = req.body[update])

        await req.user.save()

        res.send(req.user)
    } catch (error) {
        res.status(404).send('User not found.')
    }
})


router.delete('/users/me', auth, async (req, res) => {
    const id = req.user._id

    try {
        await req.user.remove()
        accountDelete(req.user.email, req.user.name)

        res.send(req.user)
    } catch (error) {
        res.status(500).send(error)
    }
})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload an image.'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    
    req.user.avatar = buffer

    await req.user.save()

    res.send()
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined

    await req.user.save()

    res.send()
})

router.get('/users/me/avatar', auth, async (req, res) => {
    try {
        const user = req.user

        if(!req.user.avatar){
            throw new Error('No DP')
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router