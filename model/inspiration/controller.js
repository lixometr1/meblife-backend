const Controller = require('../../lib/controller')
const inspirationFacade = require('./facade')
const Modification = require('./modification')
const categoryFacade = require('../category/facade')
const proudctFacade = require('../product/facade')
const AppError = require('../../helpers/error')
const manufacturerFacade = require('../manufacturer/facade')

class InspirationController extends Controller {
    async findByProductSlug(req, res, next) {
        try {
            const product = await proudctFacade.findBySlug(req.params.slug, req.request.language._id)
            if (!product) throw new AppError(400)
            const inspirations = await this.facade.findByProductId(product._id.toString())
            const resolvers = inspirations.map(async item => {
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
            let toSend = await this.facade.paginate({ items: allItems, perPage: req.query.perPage, nowPage: req.query.page })

            res.json(toSend)
        } catch (err) {
            next(err)
        }
    }
    async findByCategorySlug(req, res, next) {
        try {
            const category = await categoryFacade.findBySlug(req.params.slug, req.request.language._id)
            if (!category) throw new AppError(400)
            const inspirations = await this.facade.findByCategoryId(category._id.toString())
            const resolvers = inspirations.map(async item => {
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
            let toSend = await this.facade.paginate({ items: allItems, perPage: req.query.perPage, nowPage: req.query.page })
            res.json(toSend)
        } catch (err) {
            next(err)
        }
    }
    async findByManufacturerSlug(req, res, next) {
        try {
            const manufacturer = await manufacturerFacade.findBySlug(req.params.slug, req.request.language._id)
            if (!manufacturer) throw new AppError(400)
            const inspirations = await this.facade.findByManufacturerId(manufacturer._id.toString())
            const resolvers = inspirations.map(async item => {
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
            let toSend = await this.facade.paginate({ items: allItems, perPage: req.query.perPage, nowPage: req.query.page })
            res.json(toSend)
        } catch (err) {
            next(err)
        }
    }
    async findBySlugSimilar(req, res, next) {
        try {
            const inspiration = await this.facade.findBySlug(req.params.slug, req.request.language._id)
            if(!inspiration) throw new AppError(404)
            if(!inspiration.manufacturer) {
                res.json([])
                return
            }
            const inspirations = await this.facade.findByManufacturerId(inspiration.manufacturer.toString())
            const resolvers = inspirations.map(async item => {
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
            const toSend = allItems.filter(item => item._id.toString() !== inspiration._id.toString())
            res.json(toSend)
        } catch (err) {
            next(err)
        }
    }
}

module.exports = new InspirationController(inspirationFacade, Modification)
