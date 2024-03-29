const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Translation = require('../Translation')
const AttributeSchema = new Schema({
  name: [Translation],
  // values: [
  //   {
  //     type: Schema.Types.ObjectId,
  //     ref: "AttributeValue"
  //   }
  // ],

  // decimal - range slider, values - обычное значение
  attribute_type: {
    type: String,
    default: "values"
  },
  slug: [Translation],
  groupId: {
    type: Schema.Types.ObjectId,
    ref: 'AttributeGroup'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
})

AttributeSchema.methods.translate = function () {
  
}

module.exports = AttributeSchema
