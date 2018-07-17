
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const port = process.env.PORT || 3000
server.listen(port);  // when push to heroku, this will be process.env.PORT
// require something else for socket variable?//
// which day/exercise did we do for sockets?
// slapjack, week 5
// getting rid of linter? remove eslintrc

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('./models');

// set passport middleware to first try local strategy
passport.use(new LocalStrategy( function (username, password, cb){
  // User model has email, password, name
  models.User.findOne({ email: username }, function (err, user) {
    if (err) {
      console.error(err);
      cb(err);
    } else if (!user) {
      console.log(user);
      cb(null, false, { message: 'Incorrect email. ' });
    } else if (user.password !== password) {
      cb(null, false, { message: 'Incorrect password. ' });
    } else return cb(null, user);
  });
}
));

// session configuration
passport.serializeUser(function(user, done) {
  done(null, user._id);
});
passport.deserializeUser(function(id, done) {
  models.User.findById(id, function(err, user) {
    done(err, user);
  });
});

// connect passport to express via express middleware
app.use(passport.initialize());
app.use(passport.session());



io.on('connection', function (socket) {
  socket.emit('homepage');

  // server side, logging in
  socket.on('login', function(email, password) {
    passport.authenticate('local', function (error, user) {
      if (error) socket.emit('error', { msg: 'Login error'})
      else {  // success
        socket.emit('docList', {id: user._id, docs: user.docs})
      }
    })
  })

  // server side, saving a user
  socket.on('signup', function (email, password, name) {
    const newUser = new User({
      email: email,
      password: password,
      name: name,
      docs: []
    });
    newUser.save(function(error, user) {
      if (error) socket.emit('error', { msg: 'Login error'})
      else { // successful save
        socket.emit('homepage');
      }
    })
  })

  socket.on('goToSignup', function () {
    socket.emit('signup');
  })

  socket.on('goToLogin', function () {
    socket.emit('homepage');
  })

  socket.on('newDoc', function (userId, title, pass) {
    User.findById(userId, function(error, user) {
      if (error) socket.emit('error', {msg: 'error in creating a new doc'})
      else {
        const newDoc = new Doc ({
          owner: userId,
          title: title,
          password: pass,
          collaborators: [],
          text: ''
        });
        newDoc.save(function(err, success) {

        })
      }
    })

  })


});
