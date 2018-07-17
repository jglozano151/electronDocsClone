
var app = require('express')();
var bodyParser = require('body-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);
const port = 3000;
// when push to heroku, this will be process.env.PORT
// require something else for socket variable?//
// which day/exercise did we do for sockets?
// slapjack, week 5
// getting rid of linter? remove eslintrc

app.use(express.static(path.join(__dirname/src, 'src')));  //tells express where to find my frontend code
app.use(bodyParser.json())

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

app.post('/login',
  passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    res.json({succcess: true, userId: req.user.username}); // `req.user` contains the authenticated user.

    // if (error) socket.emit('error', { msg: 'Login error'})
    // else {  // success
    //   let docsCopy = user.docs.map((doc) => {Docs.findById(doc._id, function(err, docFound) {
    //     if (err) return false;
    //     else {
    //       return {
    //         id: docFound._id,
    //         owner: docFound.owner,
    //         title: docFound.title,
    //         collaborators: docFound.collaborators
    //         }
    //       socket.emit('docList', {docArr: docsCopy})
    //      }
    //   })
    // })
    // }
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
      if (error) //send error?
      else {
        //successful login
        res.send({success: true})
      }
  })

app.post('/newDoc', function(req, res) {
  const newDoc = new Doc ({
    owner: req.body.user._id,
    title: req.body.title,
    password: req.body.pass,
    collaborators: [req.body.user._id],
    text: ''
  });

  newDoc.save(function(err, success) {    /* REWRITE: .then()s instead of if/elses */
    if (err) res.send({success: false})
    else {
      var userDocs;

      User.findById(userId, function(error, user) {
        if (error) res.send({success: false})
        else {
          userDocs = user.docs.slice();
          userDocs = userDocs.concat([success._id]);  //success._id is id of doc that was just saved

          User.findByIdAndUpdate(userId, {docs: userDocs}, function(error2, result2) {
            if (error) res.send({success: false})
            else res.send({success: true, docId: success._id})
          })
        }
      })
    }
  })
})

app.post('/addCollaborators', function(req, res) {
  collabArr = req.body.collaborators.split(', ')  // add .trim to each if necessary
  collabIDs = [];
  collabArr = collabArr.map((email) => {
    User.find({email: email.trim()}, function (err, user) {
      if (err) return email.trim()
      else {
        collabIDs.push(user._id);
        return {id: user._id, docs: user.docs.concat([docId])}
      }
    })
  })

  Promise.all(collabArr)
  .then(
    collabArr2 = collabArr.map( ({id, docs}) => {
      User.findByIdAndUpdate(id, {docs: docs}, function(err) {
        if (err) res.send({success: false})
      })
    })
    Promise.all(collabArr2)
  )
  .then(
    Doc.findByIdAndUpdate(docId, {collaborators: collabIDs}, function(err) {
      if (err) res.send({success: false})
      else {
        res.send({success: true,
          docId: docId});
      }
    })
  )
})

app.post('/saveFile/:docId', function(req, res) {
  Doc.findByIdAndUpdate(req.params.docId, {text: req.body.text}, function(err, success) {
    if (err) res.status(404)
    else res.json({success: true})
  })
})

app.post('/joinDoc', function(req, res) {
  let previousCollabs;
  Doc.findById(req.body.docId, function(error, result) {
    if (req.body.password === foundDoc.password) {  //identified that password is correct
      previousCollabs = foundDoc.collaborators.concat([req.body.userId])

      //update doc's collab Array
      var promise1 = Doc.findByIdAndUpdate(req.body.docId, {collaborators: previousCollabs})

      //update user's docs
      var promise2 = User.findById(req.body.userId, function(error, result) {
        if (error) res.json({success: false})
        else User.findByIdAndUpdate(req.body.userId, {docs: result.docs})
      })

      Promise.all([promise1, promise2])
      .then(res.json({success: true}))

    } else {
      res.json({success: false})
    }
  })

})

// .then(foundDoc => {
//
// )
// .then(
//   Doc.findByIdAndUpdate(req.body.docId, {collaborators: previousCollabs})
// )

// retrieves all docs that a user has access to as owner or collaborator
app.get('/getDocList/:userId', function (req, res) {
  User.findById(req.params.userId, function(error, user) {
    if (error) res.status(404);
    else res.json({succes: true, docs: user.docs});
  })
})



app.get('documentview/:userId/:docId', function(req, res) {
  //consider case where userId does not have persmission to view this doc (not an owner or collaborator)
  Doc.findById(req.params.docId, function(error, foundDoc) {
    if (error)
    else {
      res.json(foundDoc) //foundDoc has keys owner, title, password, collaborators, text
    }
  })
})


//io.on('connection', function (socket) {
  //socket.emit('homepage');

  // socket.on('signup', function (email, password, name) {
  //   const newUser = new User({
  //     email: email,
  //     password: password,
  //     name: name,
  //     docs: []
  //   });
  //   newUser.save(function(error, user) {
  //     if (error) socket.emit('error', { msg: 'Signup error'})
  //     else { // successful save
  //       socket.emit('homepage');
  //     }
  //   })
  // })

  // socket.on('goToSignup', function () {
  //   socket.emit('signup');
  // })
  // socket.on('goToLogin', function () {
  //   socket.emit('homepage');
  // })

  // socket.on('newDoc', function (userId, title, pass) {  // collaborators is one string
  //   const newDoc = new Doc ({
  //     owner: user._id,
  //     title: title,
  //     password: pass,
  //     collaborators: [],
  //     text: ''
  //   });
  //
  //   newDoc.save(function(err, success) {
  //     if (err) socket.emit('error', {msg: 'error in creating a new doc'})
  //     else {
  //       var userDocs;
  //       User.findById(userId, function(error, user) {
  //         if (error) socket.emit('error', {msg: 'error in creating a new doc. Cannot find user.'})
  //         else {
  //           userDocs = user.docs.slice();
  //           userDocs = userDocs.concat([success._id]);  //success._id is id of doc that was just saved
  //
  //           User.findByIdAndUpdate(userId, {docs: userDocs}, function(error2, result2) {
  //             if (error) socket.emit('error', {msg: 'error in saving a new doc'})
  //             else socket.emit('documentview', {id: success._id});
  //           })
  //         }
  //       })
  //     }
  //   })
  // })

  // socket.on('addCollaborators', function(userId, docId, collaborators) {
  //   collabArr = collaborators.split(', ')  // add .trim to each if necessary
  //   collabIDs = [];
  //   collabArr = collabArr.map((email) => {
  //     User.find({email: email.trim()}, function (err, user) {
  //       if (err) return email.trim()
  //       else {
  //         collabIDs.push(user._id);
  //         return {id: user._id, docs: user.docs.concat([docId])}
  //       }
  //     })
  //   })
  //
  //   collabArr.forEach( function ({id, docs}) {
  //     User.findByIdAndUpdate(id, {docs: docs}, function(err) {
  //       if (err) socket.emit('error', {msg: 'error in addCollaborators'})
  //     })
  //   })
  //
  //   Doc.findByIdAndUpdate(docId, {collaborators: collabIDs}, function(err) {
  //     if (err) socket.emit('error', {msg: 'error in creating a new doc'})
  //     else {
  //       socket.emit('goToDocumentView', {userId: userId, docId: docId});
  //     }
  //   })
  // })

  // socket.on('goToDocumentView', function(userId, docId) {
  //   Doc.findById(docId, function(error, foundDoc) {
  //     if (error) socket.emit('error', {msg: 'doc from doc list not found'})
  //     else {
  //       socket.emit('documentview', {userId: userId,
  //         docId: docFound._id,
  //         owner: docFound.owner,
  //         title: docFound.title,
  //         collaborators: docFound.collaborators,
  //         text: docFound.text
  //       })
  //     }
  //   })
  // })

  //when a user presses save button while viewing a doc
  // socket.on('saveFile', function(docId, text) {
  //
  // })


  // when a user wants to join a doc as a collaborator
//   socket.on('collabDoc', function(userId, docId, docPassword) {
//     Doc.findById(docId, function(error, foundDoc) {
//       if (error) socket.emit('error', {msg: 'doc from doc list not found'})
//       else {
//         socket.emit('', {userId: userId,
//           docId: docFound._id,
//           owner: docFound.owner,
//           title: docFound.title,
//           collaborators: docFound.collaborators,
//           text: docFound.text
//         })
//       }
//   })
//
// });

server.listen(port);
