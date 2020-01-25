const express = require('express')

const app = express()

app.set('secret', 'iad243ff234reeg')

app.use(express.json())
app.use(require('cors')())

app.use('/uploads', express.static(__dirname + '/uploads'))

require('./routes/admin')(app)
require('./plugins/db')(app)

app.listen(3000, () => {
  console.log('http://localhost:3000')
})