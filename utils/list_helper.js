const { forEach } = require('lodash');
const lodash = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item.likes
    }

    return blogs.length === 0
        ? 0
        : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const result = blogs.find(blog => blog.likes === Math.max(...blogs.map(b => b.likes)))
    const subResult = {"title": result.title, "author": result.author, "likes": result.likes}
    return subResult
}

const mostBlogs = (blogs) => {
    const result = lodash.maxBy(lodash.entries(lodash.countBy(blogs, 'author')), lodash.last)
    const subresult = {"author": lodash.first(result), "blogs": lodash.last(result)}
    return subresult
}

const mostLikes = (blogs) => {
    let AuthorLikes = new Array()
    const groupByAuthors = lodash.groupBy(blogs, 'author')
    lodash.forEach(groupByAuthors, (value, key) => {
        AuthorLikes.push({author: key, likes: lodash.sumBy(value, 'likes')})
    })
    const result = lodash.maxBy(AuthorLikes, 'likes')
    return result
}
  
module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}