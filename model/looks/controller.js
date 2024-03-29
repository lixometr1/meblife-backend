const Controller = require('../../lib/controller')
const looksFacade = require('./facade')
const productFacade = require('../product/facade')
const categoryFacade = require('../category/facade')
const manufacturerFacade = require('../manufacturer/facade')
const Modification = require('./modification')

class LooksController extends Controller {
    async findByProductSlug(req, res, next) {
        try {
            const product = await productFacade.findBySlug(req.params.slug, req.request.language._id)
            const items = await this.facade.findByProductId(product._id.toString())
            const resolvers = items.map(async item => {
                const instance = new Modification(item, {
                    langId: req.request.language._id,
                    defaultLangId: req.settings.language._id,
                    currency: req.settings.currency,
                    defaultCurrency: req.settings.currency,
                })
                await instance.init()
                return instance.toINFO()
            })
            const allItems = await Promise.all(resolvers)
            const toSend = await this.facade.paginate({ items: allItems, nowPage: req.query.page, perPage: req.query.perPage })

            res.json(toSend)
        } catch (err) {
            next(err)
        }
    }
    async findByCategorySlug(req, res, next) {
        try {
            const category = await categoryFacade.findBySlug(req.params.slug, req.request.language._id)
            const items = await this.facade.findByCategoryId(category._id.toString())
            const resolvers = items.map(async item => {
                const instance = new Modification(item, {
                    langId: req.request.language._id,
                    defaultLangId: req.settings.language._id,
                    currency: req.settings.currency,
                    defaultCurrency: req.settings.currency,
                })
                await instance.init()
                return instance.toINFO()
            })
            const allItems = await Promise.all(resolvers)
            const toSend = await this.facade.paginate({ items: allItems, nowPage: req.query.page, perPage: req.query.perPage })
            res.json(toSend)
        } catch (err) {
            next(err)
        }
    }
    async findByManufacturerSlug(req, res, next) {
        try {
            const manufacturer = await manufacturerFacade.findBySlug(req.params.slug, req.request.language._id)
            const items = await this.facade.findByManufacturerId(manufacturer._id.toString())
            const resolvers = items.map(async item => {
                const instance = new Modification(item, {
                    langId: req.request.language._id,
                    defaultLangId: req.settings.language._id,
                    currency: req.settings.currency,
                    defaultCurrency: req.settings.currency,
                })
                await instance.init()
                return instance.toINFO()
            })
            const allItems = await Promise.all(resolvers)
            const toSend = await this.facade.paginate({ items: allItems, nowPage: req.query.page, perPage: req.query.perPage })
            res.json(toSend)
        } catch (err) {
            next(err)
        }
    }


}

module.exports = new LooksController(looksFacade, Modification)
