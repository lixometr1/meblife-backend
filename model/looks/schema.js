const mongoose = require('mongoose')
const Schema = mongoose.Schema

const looksSchema = new Schema({
  title: { type: String, required: true },
  body: { type: String }
})

module.exports = looksSchema
