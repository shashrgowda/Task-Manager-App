const request = require('supertest');
const Task = require('../src/models/task');
const app = require('../src/app');
const { setupDB, user1, user1Id, user2, user2Id, task3, task2, task1 } = require('./fixtures/db');

beforeEach(setupDB)

test('Create task', async () => {
    const response = await request(app).post('/tasks')
                    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
                    .send({
                        description: 'Jest test'
                    })
                    .expect(201)

    const task = await Task.findById(response.body._id)
    expect(task).not.toBeNull()
    expect(task.completed).toEqual(false)
})


test('Get tasks', async () => {
    const response = await request(app).get('/tasks')
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .expect(200)

    expect(response.body.length).toBe(2)
})


test('Delete unauthorized', async () => {
   const res = await request(app).delete(`/tasks/${task3._id}`)
    .set('Authorization', `Bearer ${user1.tokens[0].token}`)
    .send()
    .expect(404)

    const task = await Task.findById(task3._id)
    expect(task).not.toBeNull()
})