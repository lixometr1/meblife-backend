const controller = require('./controller')
const { Router } = require('express')
const isAuthAdmin = require('../../middleware/isAuthAdmin')
const router = Router()

router
  .get('/', isAuthAdmin, (...args) => controller.findAll(...args))
router
  .post('/', isAuthAdmin, (...args) => controller.create(...args))

router.route('/id/:id')
  .put(isAuthAdmin, (...args) => controller.updateById(...args))
  .get((...args) => controller.findById(...args))
  .delete(isAuthAdmin, (...args) => controller.removeById(...args))

router.get('/admin/id/:id', isAuthAdmin, (...args) => controller.findById(...args))
router.get('/admin/:slug', isAuthAdmin, (...args) => controller.findBySlug(...args))

router.get('/search/:text', isAuthAdmin, (...args) => controller.search(...args))
router.get('/search/', isAuthAdmin, (...args) => controller.search(...args))


router.route('/:slug')
  .get((...args) => controller.findBySlug(...args))

module.exports = router
