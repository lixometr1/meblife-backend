const mongoose = require('mongoose')
const Schema = mongoose.Schema
const DeliveryAddress = new Schema({
  name: String,
  address: String,
  postal_code: String,
  city: String,
  phone: String,
  note: String,
  // is_default: Boolean
})
const Invoice = new Schema({
  company: String,
  nip: String,
  phone: String,
  postal_code: String,
  city: String,
  address: String,
  // is_default: Boolean,

})
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },

  name: String,
  phone: String,
  confirm_key: String,
  is_confirmed: {
    type: Boolean,
    default: false
  },
  // Удалена или нет?
  active: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    default: 'user'
  },
  favourite: [
    {
      ref: "Product",
      type: Schema.Types.ObjectId
    }
  ],
  delivery_addresses: [
    DeliveryAddress
  ],
  invoice_addresses: [
    Invoice
  ],
  // policy
  agreement1: {
    type: Boolean,
    default: true
  },
  // other
  agreement2: {
    type: Boolean,
    default: true
  },
  // languageId: String,
  // currencyId: String,
  created_at: {
    type: Date,
    default: Date.now
  }
})

module.exports = userSchema
