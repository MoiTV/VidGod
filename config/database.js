if (process.env.NODE_ENV === 'production') {
    module.exports = {
        mongoURI: 'mongodb+srv://moises559:xbox360559!@cluster1-lg2g9.mongodb.net/test?retryWrites=true&w=majority'
    }
} else {
    module.exports = {
        mongoURI: 'mongodb://localhost/vidjod-dev'
    }
}