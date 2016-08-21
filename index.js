/* global process */
/* global __dirname */
"use strict"
require('newrelic')
var express = require('express'),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  compression = require('compression'),
  mongo = require('mongodb'),
  MongoClient = mongo.MongoClient,
  expressHbs = require('express-handlebars'),
  expressHbsInstance = expressHbs({ extname: 'hbs' }),
  htmlToText = require('nodemailer-html-to-text').htmlToText,
  emailHbs = require('nodemailer-express-handlebars'),
  request = require('request'),
  nodemailer = require('nodemailer'),
  postgres = require('pg'),
  bcrypt = require('bcrypt-nodejs'),
  crypto = require('crypto'),
  session = require('express-session'),
  MongoStore = require('connect-mongodb-session')(session),
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  mongoose = require('mongoose'),
  mailList = process.env.WEBMASTERS.split(','),
  MongoURL = process.env.DBURL,
  regexPatterns = require('./config/regex'),
  redirectList = require('./config/redirects'),
  //logger = require( 'morgan' ),
  CACHE = {}
mongoose.connect(process.env.DBURL, { server: { auto_reconnect: true } })
mongoose.connection.on('connected', function () {
  console.log('Mongoose default connection open')
})
mongoose.connection.on('connecting', function () {
  console.log('connecting to MongoDB...')
})
mongoose.connection.on('error', function (err) {
  console.log('Mongoose default connection error: ' + err)
})
mongoose.connection.on('disconnected', function () {
  console.log('Mongoose default connection disconnected')
})
mongoose.connection.on('reconnected', function () {
  console.log('MongoDB reconnected!')
})
process.on('SIGINT', function () {
  mongoose.connection.close(function () { process.exit(0) })
})

var MessageSchema = mongoose.model('Message', (new mongoose.Schema({
  name: String,
  email: String,
  phone: { type: String, 'default': '' },
  message: String,
  resolved: { type: Boolean, 'default': false }
}, {
    collection: 'messages',
    timestamps: true
  }))),
  SubscriberSchema = mongoose.model('Subscriber', (new mongoose.Schema({
    email: String,
    feedback: String,
    active: { type: Boolean, 'default': true }
  }, {
      collection: 'subscribers',
      timestamps: true
    }))),
  TeamMemberSchema = mongoose.model('TeamMember', (new mongoose.Schema({
    alumni: { type: Boolean, 'default': false },
    quit: { type: Boolean, 'default': false },
    'basic-details': {
      subsystem: String,
      year: { type: Number, min: 1, max: 5 },
      img: String,
      name: String,
      gender: { type: String, enum: ['M', 'F', 'Other'] },
      email: String,
      'alter-mail': String,
      tel: String,
      fb: String,
      dept: String,
      spe: String
    },
    'face-tag': {
      x: { type: Number, min: 0, max: 1 },
      y: { type: Number, min: 0, max: 1 }
    },
    position: String,
    'claims-to-fame': [String],
    'mail-active': { type: Boolean, 'default': false },
    'mail-route-id': String,
    mailPassword: String,
    hall: String,
    password: String,
    username: String
  }, {
      timestamps: true
    })))
/*,
LogEntrySchema=mongoose.model('LogEntry',(new mongoose.Schema({
name: String,
email: String,
phone: { type: String,'default': '' },
message: String,
resolved: { type: Boolean,'default': false }
},{
collection: 'messages',
timestamps: true
}))),
NewsfeedObjectSchema=mongoose.model('Newsfeed',(new mongoose.Schema({
name: String,
email: String,
phone: { type: String,'default': '' },
message: String,
resolved: { type: Boolean,'default': false }
},{
collection: 'messages',
timestamps: true
}))),
BlogfeedObjectSchema=mongoose.model('Blogfeed',(new mongoose.Schema({
name: String,
email: String,
phone: { type: String,'default': '' },
message: String,
resolved: { type: Boolean,'default': false }
},{
collection: 'messages',
timestamps: true
}))),
GallerySchema=mongoose.model('Gallery',(new mongoose.Schema({
name: String,
email: String,
phone: { type: String,'default': '' },
message: String,
resolved: { type: Boolean,'default': false }
},{
collection: 'messages',
timestamps: true
})))
*/
function newMessage(req, res) {
  console.log('newMessage')
  console.log(req.headers['user-agent'])
  if (!req.body.captcha)
    res.send('Captcha error')
  else
    verifyRecaptcha(req.body.captcha, function (success) {
      if (!success)
        res.send('Captcha Error')
      else {
        var email = req.body.email,
          name = req.body.name,
          phone = req.body.phone,
          message = req.body.message
        if (!(message && regexPatterns.emailPatt.test(email) && regexPatterns.namePatt.test(name) && (!phone || regexPatterns.phonePatt.test(phone))))
          res.send('Bad request')
        else {
          var newMsg = new MessageSchema({
            name: name,
            email: email,
            phone: phone,
            message: message
          })
          newMsg.save(function (e, r) {
            var transporter = createTransport(),
              messageSend = {
                subject: 'New message at teamkart.in from ' + name,
                to: mailList[0],
                text: name + ' says: \n"' + message + '"\nContact Info:\nEmail: ' + email + (phone ? '\nPhone: ' + phone : '')
              }
            transporter.sendMail(messageSend)
            if (!e)
              res.send('Ok')
            else
              res.send('Internal Error')
          })
        }
      }
    })
}

function verifyRecaptcha(key, callback) {
  console.log('verifyRecaptcha')
  request.get("https://www.google.com/recaptcha/api/siteverify?secret=" + process.env.RECAPTCHA + "&response=" + key, function (e, r, b) {
    callback(JSON.parse(b).success)
  })
}

function createTransport() {
  console.log('createTransport')
  return nodemailer.createTransport({
    service: 'Mailgun',
    auth: {
      user: process.env.MGUSERNAME,
      pass: process.env.MGPASSWORD
    }
  })
}

function unsubscribe(req, res) {
  console.log('unsubscribe', req.headers['user-agent'])
  if (!regexPatterns._idPatt.test(req.query.id))
    res.status(404).send('Bad request')
  else {
    req.session.unsubscribe = req.query.id
    SubscriberSchema.findById(req.query.id, function (e, doc) {
      if (!e && !doc)
        res.status(404).send('Bad request')
      else if (!e) {
        doc.active = false
        doc.save(function (e, r) {
          if (!e)
            res.status(200).sendFile(__dirname + '/private/unsub.html')
          else
            res.send('Internal Error')
        })
      }
      else
        res.send('Internal Error')
    })
  }
}

function feedback(req, res) {
  console.log('feedback', req.headers['user-agent'])
  var id = req.session.unsubscribe
  if (!id)
    return res.send('Please enable cookies')
  if (!regexPatterns._idPatt.test(id))
    return res.status(404).send('Bad request')
  SubscriberSchema.findById(id, function (e, doc) {
    if (!e && !doc)
      res.status(404).send('Bad request')
    else if (!e) {
      doc.feedback = req.body.feedback
      doc.save(function (e, r) {
        var messageBody = "Unsubscribed: " + id
        if (req.body.feedback)
          messageBody = messageBody + "\nHe/She left a message:\n" + req.body.feedback
        var transporter = createTransport()
        var message = {
          subject: 'Bad news',
          text: messageBody,
          to: mailList[0]
        }
        transporter.sendMail(message)
        res.status(200).send('Ok')
      })
    }
    else
      res.send('Internal Error')
  })
}

function subscribeRequest(req, res) {
  console.log('subscribeRequest')
  console.log(req.headers['user-agent'])
  if (!req.body.captcha)
    res.send('Captcha error')
  else
    verifyRecaptcha(req.body.captcha, function (success) {
      if (!success)
        res.send('Captcha error')
      else {
        var email = req.body.email
        if (!regexPatterns.emailPatt.test(email))
          res.send('Bad request')
        else {
          SubscriberSchema.findOne({ email: email }, function (e, doc) {
            if (!e && !doc) {
              var newSub = new SubscriberSchema({ email: email })
              newSub.save(function (e, r) {
                if (!e) {
                  subscriptionSuccessUser(r, createTransport())
                  res.status(200).send('Ok')
                }
                else
                  res.send('Internal Error')
              })
            }
            else if (!e) {
              if (doc.active)
                res.send('You already subscribed')
              else {
                doc.active = true
                doc.save(function (e, r) {
                  if (!e) {
                    subscriptionSuccessUser(r, createTransport(), "Welcome back")
                    res.status(200).send('Ok')
                  }
                  else
                    res.send('Internal Error')
                })
              }
            }
            else
              res.send('Internal Error')
          })
        }
      }
    })
}

function subscriptionSuccessUser(id, transporter, subject) {
  console.log('subscriptionSuccessUser')
  subject = subject == undefined ? 'Successfully subscribed to TeamKART' : subject
  transporter.use('compile', emailHbs({
    viewEngine: expressHbsInstance,
    viewPath: './views/email',
    extName: '.hbs'
  }))
  transporter.use('compile', htmlToText())
  extractPeople()
  function extractPeople() {
    console.log('extractPeople')
    var contactPerson = []
    if (CACHE.db23 && CACHE.db23.expires > new Date())
      extractSpons(CACHE.db23.result)
    else
      MongoClient.connect(MongoURL, function (err, db) {
        console.log('db connect 0')
        db.collection('teamStructure').aggregate([{
          $match: {
            quit: { $ne: true },
            alumni: { $ne: true },
            position: { $in: ['Team Leader', 'Team Manager'] }
          }
        }, {
            $sort: { position: 1 }
          }, {
            $project: {
              _id: 0,
              name: 1,
              tel: 1,
              email: { $cond: [{ $eq: ['$mail-active', true] }, '$email', '$alter-mail'] },
            }
          }]).toArray(function (err, arr) {
            console.log('db call 0')
            contactPerson = arr
            db.close()
            extractSpons(contactPerson)
          })
      })
  }
  function extractSpons(contactPerson) {
    console.log('extractSpons')
    var spons = require('./public/js/data/sponsors.js')
    spons.shuffle()
    var sponsmatrix = [], row = []
    for (var i = 0; spons.data[i]; i++) {
      if (i % 3 == 0)
        row = []
      row.push(spons.data[i])
      if (i % 3 == 2 || i == spons.data.length - 1)
        sponsmatrix.push(row)
    }
    var Reply = {
      subject: subject,
      to: id.email,
      from: 'TeamKART <' + process.env.MGUSERNAME + '>',
      template: 'htmlMail',
      context: {
        _id: id._id,
        sponsor: sponsmatrix,
        contactPerson: contactPerson
      }
    }
    transporter.sendMail(Reply, function (e, r, b) { console.log(e, r, b) })
  }
}

function ping(req, res) {
  console.log('ping')
  console.log(req.headers['user-agent'])
  var now = new Date()
  if (now.getDay() === 1 && now.getUTCHours() === 7 && now.getUTCMinutes < 5)
    postgres.connect(process.env.DATABASE_URL, function (err, client) {
      console.log('db connect 1')
      if (!err)
        client.query('SELECT lasttime FROM Notifications LIMIT 1').on('row', function (row) {
          console.log('db call 1')
          var last = new Date(Date.parse(row.lasttime))
          var diff = new Date(now - last)
          if (diff > new Date(1970, 0, 6))
            maintainanceTasks(now, function () {
              client.query('UPDATE Notifications SET lasttime=now();', function () {
                console.log('db call 2')
                client.end()
              })
            })
        })
    })
  res.status(200).send('OK')
}

function maintainanceTasks(now, callback) {
  console.log('maintainanceTasks')
  var lastWeekMidnight = new Date(now - (1000 * 3600 * 24 * 7 + now.getSeconds() * 1000 + now.getMinutes() * 60 * 1000 + now.getHours() * 3600 * 1000))
  MongoClient.connect(MongoURL, function (err, db) {
    console.log('db connect 2')
    if (!err) {
      var messages = db.collection('messages')
      var subscribers = db.collection('subscribers')
      function newMessages(str) {
        console.log('newMessages')
        messages.count({ timestamp: { $gt: lastWeekMidnight } }, function (err, count) {
          console.log('db call 3')
          if (!err && count > 0)
            str = str + count + ' new messages since last week\n'
          unreadMessages(str)
        })
      }
      function unreadMessages(str) {
        console.log('unreadMessages')
        messages.count({ resolved: false }, function (err, count) {
          console.log('db call 4')
          if (!err && count > 0)
            str = str + 'Total ' + count + ' unread messages\n'
          newSubscribers(str)
        })
      }
      function newSubscribers(str) {
        console.log('newSubscribers')
        subscribers.count({ lastUpdated: { $gt: lastWeekMidnight }, active: true }, function (err, count) {
          console.log('db call 5')
          if (!err && count > 0)
            str = str + count + ' new subscribers since last week\n'
          lostSubscribers(str)
        })
      }
      function lostSubscribers(str) {
        console.log('lostSubscribers')
        subscribers.count({ lastUpdated: { $gt: lastWeekMidnight }, active: false }, function (err, count) {
          console.log('db call 6')
          if (!err && count > 0)
            str = str + count + ' unsubscribed since last week\n'
          db.close()
          sendMessage(str)
        })
      }
      function sendMessage(str) {
        console.log('sendMessage')
        if (str != '') {
          var transporter = createTransport()
          for (var i = 0; mailList[i]; i++) {
            var messageSend = {
              subject: 'Your weekly report from teamkart.in',
              text: str
            }
            messageSend.to = mailList[i]
            transporter.sendMail(messageSend)
          }
        }
      }
      newMessages('')
    }
  })
}

function checkRedirects(req, res, next) {
  console.log('checkRedirects')
  console.log(req.headers['user-agent'])
  if (req.url in redirectList)
    req.url = redirectList[req.url]
  next('route')
}

function galleryHandler(req, res, next) {
  console.log('galleryHandler')
  console.log(req.headers['user-agent'])
  var url = req.url.split('?')[0]
  if (url == '/') {
    res.set('Cache-Control', 'public, max-age=2628000')
    var attrib = commonUIelementsCache({ menubar: true, sponsor: true, social: true })
    attrib.helpers = {
      'for': function (n, e, block) {
        var accum = '';
        for (var i = 0; i < n; ++i)
          accum += block.fn({ index: i, name: e });
        return accum;
      }
    }
    if (CACHE.db13 && CACHE.db13.expires > new Date()) {
      attrib.gallery = CACHE.db13.result
      res.render('galleryPage', attrib)
    }
    else
      MongoClient.connect(MongoURL, function (err, db) {
        console.log('db connect 6')
        db.collection('galleries').find({}, { name: 1, displayAs: 1, count: 1, _id: 0 }, { sort: { date: -1 } }).toArray(function (err, arr) {
          console.log('db call 13')
          CACHE.db13 = {}
          attrib.gallery = CACHE.db13.result = arr
          CACHE.db13.expires = (new Date(Number(new Date()) + 3 * 24 * 60 * 60 * 1000))
          res.render('galleryPage', attrib)
          db.close()
        })
      })
  }
  else
    MongoClient.connect(MongoURL, function (err, db) {
      console.log('db connect 7')
      db.collection('galleries').findOne({ url: url }, { date: 0, _id: 0 }, function (err, item) {
        console.log('db call 14')
        if (item != null) {
          res.set('Cache-Control', 'public, max-age=2628000')
          item.sponsor = require('./public/js/data/sponsors.js').shuffle()
          item.social = require('./public/js/data/social.js').data
          item.menubar = require('./public/js/data/menubar.js').generator()
          item.helpers = {
            'for': function (n, block) {
              var accum = '';
              for (var i = 0; i < n; ++i)
                accum += block.fn({ index: i, name: item.name });
              return accum;
            }
          }
          res.render('galleryTemplate', item)
          db.close();
        }
        else
          next('route');
      })
    })
}

function emailLogger(req, res) {
  console.log('emailLogger')
  console.log(req.headers['user-agent'])
  if (req.body.recipient && req.body.event)
    MongoClient.connect(MongoURL, function (err, db) {
      console.log('db connect 8')
      if (!err) {
        var record = req.body
        if (req.body['message-headers'] != undefined) {
          var content = req.body['message-headers']
          content = JSON.parse(content)
          var c = {}
          content.forEach(function (e, i, a) {
            c[e[0]] = e[1]
          })
          record['message-headers'] = c
        }
        record.logTime = new Date()
        db.collection('emailLogs').insert(record, function (err, result) {
          console.log('db call 15')
          db.close()
        })
      }
    })
  res.status(200).send('OK')
}

function isValidPassword(user, password) {
  console.log('isValidPassword')
  return bcrypt.compareSync(password, user.password)
}

function hashPassword(req, res) {
  console.log('hashPassword')
  res.send(bcrypt.hashSync(req.query.pass))
}

function encrypt(text) {
  var cipher = crypto.createCipher('aes-256-ctr', process.env.ENC_KEY)
  var crypted = cipher.update(text, 'utf8', 'hex')
  crypted += cipher.final('hex')
  return crypted
}

function decrypt(text) {
  var decipher = crypto.createDecipher('aes-256-ctr', process.env.ENC_KEY)
  var dec = decipher.update(text, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}

function isAuthenticated(req, res, next) {
  console.log('isAuthenticated')
  if (req.isAuthenticated())
    return next()
  res.redirect('/login')
}

function homePage(req, res) {
  console.log('homePage')
  var ua = req.headers['user-agent']
  console.log(ua)
  var attrib = commonUIelementsCache({ menubar: true, sponsor: true, social: true }), pno = 0
  res.set('Cache-Control', 'public, max-age=2628000')
  if (req.query.pno)
    pno = Number(req.query.pno)
  else
    pno = 1
  if (/mobile/i.test(ua) || /Android/.test(ua) || /like Mac OS X/.test(ua))
    attrib.mobile = true
  if (CACHE.db15 && CACHE.db15.expires > new Date() && CACHE.db16 && CACHE.db16.expires > new Date()) {
    attrib.newspost = CACHE.db15.result
    attrib.rawGalleryData = CACHE.db16.result
    postprocess(attrib)
  }
  else
    MongoClient.connect(MongoURL, function (err, db) {
      console.log('db connect 8')
      db.collection('newsfeed').find({}, { _id: 0 }, { sort: { date: -1 } }).toArray(newsfeedCallback)
      function newsfeedCallback(err, arr) {
        console.log('db call 15')
        CACHE.db15 = {}
        arr.forEach(function (e, i, a) {
          a[i].date = a[i].date.toDateString().slice(4)
        })
        attrib.newspost = CACHE.db15.result = arr
        CACHE.db15.expires = (new Date(Number(new Date()) + 3 * 24 * 60 * 60 * 1000))
        db.collection('galleries').find({}, { name: 1, count: 1, _id: 0 }, { sort: { date: -1 } }).toArray(galleryCallback)
      }
      function galleryCallback(err, arr) {
        console.log('db call 16')
        CACHE.db16 = {}
        attrib.rawGalleryData = CACHE.db16.result = arr
        CACHE.db16.expires = (new Date(Number(new Date()) + 3 * 24 * 60 * 60 * 1000))
        db.close()
        postprocess(attrib)
      }
    })
  function postprocess(attrib) {
    if (attrib.newspost.length > 4) {
      if (pno > 1)
        attrib.prevno = pno - 1
      if (pno < Math.ceil(attrib.newspost.length / 4))
        attrib.nextno = pno + 1
    }
    attrib.newspost = attrib.newspost.slice((pno - 1) * 4, pno * 4)
    var added = {}
    attrib.galleryImage = []
    for (var i = 0; i < 9; i++) {
      attrib.galleryImage[i] = {}
      var a = Math.random() * Math.exp(attrib.rawGalleryData.length - 1)
      var c = 0
      if (a >= 1)
        c = Math.ceil(Math.log(a))
      c = attrib.rawGalleryData.length - (c + 1)
      var b = attrib.rawGalleryData[c]
      added[b.name] = added[b.name] === undefined ? [] : added[b.name]
      var d = Math.floor(Math.random() * b.count)
      while (added[b.name].indexOf(d) != -1)
        d = (d + 1) % b.count
      added[b.name].push(d)
      attrib.galleryImage[i].name = b.name
      attrib.galleryImage[i].number = d
    }
    res.render('index', attrib)
  }
}

function newsFeedContent(req, res) {
  console.log('newsFeedContent')
  console.log(req.headers['user-agent'])
  var attrib = {}, pno = 0
  if (req.query.pno)
    pno = Number(req.query.pno)
  else
    pno = 1
  MongoClient.connect(MongoURL, function (err, db) {
    console.log('db connect 9')
    db.collection('newsfeed').find({}, { _id: 0 }, { sort: { date: -1 } }).toArray(function (err, arr) {
      console.log('db call 17')
      if (arr.length > 4) {
        if (pno > 1)
          attrib.prevno = pno - 1
        if (pno < Math.ceil(arr.length / 4))
          attrib.nextno = pno + 1
      }
      attrib.newspost = arr.slice((pno - 1) * 4, pno * 4)
      attrib.newspost.forEach(function (e, i, a) {
        a[i].date = a[i].date.toDateString().slice(4)
      })
      res.render('feed', attrib)
      db.close()
    })
  })
}

function blogFeedContent(req, res) {
  console.log('blogFeedContent')
  console.log(req.headers['user-agent'])
  var attrib = {}, pno = 0
  if (req.query.pno)
    pno = Number(req.query.pno)
  else
    pno = 1
  MongoClient.connect(MongoURL, function (err, db) {
    console.log('db connect 10')
    db.collection('blogfeed').find({}, { _id: 0 }, { sort: { date: -1 } }).toArray(function (err, arr) {
      console.log('db call 18')
      if (arr.length > 4) {
        if (pno > 1)
          attrib.prevno = pno - 1
        if (pno < Math.ceil(arr.length / 4))
          attrib.nextno = pno + 1
      }
      attrib.newspost = arr.slice((pno - 1) * 4, pno * 4)
      attrib.newspost.forEach(function (e, i, a) {
        a[i].date = a[i].date.toDateString().slice(4)
      })
      res.render('feed', attrib)
      db.close()
    })
  })
}

function randomGalleryView(req, res) {
  console.log('randomGalleryView')
  console.log(req.headers['user-agent'])
  var attrib = {}
  var ua = req.headers['user-agent']
  if (/mobile/i.test(ua) || /Android/.test(ua) || /like Mac OS X/.test(ua))
    attrib.mobile = true
  MongoClient.connect(MongoURL, function (err, db) {
    console.log('db connect 11')
    db.collection('galleries').find({}, { name: 1, count: 1, _id: 0 }, { sort: { date: -1 } }).toArray(function (err, arr) {
      console.log('db call 19')
      var added = {}
      attrib.galleryImage = []
      for (var i = 0; i < 9; i++) {
        attrib.galleryImage[i] = {}
        var a = Math.random() * Math.exp(arr.length - 1)
        var c = 0
        if (a >= 1)
          c = Math.ceil(Math.log(a))
        c = arr.length - (c + 1)
        var b = arr[c]
        added[b.name] = added[b.name] === undefined ? [] : added[b.name]
        var d = Math.floor(Math.random() * b.count)
        while (added[b.name].indexOf(d) != -1)
          d = (d + 1) % b.count
        added[b.name].push(d)
        attrib.galleryImage[i].name = b.name
        attrib.galleryImage[i].number = d
      }
      res.render('randomGalleryView', attrib)
      db.close()
    })
  })
}
function blogPage(req, res, next) {
  console.log('blogPage')
  console.log(req.headers['user-agent'])
  var url = req.url.split('?')[0]
  if (url == '/') {
    var attrib = commonUIelementsCache({ menubar: true, sponsor: true, social: true }), pno = 0
    res.set('Cache-Control', 'public, max-age=2628000')
    if (req.query.pno)
      pno = Number(req.query.pno)
    else
      pno = 1
    var ua = req.headers['user-agent']
    if (/mobile/i.test(ua) || /Android/.test(ua) || /like Mac OS X/.test(ua))
      attrib.mobile = true
    MongoClient.connect(MongoURL, function (err, db) {
      console.log('db connect 12')
      db.collection('blogfeed').find({}, { _id: 0 }, { sort: { date: -1 } }).toArray(blogfeedCallback)
      function blogfeedCallback(err, arr) {
        console.log('db call 20')
        if (arr.length > 4) {
          if (pno > 1)
            attrib.prevno = pno - 1
          if (pno < Math.ceil(arr.length / 4))
            attrib.nextno = pno + 1
        }
        attrib.blogpost = arr.slice((pno - 1) * 4, pno * 4)
        attrib.blogpost.forEach(function (e, i, a) {
          a[i].date = a[i].date.toDateString().slice(4)
        })
        db.collection('galleries').find({}, { name: 1, count: 1, _id: 0 }, { sort: { date: -1 } }).toArray(galleryCallback)
      }
      function galleryCallback(err, arr) {
        console.log('db call 21')
        var added = {}
        attrib.galleryImage = []
        for (var i = 0; i < 9; i++) {
          attrib.galleryImage[i] = {}
          var a = Math.random() * Math.exp(arr.length - 1)
          var c = 0
          if (a >= 1)
            c = Math.ceil(Math.log(a))
          c = arr.length - (c + 1)
          var b = arr[c]
          added[b.name] = added[b.name] === undefined ? [] : added[b.name]
          var d = Math.floor(Math.random() * b.count)
          while (added[b.name].indexOf(d) != -1)
            d = (d + 1) % b.count
          added[b.name].push(d)
          attrib.galleryImage[i].name = b.name
          attrib.galleryImage[i].number = d
        }
        res.render('blog', attrib)
        db.close()
      }
    })
  }
  else
    next('route');
}

function teamPage(req, res) {
  console.log('teamPage')
  console.log(req.headers['user-agent'])
  var attrib = commonUIelementsCache({ menubar: true, sponsor: true, social: true })
  res.set('Cache-Control', 'public, max-age=2628000')
  if (CACHE.db22 && CACHE.db22.expires > new Date()) {
    attrib.subsystem = CACHE.db22.result
    res.render('team', attrib)
  }
  else
    MongoClient.connect(MongoURL, function (err, db) {
      console.log('db connect 13')
      db.collection('teamStructure').aggregate([{
        $match: {
          quit: { $ne: true },
          alumni: { $ne: true },
          year: { $gt: 1 }
        }
      }, {
          $sort: {
            subsystem: 1,
            year: -1,
            name: 1
          }
        }, {
          $group: {
            _id: '$subsystem',
            members: {
              $push: {
                id: '$_id',
                name: '$name',
                img: '$img',
                tel: '$tel',
                email: { $cond: [{ $eq: ['$mail-active', true] }, '$email', '$alter-mail'] },
                fb: '$fb',
                dept: '$dept',
                spe: '$spe',
                x: '$x',
                y: '$y'
              }
            }
          }
        }, {
          $sort: {
            _id: -1
          }
        }]).toArray(function (err, arr) {
          console.log('db call 22')
          CACHE.db22 = {}
          attrib.subsystem = CACHE.db22.result = arr
          CACHE.db22.expires = (new Date(Number(new Date()) + 3 * 24 * 60 * 60 * 1000))
          res.render('team', attrib)
          db.close()
        })
    })

}

function commonUIelementsCache(options) {
  if (!CACHE.commonexpiry || CACHE.commonexpiry > new Date()) {
    CACHE.sponsor = require('./public/js/data/sponsors.js').shuffle()
    CACHE.social = require('./public/js/data/social.js').data
    CACHE.menubar = require('./public/js/data/menubar.js').generator()
    CACHE.commonexpiry = (new Date(Number(new Date()) + 10 * 60 * 1000))
  }
  if (!CACHE.sponsor)
    CACHE.sponsor = require('./public/js/data/sponsors.js').shuffle()
  if (!CACHE.social)
    CACHE.social = require('./public/js/data/social.js').data
  if (!CACHE.sponsor)
    CACHE.menubar = require('./public/js/data/menubar.js').generator()
  var obj = {}
  if (options.sponsor)
    obj.sponsor = CACHE.sponsor
  if (options.menubar)
    obj.menubar = CACHE.menubar
  if (options.social)
    obj.social = CACHE.social
  return obj
}

function contactPage(req, res) {
  console.log('contactPage')
  console.log(req.headers['user-agent'])
  var attrib = commonUIelementsCache({ menubar: true, sponsor: true, social: true })
  res.set('Cache-Control', 'public, max-age=2628000')
  if (CACHE.db23 && CACHE.db23.expires > new Date()) {
    attrib.person = CACHE.db23.result
    res.render('contact', attrib)
  }
  else
    MongoClient.connect(MongoURL, function (err, db) {
      console.log('db connect 14')
      db.collection('teamStructure').aggregate([{
        $match: {
          quit: { $ne: true },
          alumni: { $ne: true },
          position: { $in: ['Team Leader', 'Team Manager'] }
        }
      },
        {
          $sort: {
            position: 1
          }
        },
        {
          $project: {
            _id: 0,
            position: 1,
            img: 1,
            name: 1,
            tel: 1,
            email: { $cond: [{ $eq: ['$mail-active', true] }, '$email', '$alter-mail'] },
            fb: 1
          }
        }]).toArray(function (err, arr) {
          console.log('db call 23')
          CACHE.db23 = {}
          attrib.person = CACHE.db23.result = arr
          CACHE.db23.expires = (new Date(Number(new Date()) + 3 * 24 * 60 * 60 * 1000))
          res.render('contact', attrib)
          db.close()
        })
    })
}

function login(req, res) {
  console.log('login')
  console.log(req.headers['user-agent'])
  if (!req.isAuthenticated())
    res.render('signin', { menubar: require('./public/js/data/menubar.js').generator() })
  else
    res.redirect('/adminpanel')
}

function signOut(req, res) {
  console.log('signOut')
  console.log(req.headers['user-agent'])
  req.logout()
  res.redirect('/login')
}

function adminPanel(req, res) {
  console.log('adminPanel')
  console.log(req.headers['user-agent'])
  res.sendFile(__dirname + '/private/adminpanel.html')
}

function notfound404(req, res) {
  console.log('notfound404')
  console.log(req.headers['user-agent'])
  var attrib = commonUIelementsCache({ menubar: true, sponsor: true, social: true })
  res.status(404).render('404', attrib)
}

function mailIdIns(req, res) {
  console.log('mailIdIns')
  console.log(req.headers['user-agent'])
  var attrib = commonUIelementsCache({ menubar: true })
  res.set('Cache-Control', 'public, max-age=2628000')
  MongoClient.connect(MongoURL, function (err, db) {
    console.log('db connect 15')
    db.collection('teamStructure').aggregate([{
      $match: {
        "mail-active": false,
        year: { $lt: 3 },
        email: { $ne: null }
      }
    },
      {
        $sort: {
          name: 1
        }
      },
      {
        $project: {
          name: '$name',
          username: '$email',
          email: '$alter-mail'
        }
      }]).toArray(function (err, arr) {
        console.log('db call 24')
        attrib.account = arr
        res.render('ins', attrib)
        db.close()
      })
  })
}

function newMember(req, res) {
  console.log('newMember')
  console.log(req.headers['user-agent'])
  if (!req.body.captcha)
    res.send('Captcha error')
  else
    verifyRecaptcha(req.body.captcha, function (success) {
      if (!success)
        res.send('Captcha error')
      else {
        var data = {
          email: req.body.email,
          alterMail: req.body.alterMail,
          gender: req.body.gender,
          subsystem: req.body.subsystem,
          fb: req.body.fb,
          year: 1,
          tel: req.body.tel,
          mailActive: false,
          dept: req.body.dept,
          name: req.body.name,
          rollno: req.body.rollno
        }
        if (data.email && !regexPatterns.emailPatt.test(data.email))
          res.send('Invalid email ID in field TeamKART email ')
        else if (!data.alterMail || !regexPatterns.emailPatt.test(data.alterMail))
          res.send('Invalid Gmail ID')
        else if (!data.tel || !regexPatterns.phonePatt.test(data.tel))
          res.send('Invalid Phone number')
        else if (!data.rollno || !regexPatterns.rollnoPatt.test(data.rollno))
          res.send('Invalid Rollno')
        else if (!data.name)
          res.send('Name is required')
        else if (!data.fb)
          res.send('Facebook Username is required')
        else if (['M', 'F', 'Other'].indexOf(data.gender) == -1)
          res.send('Invalid value in Gender field')
        else if (['Vehicle Dynamics', 'Powertrain', 'CPR'].indexOf(data.subsystem) == -1)
          res.send('Invalid value in Subsystem field')
        else if (require('./depts.js').indexOf(data.dept) == -1)
          res.send('Invalid value in Dept field')
        else
          MongoClient.connect(MongoURL, function (err, db) { })
      }
    })
}

function newMailId(mailId, password, Gmail, _id, callback) {
  MongoClient.connect(MongoURL, function (e, db) {
    db.collection('teamStructure').findOne({ email: mailId, quit: false, alumni: false }, function (e, a) {
      if (a)
        callback(status = "Already exists " + a.email)
      else {
        options = {
          method: 'POST',
          uri: 'https://api.mailgun.net/v3/domains/teamkart.in/credentials',
          auth: {
            user: 'api',
            pass: process.env.MAILGUN_APIKEY
          },
          form: {
            login: mailId,
            password: password
          }
        }
        request(options, function (error, response, body) {
          body = JSON.parse(body)
          if (body.message !== "Created 1 credentials pair(s)")
            callback(body.message)
          else {
            options.uri = "https://api.mailgun.net/v3/routes"
            options.form = {
              expression: "match_recipient('" + mailId + "')",
              action: 'forward("' + Gmail + '")'
            }
            request(options, function (error, response, body) {
              body = JSON.parse(body)
              if (body.message !== 'Route has been created') {
                options.method = 'DELETE'
                options.uri = 'https://api.mailgun.net/v3/domains/teamkart.in/credentials/' + mailId
                request(options, function (error, res, body) { callback(body.message) })
              }
              else {
                db.collection('teamStructure').update({ _id: new mongo.ObjectID(_id) }, {
                  $set: {
                    email: mailId,
                    mailPassword: encrypt(password),
                    'mail-route-id': body.route.id
                  }
                }, function (e, r) {
                  if (e)
                    callback('Database Error')
                  else if (r.result.nModified == 1)
                    callback('Success')
                  else
                    callback('Invalid access credentials')
                })
              }
            })
          }
        })
      }
    })
  })
}

function mailBots(req, res) {
  console.log(req.body)
  res.send('OK')
}

function trailingSlashStripper(req, res, next) {
  console.log('trailingSlashStripper')
  if (req.url.split('?')[0].slice(-1) === '/')
    return res.redirect(301, req.url.substring(0, req.url.length - 1))
  next()
}

var app = express()

//app.use( logger( 'dev' ) )
app.use(compression())
app.head('/', ping)
app.get('/', homePage)
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.engine('hbs', expressHbsInstance)
app.set('view engine', 'hbs')
app.use(trailingSlashStripper)
app.get('/newsFeedContent', newsFeedContent)
app.get('/blogFeedContent', blogFeedContent)
app.get('/randomGalleryView', randomGalleryView)
app.use('/gallery/', galleryHandler)
app.use('/member-selections', function (req, res, next) {
  if ((new Date()) < (new Date('Aug 23 2016 20:00:00 GMT+0530')))
    res.status(200).sendFile(__dirname + '/public/form.html')
  else
    next()
})
app.use('/blog', blogPage)
app.get('/team', teamPage)
app.get('/contact', contactPage)
app.get('/mail-id-instructions', mailIdIns)
app.post('/message', newMessage)
app.post('/mail-handler', mailBots)
app.use(cookieParser())
app.use(session({
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 1
  },
  store: new MongoStore({
    uri: MongoURL,
    collection: 'sessions'
  }),
  secret: process.env.RECAPTCHA,
  saveUninitialized: false,
  resave: false
}))
app.get('/new-account', function (req, res) {
  if (!req.session.new)
    res.sendFile(__dirname + '/private/newAccount.html')
  else {

  }
})
app.get('/unsubscribe', unsubscribe)
app.post('/unsubscribe', feedback)
app.post('/subscribe', subscribeRequest)
app.post('/logs', emailLogger)
app.use(checkRedirects)
app.use(express.static('./public'))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(function (username, password, done) {
  console.log('local')
  MongoClient.connect(MongoURL, function (err, db) {
    if (err)
      return done(err)
    var User = db.collection('users')
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err) }
      if (!user)
        return done(null, false)
      if (!isValidPassword(user, password))
        return done(null, false)
      db.close()
      return done(null, user)
    })
  })
}))
passport.serializeUser(function (user, done) {
  console.log('serial')
  done(null, user._id)
})
passport.deserializeUser(function (id, done) {
  console.log('deserial')
  MongoClient.connect(MongoURL, function (err, db) {
    if (err)
      return done(err)
    var User = db.collection('users')
    User.findOne({ _id: id }, function (err, user) {
      db.close()
      done(err, user)
    })
  })
})
app.get('/login', login)
app.get('/signout', signOut)
app.post('/login', passport.authenticate('local', {
  successRedirect: '/adminpanel',
  failureRedirect: '/login'
}))
app.get('/adminpanel', isAuthenticated, adminPanel)
app.get('/purgecache', function (req, res) {
  CACHE = {}
  res.status(200).send('OK')
})
app.get('*', notfound404)
app.listen(process.env.PORT)
