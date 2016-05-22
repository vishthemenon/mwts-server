var app = require('express')();

var r = require('rethinkdbdash')({
  port: 28015,
  host: 'localhost',
  db: 'mwts'
});

app.get('/', function(req, res) {
  r.table('test').run().then(function(result) {
    res.send(result)
  })
})

app.listen(3000, function(err) {
  if(err) {
    console.log(err)
    return
  }
  console.log("Running MWTS Server on http://localhost:3000")
})
