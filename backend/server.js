
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(8080);  // when push to heroku, this will be process.env.PORT
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
  socket.emit('render', {page:'homepage'});
  socket.on('cmd', function (data) {
    console.log(data);
  });

  // server side, logging in
  socket.on('login', function(email, password) {
    passport.authenticate('local', function (error, user) {
      if (error) socket.emit('error', { msg: 'Login error'})
      else { // success
        socket.emit('render', {page:'docList', id: user._id})
      }
    })
  })

  // server side, saving a user
  socket.on('signup', function (email, password, name) {
    const newUser = new User({
      email: email,
      password: password,
      name: name
    });
    newUser.save(function(error, user) {
      if (error) socket.emit('error', { msg: 'Login error'})
      else { // successful save
        socket.emit('render', {page:'homepage'});
      }
    });
  })

});
