const path = require('path')
const express = require("express")
const bodyParser = require('body-parser')
const app = express()

// i18n
// const LOCALES = ['de', 'en']
// const { I18n } = require('i18n')
// const i18n = new I18n({
//   locales: LOCALES,
//   defaultLocale: 'de',
//   directory: path.join(__dirname, 'locales')
// })
// app.use(i18n.init)

const cors = require('cors')
const allowedOrigins = process.env.CORS ? process.env.CORS.split(',') : ['http://localhost:8081,http://127.0.0.1:8081', 'http://localhost:8080']
app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) === -1) {
      let msg = 'The CORS policy for this site does not allow access from the specified Origin.'
      return callback(new Error(msg), false)
    }
    return callback(null, true)
  }
}))

// Template engine
app.set('view engine', 'ejs')
app.set('views', 'views')


// Serve static file from the game client
app.use(express.static('public'))

app.get('/', function(req, res, next) {
  res.render('index', { })
  // res.send('test')
});

const PORT = process.env.PORT || 9090
const server = app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`)
})
