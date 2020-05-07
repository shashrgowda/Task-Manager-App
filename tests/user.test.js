const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const { setupDB, user1, user1Id } = require('./fixtures/db');

beforeEach(setupDB)

test('Sign up a new user', async () => {
   const res = await request(app).post('/users').send({
        name: "Shashank R",
        email: "shashankr6@gmail.com",
        password: "welcome1234"
    })
    .expect(201)

    const user = await User.findById(res.body.user._id)
    expect(user).not.toBeNull()

    expect(res.body).toMatchObject({
        user: {
            name:'Shashank R',
            email: 'shashankr6@gmail.com'
        },
        token: user.tokens[0].token
    })
})

test('Login', async () => {
   const response = await request(app).post('/users/login').send({
        email: user1.email,
        password: user1.password
    }).expect(200)

    const user = await User.findById(user1Id)

    expect(response.body.token).toBe(user.tokens[1].token)
    
})

test('Disallow non-existent user', async () => {
    await request(app).post('/users/login').send({
        email: 'naanu@gmail.com',
        password: 'naanu12344'
    }).expect(400)
})

test('Get user profile', async () => {
    await request(app).get('/users/me')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)
})

test('dont get user profile', async () => {
    await request(app).get('/users/me')
    .send()
    .expect(401)
})

test('Delete user account', async () => {
   const response = await request(app).delete('/users/me')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(200)

    const user = await User.findById(user1Id)

    expect(user).toBeNull()
})

test('Dont delete user', async () => {
    request(app).delete('/users/me')
    .send()
    .expect(500)
})

test('Upload avatar', async () => {
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .attach('avatar', './tests/fixtures/IMG-20200222-WA0001.jpg')
    .expect(200)

    const user = await User.findById(user1Id)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Update user fields', async () => {
    await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send({
        name: "Kenneth Anderson",
        age: 29
    })
    .expect(200)

    const user = await User.findById(user1Id)
   
    expect(user).toMatchObject({
        name: "Kenneth Anderson"
    })
})

test('dont update user fields', async () => {
    await request(app).patch('/users/me')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send({
        location: 'Rajajinagar'
    })
    .expect(400)
})