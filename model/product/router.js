const controller = require('./controller')
const { Router } = require('express')
const router = Router()
const isAuthAdmin = require('../../middleware/isAuthAdmin')

/*
  free:
    getBySlug
    getById
  admin
    all
    adminGet(without translation)
    updateById
    deleteById
*/
router
  .get('/', isAuthAdmin, (...args) => controller.findAll(...args))
router
  .post('/', isAuthAdmin, (...args) => controller.create(...args))

router.get('/search/:text', (...args) => controller.search(...args))
router.get('/search/' , (...args) => controller.search(...args))

router.route('/id/:id')
  .get((...args) => controller.findById(...args))
  .put(isAuthAdmin, (...args) => controller.updateById(...args))
  .delete(isAuthAdmin, (...args) => controller.removeById(...args))

router.get('/admin/id/:id', isAuthAdmin, (...args) => controller.findById(...args))
router.get('/admin/:slug', isAuthAdmin, (...args) => controller.findBySlug(...args))

router.get('/:slug', (...args) => controller.findBySlug(...args))

// router.get('/:slug/categories', (...args) => controller.getCategories(...args))

router.get('/:slug/similar-products', (...args) => controller.getSimilarProductsBySlug(...args))
router.get('/:slug/similar-categories', (...args) => controller.getSimilarCategoriesBySlug(...args))

router.get('/:slug/looks', (...args) => controller.findLooksBySlug(...args))

module.exports = router
