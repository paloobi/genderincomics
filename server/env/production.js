module.exports = {
    "DATABASE_URI": process.env.MONGOLAB_URI,
    "SESSION_SECRET": process.env.SESSION_SECRET,
    "COMIC_VINE": {
        "API_KEY": process.env.COMIC_VINE_API_KEY,
        "BASE_URL": process.env.COMIC_VINE_BASE_URL
    }
};