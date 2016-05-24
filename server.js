var app = require('express')()

var r = require('rethinkdbdash')({
  port: 28015,
  host: 'localhost',
  db: 'mwts'
});

var passport = require('passport')
, FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy(
  {
    clientID: 1089354287803934,
    clientSecret: "e0d80df5eb4eb547db910b17aef2dfc3",
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
    r.table('users').filter({email: profile.emails[0].value}).run().then(function(result) {
      if(result[0]) return done(null, result[0])
      else {
        const new_user = {
          facebook_id: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          photo: profile.photos[0].value
        }
        r.table('users')
        .insert(new_user).run().then(function(err, result) {
          if(err) console.log( '\n', err,  '\n')
          else done(null, new_user)
        })
      }
    })
  }
));

passport.serializeUser(function(user, done) {
  console.log('serializeUser: ' + user.id)
  done(null, user.id);
})

passport.deserializeUser(function(id, done) {
  console.log("deserialising")
  r.table('users').get(id).run()
  .then(function(result) {
    console.log("User ", result)
    return done(null, user)
  })
  .error(function(err) {
    console.log(err)
    return done(err, null)
  })
})

app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('cookie-parser')());
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize())
app.use(passport.session())

app.get('/logout', function(req, res){
  req.logout()
  res.send("Logged Out")
});

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email']}))
app.get('/auth/facebook/callback', passport.authenticate('facebook', { successRedirect: '/profile', failureRedirect: '/' }))

app.listen(3000, function(err) {
  if(err) {
    console.log(err)
    return
  }
  console.log("Running MWTS Server on http://localhost:3000")
})
