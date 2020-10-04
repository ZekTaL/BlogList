const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [ 
  { 
    title: "React patterns", 
    author: "Michael Chan", 
    url: "https://reactpatterns.com/", 
    likes: 7,
    user: "5f78314706dafc4c5c60220b"
  },
  {
    title: "Go To Statement Considered Harmful", 
    author: "Edsger W. Dijkstra", 
    url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html", 
    likes: 5,
    user: "5f78314706dafc4c5c60220b"
  }, 
  { 
    title: "Canonical string reduction", 
    author: "Edsger W. Dijkstra", 
    url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html", 
    likes: 12,
    user: "5f78314706dafc4c5c60220b"
  }, 
  {
    title: "First class tests", 
    author: "Robert C. Martin", 
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll", 
    likes: 10,
    user: "5f78312a06dafc4c5c60220a"
  }, 
  {
     title: "TDD harms architecture", 
     author: "Robert C. Martin", 
     url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html", 
     likes: 0,
     user: "5f78312a06dafc4c5c60220a"
  }, 
  { 
    title: "Type wars", 
    author: "Robert C. Martin", 
    url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html", 
    likes: 2,
    user: "5f78312a06dafc4c5c60220a"
  }
]

const nonExistingId = async () => {
  const blog = new Blog({ 
    title: "WillRemoveItSoon", 
    author: "Admin", 
    url: "---", 
    likes: 100
  })
  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb
}