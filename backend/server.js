
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

//user colors
var colors = ['LightBlue','LightGray','LightGreen','LightPink','LightSalmon','MediumBlue',
              'MidnightBlue','Olive','Orange','OrangeRed','Pink','Purple','Red','Sienna']
function getRandomIntInclusive() {
  let min = Math.ceil(0);
  let max = Math.floor(colors.length-1);
  return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
}

// server side, saving a user
app.post('/signup', function(req, res) {
  let ind = getRandomIntInclusive()
  const newUser = new User({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    docs: [],
    color: colors[ind]
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
    revision:[],
    viewer1: '',
    viewer2: '',
    viewer3: '',
    viewer4: '',
    viewer5: '',
    viewer6: ''
  });

  newDoc.save(function(err, success) {    /* REWRITE: .then()s instead of if/elses */
    if (err) {res.json({success: false})}
    else {
      var userDocs;
      User.findById(req.body.userId, function(error, user) {
        if (error) {res.json({success: false})}
        else {
          userDocs = user.docs.slice();
          userDocs.push(success._id);  //success._id is id of doc that was just saved

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
  let revisionHistory;
  User.findById(req.body.userId, (err, author) => {
    Doc.findById(req.params.docId)
    .then((foundDoc) => {
      revisionHistory = foundDoc.revision.slice()
      revisionHistory.push({
        time: new Date(),
        text: req.body.text,
        author: author.name
      })
      Doc.findByIdAndUpdate(req.params.docId, {revision: revisionHistory}, function(err, success) {
        if (err) res.status(404)
        else res.json({success: true})
      })
    })
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
      Doc.findByIdAndUpdate(req.body.docId, {collaborators: previousCollabs}, function(err2,result) {
        if (err2) {
          console.log(err2)
          res.json({success:false})
        } else {
          User.findById(req.body.userId, function(err3, result3) {
            previousDocs = result3.docs.slice()
            previousDocs.push(req.body.docId)
            User.findByIdAndUpdate(req.body.userId, {docs:previousDocs}, function(err4,result4) {
              if (err4) {
                console.log(err4)
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

app.get('/users/:userId', function(req, res) {
  User.findById(req.params.userId, function(error, result) {
    if (error) res.status(404).json({success: false})
    else {
      res.json(result) // result is a user object. keys: owner, title, password, collaborators, text
      // client must json parse to access result
    }
  })
})



io.on('connection', function (socket) {
  let colorArr = ['LightBlue','LightGray','LightGreen','LightPink','LightSalmon','MediumBlue',
  'MidnightBlue','Olive','Orange','OrangeRed','Pink','Purple','Red','Sienna']

  socket.on('makeChange', function(data) {
    console.log('makechange', data)
    console.log('color', data.color)
    socket.to(socket.room).emit('receiveChange', {text:data.text, selection:data.selection, color:data.color})
  })

  socket.on('colorChange', function(color) {
    socket.emit('receiveColorChange', color)
  })

  socket.on('leaveRoom', (obj) => {
    console.log('leaveRoom input:', obj)
    const viewerNum = obj.viewer;
    const docId = obj.docId;
    switch(viewerNum) {
      case 1:
      Doc.findByIdAndUpdate(docId, {viewer1: ''}, function(err, updated) {return});
      break;
      case 2:
      Doc.findByIdAndUpdate(docId, {viewer2: ''}, function(err, updated) {return});
      break;
      case 3:
      Doc.findByIdAndUpdate(docId, {viewer3: ''}, function(err, updated) {return});
      break;
      case 4:
      Doc.findByIdAndUpdate(docId, {viewer4: ''}, function(err, updated) {return});
      break;
      case 5:
      Doc.findByIdAndUpdate(docId, {viewer5: ''}, function(err, updated) {return});
      break;
      case 6:
      Doc.findByIdAndUpdate(docId, {viewer6: ''}, function(err, updated) {return});
    }
  })

  //called when a user opens documentview
  socket.on('room', (obj) => {
    const roomDocId = obj.docId
    const userId = obj.userId
    socket.room = roomDocId
    socket.join(roomDocId)
    Doc.findById(roomDocId, function(error, foundDoc) {
      if (error) console.log('could not join room of doc', roomDocId)
      else {
        if (!foundDoc.viewer1) { // set foundDoc.viewer1 = true    ...{id: use} ?
        Doc.findByIdAndUpdate(roomDocId, {viewer1: userId}, function(err, foundDoc2) {
          if (err) console.log('could not join room of doc', roomDocId)
          else socket.emit('colorAssign', {color: 'LightBlue', viewer: 1})
        })
      } else if (!foundDoc.viewer2) {
        Doc.findByIdAndUpdate(roomDocId, {viewer2: userId}, function(err, foundDoc2) {
          if (err) console.log('could not join room of doc', roomDocId)
          else socket.emit('colorAssign', {color: 'LightGreen', viewer: 2})
        })
      } else if (!foundDoc.viewer3) {
        Doc.findByIdAndUpdate(roomDocId, {viewer3: userId}, function(err, foundDoc2) {
          if (err) console.log('could not join room of doc', roomDocId)
          else socket.emit('colorAssign', {color: 'Red', viewer: 3})
        })
      } else if (!foundDoc.viewer4) {
        Doc.findByIdAndUpdate(roomDocId, {viewer4: true}, function(err, foundDoc2) {
          if (err) console.log('could not join room of doc', roomDocId)
          else socket.emit('colorAssign', {color: 'LightPink', viewer: 4})
        })
      } else if (!foundDoc.viewer5) {
        Doc.findByIdAndUpdate(roomDocId, {viewer5: true}, function(err, foundDoc2) {
          if (err) console.log('could not join room of doc', roomDocId)
          else socket.emit('colorAssign', {color: 'Orange', viewer: 5})
        })
      } else if (!foundDoc.viewer6) {
        Doc.findByIdAndUpdate(roomDocId, {viewer6: true}, function(err, foundDoc2) {
          if (err) console.log('could not join room of doc', roomDocId)
          else socket.emit('colorAssign', {color: 'Purple', viewer: 6})
        })
      }
    }
  })
})

  // socket.on('makeChange', function(data) {
  //   console.log('makechange', data)
  //   console.log('color', data.color)
  //   socket.to(socket.room).emit('receiveChange', {text:data.text, selection:data.selection, color:data.color})
  // })
  // socket.on('room', (roomDocId) => {
  //   if (socket.room) {
  //     socket.leave(socket.room);
  //     colorArr.unshift(roomDocId); //reset colorArr
  //   } else {
  //     let c = colorArr.shift(); //assign user first color
  //     socket.emit('colorAssign', {color: c})
  //     socket.room = roomDocId
  //     socket.join(roomDocId)
  //   }
  // })

})

server.listen(port)
