var mongoose = require('mongoose');

// Remember to add your MongoDB information in one of the following ways!
if (! process.env.MONGODB_URI) {
  console.log('Error: MONGODB_URI is not set. Did you run source env.sh ?');
  process.exit(1);
}

var connect = process.env.MONGODB_URI;
mongoose.connect(connect);

var userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  docs: {
    type: Array
  },
  color: {
    type: String
  }
});

var docSchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  collaborators: {
    type: Array,
    required: true
  },
  revision: {
    type: Array
  },
  viewer1: String,
   viewer2: String,
   viewer3: String,
   viewer4: String,
   viewer5: String,
   viewer6: String
});


var User = mongoose.model('User', userSchema);
var Doc = mongoose.model('Doc', docSchema);

module.exports = {
  User: User,
  Doc: Doc
};
