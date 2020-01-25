module.exports = app => {
  const express = require('express')
  const jwt = require('jsonwebtoken')
  const AdminUser = require('../../models/AdminUser')
  const assert = require('http-assert')
  const router = express.Router({
    mergeParams: true
  })
  // const req.Model = require('../../models/req.Model')
  router.post('/', async(req, res, next) => {
    const model = await req.Model.create(req.body)
    res.send(model)
  })

  router.put('/:id', async(req, res, next) => {
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body)
    res.send(model)
  })

  // 登录效验中间件
  const authMiddleware = require('../../middleware/auth')

  //  资源中间件
  const resourceMiddleware = require('../../middleware/resource')

  router.delete('/:id', async(req, res, next) => {
    await req.Model.findByIdAndDelete(req.params.id, req.body)
    res.send({
      success: true
    })
  })

  router.get('/', async(req, res, next) => {
    // const queryOptions = {}
    // if (req.Modle.modelName === 'Category') {
    //   queryOptions.populate = 'parent'
    // }
    const items = await req.Model.find().populate('parent').limit(10)
    res.send(items)
  })
  
  router.get('/:id', async(req, res, next) => {
    const model = await req.Model.findById(req.params.id)
    res.send(model)
  })
  app.use('/admin/api/rest/:resource', authMiddleware(), resourceMiddleware(), router)


  const multer = require('multer')
  const upload = multer({dest: __dirname + '/../../uploads'})

  app.post('/admin/api/upload', authMiddleware(), upload.single('file'), async(req, res, next) => {
    const file = req.file
    file.url = `http://localhost:3000/uploads/${file.filename}`
    res.send(file)
  })

  app.post('/admin/api/login', async(req, res, next) => {
    const {username, password} = req.body
    // 1. 根据用户名找用户
    const user = await AdminUser.findOne({username}).select('+password')
    assert(user, 422, '用户不存在')
    // 2. 效验密码
    const isValid = require('bcrypt').compareSync(password, user.password)
    assert(isValid, 422, '密码错误')
    // 3. 返回token
    const token = jwt.sign({
      id: user._id,
      // _id: user._id,
      // username: user.username
    },
    app.get('secret'))
    res.send({token})
  })

  // 错误处理
  app.use(async (err, req, res, next) => {
    res.status(err.statusCode || 500).send({
      message: err.message
    })
  })
}