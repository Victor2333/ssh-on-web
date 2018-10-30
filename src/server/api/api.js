const express = require('express')
const os = require('os')
const router = express.Router()
const logger = require('../logger')('api')
const UserModel = require('../db').UserModel
const uuidv1 = require('uuid/v1');
const sha512 = require('js-sha512')
const encryptor = require('../encrypt')

router.use((req, resp, next) => {
  const start = new Date();
  next();
  const end = new Date();
  let timeDiff = end - start; // in ms
  
  logger.debug(`Processing URL: '${req.originalUrl}', elapsed time: ${timeDiff}ms`);
})

router.get('/getUsername', (req, res) => {
    logger.debug('req.user', req.user);
    res.json({ username: os.userInfo().username });
  }
)

// read db to get hosts list of the current user.
router.get('/hosts', (req, res) => {
  UserModel.findOne({nt: req.user.nt}, 'hosts', (err, data) => {
    if ( err ) {
      res.status(500).json(err)
    } else {
      res.json(data.hosts)
    }
  })
})

// insert a host into the host list of the current user
router.put('/host', (req, res) => {
  const user = req.user
  const uuid = uuidv1()
  const host = Object.assign({}, req.body)
  host.uuid = uuid
  UserModel.update({nt: user.nt}, {$push: {hosts: host}}, (err, raw) => {
    if (err) {
      res.status(500).json(err)
    } else {
      res.json(host)
    }
  })
})
// delete a host 
router.delete('/host/:uuid', (req, res) => {
  const uuid = req.params['uuid']
  UserModel.update({nt: req.user.nt}, {$pull: {hosts: {uuid: uuid}}}, 
    (err, raw) => {
      if (err){
        res.status(500).json(err)
      } else {
        res.json({uuid: uuid})
      }
  })
})

// update a host
router.post('/host', (req, res) => {
  const user = req.user
  const host = req.body 

  UserModel.update({nt: user.nt, "hosts.uuid": host.uuid}, {$set: {"hosts.$": host}}, 
    (err, raw) => {
      if (err){
        res.status(500).json(err)
      } else {
        res.json({uuid: host.uuid})
      }
    })
})

// --------------------- key apis ----------------
router.put('/key', (req, res) => {
  const user = req.user
  const key = req.body

  // logger.debug("key: ", key)
  key.privatekey = encryptor.encrypt(key.privatekey)
  key.hash = sha512(key.privatekey)

  UserModel.findOne({nt: user.nt, 'keys.hash': key.hash}, (err, doc) => {
    if ( err ) return res.status(500).json(err)
    if (doc) return res.status(409).json({message: 'resource already exists'})
    UserModel.update({nt: user.nt}, {$addToSet: {keys: key}}, (err, raw) => {
      if (err) return res.status(500).json(err)
      res.json({hash: key.hash})
    })
  })
})
router.get('/keys', (req, res) => {
  const user = req.user
  UserModel.findOne({nt: user.nt}, 'keys', (err, doc) => {
    if (err) return res.status(500).json(err)
    doc['keys'].forEach(key => {
      key.privatekey = '***'
    })
    res.json(doc['keys'])
  })
})

// delete key
router.delete('/key/:hash', (req,res) => {
  const user = req.user
  const hash = req.params['hash']

  UserModel.update({nt: req.user.nt}, {$pull: {keys: {hash: hash}}}, 
    (err, raw) => {
      if (err){
        res.status(500).json(err)
      } else {
        res.json({hash: hash})
      }
  })
})

router.get('/login-status', (req, res) => {
  logger.debug('login_status')
  res.json({islogin: true})
})

module.exports = router;
