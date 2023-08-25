const { mongoose } = require('mongoose')
const { Schema } = mongoose
//Define the schema
const UserSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    tc: {
        type: Boolean,
        required: true
    },

})

const UserModel = mongoose.model("User", UserSchema)

module.exports = UserModel