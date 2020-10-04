const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const bcrypt = require('bcrypt')
const User = require('../models/user')

// BEFORE EACH TEST, RESET THE DB
beforeEach(async () => {
  // resetting blogs
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }

  // resetting users
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('password', 10)
  const user = new User({ username: 'root', passwordHash })

  await user.save()
})

// WHEN THERE ARE BLOGS SAVED
describe('when there are initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })
  
  test('all blogs are returned', async () => {
      const response = await api.get('/api/blogs')
  
      expect(response.body).toHaveLength(helper.initialBlogs.length)
  })
  
  test('the unique identifier is named id', async () => {
      const response = await api.get('/api/blogs')
  
      for (let blog of response.body)
      {
        expect(blog.id).toBeDefined()
      }
  })
})

// VIEWING A SPECIFIC BLOG
describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const processedBlogToView = JSON.parse(JSON.stringify(blogToView))

    expect(resultBlog.body).toEqual(processedBlogToView)
  })

  test('fails with statuscode 404 if note does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()
    console.log(validNonexistingId)

    await api
      .get(`/api/blogs/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

// ADDING A BLOG
describe('adding a new blog', () => {
  // login before the tests
  let auth = ''
  beforeEach(async () => {
    const rootUser = {
      username: "root",
      password: "password"
    }

    const loginResult = await api
      .post('/api/login')
      .send(rootUser)

    auth = 'bearer ' + loginResult.body.token
  })

  test('succeeds with valid login and data', async () => {
    const newBlog = { 
      title: "Test for adding new blogs", 
      author: "Fra", 
      url: "---", 
      likes: 100
    }

    await api
      .post('/api/blogs')
      .set('Authorization', auth)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
      
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const blogsWithoutId = blogsAtEnd.map(({ title, author, url, likes }) => ({ title, author, url, likes }))
    expect(blogsWithoutId).toContainEqual(newBlog)
  })

  test('fails with status code 401 if token is invalid or missing', async () => {
    const newBlog = { 
      title: "Not working without the token", 
      author: "Fra", 
      url: "---", 
      likes: 10
    }
  
    await api
      .post('/api/blogs')
      //.set('Authorization', auth)
      .send(newBlog)
      .expect(401)
  
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('fails with status code 400 if data invaild', async () => {
    const newBlogWithoutTitleAndUrl = { 
      author: "Fra", 
      likes: 10
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', auth)
      .send(newBlogWithoutTitleAndUrl)
      .expect(400)
  
      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('if likes is missing the default is 0', async () => {
    const newBlogWithoutLikes = { 
      title: "Blog without likes", 
      author: "Fra", 
      url: "---"
    }
  
    await api
      .post('/api/blogs')
      .set('Authorization', auth)
      .send(newBlogWithoutLikes)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const newBlogSaved = blogsAtEnd.find(blog => blog.title === newBlogWithoutLikes.title && blog.author === newBlogWithoutLikes.author && blog.url === newBlogWithoutLikes.url)
    expect(newBlogSaved.likes).toBe(0)
  })
})

/*// DELETING A BLOG
describe('deleting a new blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
    expect(blogsAtEnd).not.toContainEqual(blogToDelete)
  })
})*/

// CHECKING USERS
describe('when there is initially one user in db', () => {
  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'zekt',
      name: 'Francesco',
      password: 'password',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'password',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })
})

// AFTER ALL TEST, CLOSE DB CONNECTION
afterAll(() => {
  mongoose.connection.close()
})