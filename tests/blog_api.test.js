const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

// BEFORE EACH TEST, RESET THE DB
beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.initialBlogs) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

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

describe('adding a new blog', () => {
  test('succeeds with valid data', async () => {
    const newBlog = { 
      title: "Test for adding new blogs", 
      author: "Fra", 
      url: "---", 
      likes: 100
    }
  
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const blogsWithoutId = blogsAtEnd.map(({ title, author, url, likes }) => ({ title, author, url, likes }))
    expect(blogsWithoutId).toContainEqual(newBlog)
  })

  test('fails with status code 400 if data invaild', async () => {
    const newBlogWithoutTitleAndUrl = { 
      author: "Fra", 
      likes: 10
    }
  
    await api
      .post('/api/blogs')
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
      .send(newBlogWithoutLikes)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  
    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
  
    const newBlogSaved = blogsAtEnd.find(blog => blog.title === newBlogWithoutLikes.title && blog.author === newBlogWithoutLikes.author && blog.url === newBlogWithoutLikes.url)
    expect(newBlogSaved.likes).toBe(0)
  })
})

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
})

// AFTER ALL TEST, CLOSE DB CONNECTION
afterAll(() => {
  mongoose.connection.close()
})