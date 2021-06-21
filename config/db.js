if (process.env.NODE_ENV == "production") {
    module.exports = { mongoURI: "mongodb+srv://root:rq2ZRKRdsqV9VpHG@blogapp.kibq8.mongodb.net/blogapp?retryWrites=true&w=majority" }
} else {
    module.exports = { mongoURI: "mongodb://localhost/blogapp" }
}