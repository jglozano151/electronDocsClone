// Set up express server and import dependencies
var express = require('express');
var path = require('path')
var app = express()
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
const port = 3000;

app.use(express.static(path.join(__dirname, 'src')));
app.use(bodyParser.json())

// Set up passport, import models
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var models = require('./models.js');
var User = models.User
var Doc = models.Doc
var Color = models.Color

// Passport middleware - Local strategy
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
  let ind = getRandomIntInclusive()
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

//User logout
app.get('/logout', function(req, res){
  req.logout();
  res.json({success: true});
});

// Create new document. Maximum 6 collaborators per document 
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

  newDoc.save(function(err, success) {
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

//Save Document
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

//Join Document
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

//View a document as specific user
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

//get color styleMap
app.get('/getStyleMap', function(req,res) {
  Color.find()
  .then((arr) => {res.json({arr: arr})})
})



//Socket connection
io.on('connection', function (socket) {
  //Edit document
  socket.on('makeChange', function(data) {
    console.log('makechange', data)
    socket.to(socket.room).emit('receiveChange', {text:data.text, selection:data.selection}) //, color:data.color})
  })

  //Text highlight
  socket.on('sendHighlight', function(data) {  //data has keys like makeChange- text, selection, color
    console.log('viewer', data.viewer)
    socket.to(socket.room).emit('receiveHighlight', {text:data.text, selection:data.selection, viewer:data.viewer})
  })

  //Text color change
  socket.on('colorChange', function(color) {
    socket.to(socket.room).emit('receiveColorChange', color)
    Color.find({color:color})
    .then(result => {
      if (result.length === 0) {
        let newColor = new Color({
          color: color,
          styleMap: {color:color}
        })
        newColor.save((error) => console.log('newcolor',error))
      }
    })
    .catch(err => console.log('err', err))
  })

  //Leave document
  socket.on('leaveRoom', (obj) => {
    console.log('leaveRoom input:', obj)
    const viewerNum = obj.viewer;
    const docId = obj.docId;
    switch(viewerNum) {
      case 'h1':
      Doc.findByIdAndUpdate(docId, {viewer1: ''}, function(err, updated) {return});
      break;
      case 'h2':
      Doc.findByIdAndUpdate(docId, {viewer2: ''}, function(err, updated) {return});
      break;
      case 'h3':
      Doc.findByIdAndUpdate(docId, {viewer3: ''}, function(err, updated) {return});
      break;
      case 'h4':
      Doc.findByIdAndUpdate(docId, {viewer4: ''}, function(err, updated) {return});
      break;
      case 'h5':
      Doc.findByIdAndUpdate(docId, {viewer5: ''}, function(err, updated) {return});
      break;
      case 'h6':
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
          else socket.emit('colorAssign', 'h1') //{color: 'LightBlue', viewer: 'h1'})
        })
        } else if (!foundDoc.viewer2) {
          Doc.findByIdAndUpdate(roomDocId, {viewer2: userId}, function(err, foundDoc2) {
            if (err) console.log('could not join room of doc', roomDocId)
            else socket.emit('colorAssign', 'h2') //{color: 'LightGreen', viewer: 'h2'})
          })
        } else if (!foundDoc.viewer3) {
          Doc.findByIdAndUpdate(roomDocId, {viewer3: userId}, function(err, foundDoc2) {
            if (err) console.log('could not join room of doc', roomDocId)
            else socket.emit('colorAssign', 'h3') //{color: 'Red', viewer: 'h3'})
          })
        } else if (!foundDoc.viewer4) {
          Doc.findByIdAndUpdate(roomDocId, {viewer4: userId}, function(err, foundDoc2) {
            if (err) console.log('could not join room of doc', roomDocId)
            else socket.emit('colorAssign', 'h4') //{color: 'LightPink', viewer: 'h4'})
          })
        } else if (!foundDoc.viewer5) {
          Doc.findByIdAndUpdate(roomDocId, {viewer5: userId}, function(err, foundDoc2) {
            if (err) console.log('could not join room of doc', roomDocId)
            else socket.emit('colorAssign', 'h5') //{color: 'Orange', viewer: 'h5'})
          })
        } else if (!foundDoc.viewer6) {
          Doc.findByIdAndUpdate(roomDocId, {viewer6: userId}, function(err, foundDoc2) {
            if (err) console.log('could not join room of doc', roomDocId)
            else socket.emit('colorAssign', 'h6') //{color: 'Purple', viewer: 'h6'})
          })
        }
      }
    })
  })
})

server.listen(port)
