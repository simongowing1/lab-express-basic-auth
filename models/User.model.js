// User model here

const { Schema } = require("mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        unique: true
    }
    password: String
})

const User = model("User", userSchema);

mondule.exports = User;