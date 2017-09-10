const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const Schema = mongoose.Schema;
const Types = Schema.Types;


const Account = new Schema({
  username: { type: Types.String, required: true },
  password: { type: Types.String, required: true },
  firstName: { type: Types.String, required: true },
  lastName: { type: Types.String, required: true },
  email: { type: Types.String, required: true },
});

Account.plugin(passportLocalMongoose);
module.exports = { Account: mongoose.model("Account", Account) };
