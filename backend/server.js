
var express = require('express');
var path = require('path')
var app = express()
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
const port = 3000;
// when push to heroku, this will be process.env.PORT
// require something else for socket variable?//
// which day/exercise did we do for sockets?
// slapjack, week 5
// getting rid of linter? remove eslintrc

app.use(express.static(path.join(__dirname, 'src')));  //tells express where to find my frontend code
app.use(bodyParser.json())

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('./models.js');
var User = models.User
var Doc = models.Doc

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

app.post('/login',
passport.authenticate('local'),
function(req, res) {
  // If this function gets called, authentication was successful.
  res.json({success: true, userId: req.user.id}); // `req.user` contains the authenticated user.
})

// server side, saving a user
app.post('/signup', function(req, res) {
  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    docs: []
  });
  newUser.save(function(error, user) {
    if (error) {
      res.json({success:false})
    }//send error?
    else {
      //successful login
      res.json({success: true})
    }
  })
});

app.post('/newDoc', function(req, res) {
  const newDoc = new Doc ({
   owner: req.body.userId,
    title: req.body.title,
    password: req.body.password,
    collaborators: [req.body.userId],
    text: {}
  });

  newDoc.save(function(err, success) {    /* REWRITE: .then()s instead of if/elses */
    if (err) {res.json({success: false})}
    else {
      var userDocs;
      User.findById(req.body.userId, function(error, user) {
        if (error) {res.json({success: false})}
        else {
          userDocs = user.docs.slice();
          userDocs = userDocs.push(success._id);  //success._id is id of doc that was just saved

          User.findByIdAndUpdate(req.body.userId, {docs: userDocs}, function(error2, result2) {
            if (error2) {res.json({success: false})}
            else res.json({success: true, docId: success._id})
          })
        }
      })
    }
  })
})

app.post('/saveFile/:docId', function(req, res) {
  Doc.findByIdAndUpdate(req.params.docId, {text: req.body.text}, function(err, success) {
    if (err) res.status(404)
    else res.json({success: true})
  })
})

app.post('/joinDoc', function(req, res) {
  let previousCollabs;
  let previousDocs;
  Doc.findOne({_id:req.body.docId,password:req.body.password}, function(error, foundDoc) {
    if (error) {
      console.log(error)
      res.json({success:false})
    } else {  //identified that password is correct
      previousCollabs = foundDoc.collaborators.slice();
      previousCollabs.push(req.body.userId)
      console.log('collab', previousCollabs);
      Doc.findByIdAndUpdate(req.body.docId, {collaborators: previousCollabs}, function(err2,result) {
        if (err2) {
          console.log(error)
          res.json({success:false})
        } else {
          User.findById(req.body.userId, function(err3, result3) {
            previousDocs = result3.docs.slice()
            previousDocs.push(req.body.docId)
            console.log('doc', previousDocs)
            User.findByIdAndUpdate(req.body.userId, {docs:previousDocs}, function(err4,result4) {
              if (err4) {
                console.log(error)
                res.json({success:false})
              } else {
                res.json({success:true})
              }
            })
          })
        }
      })
    }
  })
})

// retrieves all docs that a user has access to as owner or collaborator
app.get('/getDocList/:userId', function (req, res) {
  User.findById(req.params.userId, function(error, user) {
    if (error) res.status(404);
    else {
      return Promise.all(user.docs.map((docId) => {
        return Doc.findById(docId).exec()
      }))
      .then(arr => {
        res.json({success: true, docs: arr})})
      .catch(err=> console.log(err))
    }
  })
})

app.get('/documentview/:userId/:docId', function(req, res) {
  //consider case where userId does not have persmission to view this doc (not an owner or collaborator)
  Doc.findById(req.params.docId, function(error, foundDoc) {
    if (error) res.status(404)
    else {
      res.json(foundDoc) //foundDoc has keys owner, title, password, collaborators, text
    }
  })
})

io.on('connection', function (socket) {
  socket.on('makeChange', function(data) {
    socket.broadcast.emit('receiveChange', {text:data.text))
  })
}

server.listen(port)
