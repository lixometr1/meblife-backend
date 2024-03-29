const Facade = require('../../lib/facade')
const ProductSchema = require('./schema')
const AppError = require('../../helpers/error')
const _ = require('lodash')
const AttributeModification = require('../attribute/modification')
class ProductFacade extends Facade {
    constructor(...args) {
        super(...args)
        this.fieldsToTranslate = ['name', 'slug', 'description']
        this.fieldsToPopulate = ['manufacturer', 'category', 'labels', 'attributes.name', 'attributes.value', 'model', 'primary_category']
        this.relations = [
            {
                model: "Module",
                field: 'module_items.$[].item',
                async resolver({ model, id }) {
                   const result = await model.updateMany({}, { $pull: { 'module_items': { item: id } } }, { multi: true })
                }
            }
        ]
    }

    async populateFields(product) {
        this.fieldsToPopulate.forEach(async field => {
            await product.populate(field).execPopulate()
        })
        return product

    }
    /**
     * 
     * @param {*} catId 
     * @param {Object} filters {price: [100, 200], attributes: [ {name: {slug: "some"},value: [{slug: "a"}, {slug: "b"}] } ]}
     */
    async findByCategoryId(catId) {
        const inCategory = await this.Model.find({ 'category': catId })
        const inPrimaryCategory = await this.Model.find({ 'primary_category': catId })

        return [...inPrimaryCategory, ...inCategory]
    }
    async findByPrimaryCategoryId(catId) {
        const inPrimaryCategory = await this.Model.find({ 'primary_category': catId })

        return inPrimaryCategory
    }
    async findByManufacturerId(id) {
        const products = await this.Model.find({
            manufacturer: id
        })
        return products
    }
    async findSimilarProductsBySlug(slug, langId) {
        const product = await this.findBySlug(slug, langId)
        if (!product) throw new AppError(404)
        const catId = product.primary_category
        let items = await this.findByPrimaryCategoryId(catId)
        items = items.filter(item => item._id.toString() !== product._id.toString())
        return items
    }
    /**
     * 
     * @param {Array} products 
     * @param {Object} filters {price: [], manufacturer: ['slug'], labels: ['slug'], delivery: '24h' | '14' | '30', attributes: [{name: 'slug', value: ['slug']}]}
     */
    filterProducts(products, filters) {
        if (!filters) return products
        return products.filter(product => {
            // [0, 100]
            if (filters.price) {
                let price = filters.price
                if (product.price > price[1] || product.price < price[0]) return false
            }
            if (filters.manufacturer) {
                const check = filters.manufacturer.map(manufacturer => product.manufacturer.slug === manufacturer)
                if (!check.includes(true)) return false
            }
            if (filters.labels) {
                const check = filters.labels.map(label => product.labels.findIndex(pLabel => pLabel.slug === label) >= 0)
                if (!check.includes(true)) return false
            }
            if (filters.delivery) {
                if (filters.delivery === '24h') {
                    if (!product.delivery_24) return false
                } else {
                    const deliveryDays = parseInt(filters.delivery)
                    if (!product.delivery_24) {
                        if (!isNaN(deliveryDays)) {
                            if (product.delivery_days !== 0 && !product.delivery_days) return false
                            if (product.delivery_days > deliveryDays) return false
                        } else {
                            return false
                        }
                    }

                }
            }
            if (!_.isEmpty(filters.attributes)) {
                const check = filters.attributes.map(attr => {
                    // attr: {name: "some", value: ["some", "other"]}
                    const pAttrIdx = product.attributes.findIndex(pAttr => pAttr.name.slug === attr.name)
                    if (pAttrIdx < 0) return false

                    if (product.attributes[pAttrIdx].name.attribute_type === 'decimal') {
                        const from = parseInt(attr.value[0])
                        const to = parseInt(attr.value[1])
                        const attrValue = parseInt(product.attributes[pAttrIdx].value[0].slug)
                        if (isNaN(from) || isNaN(to) || isNaN(attrValue)) return false
                        if (attrValue > to) return false
                        if (attrValue < from) return false
                    } else {
                        const checkAttrVal = attr.value.map(attrVal => {
                            return product.attributes[pAttrIdx].value.findIndex(pAttrVal => pAttrVal.slug === attrVal) >= 0
                        })
                        if (!checkAttrVal.includes(true)) return false
                    }

                    return true

                })
                if (!check.includes(true)) return false
            }

            return true
        })
    }
    /**
     * 
     * @param {Array} products 
     * @param {String} type 'cheap' | 'expansive' | 'popular' | 'sale' | 'new'
  
     */
    sortProducts(products, type) {
        if (type === 'cheap') {
            products.sort((a, b) => a.price - b.price)
        }
        if (type === 'expansive') {
            products.sort((a, b) => b.price - a.price)
        }
        if (type === 'popular') {
            return products
        }
        if (type === 'sale') {
            products.sort((a, b) => {
                if (!a.promotion) {
                    return 1;
                }
                if (!b.promotion) {
                    return -1
                }
                return b.promotion.value - a.promotion.value
            })
        }
        if (type === 'new') {
            products.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        }


        return products
    }
    /**
     * 
     * @param {Array} products - 
     */
    getFilters(products, gotFilters) {
        if (_.isEmpty(products)) return {}
        let filters = {}
        products.forEach(product => {
            if (!filters.price) filters.price = new Set()
            if (!filters.manufacturer) filters.manufacturer = []
            if (!filters.labels) filters.labels = []
            if (!filters.attributes) filters.attributes = []
            filters.price.add(product.price)
            filters.manufacturer.push({
                _id: product.manufacturer._id,
                name: product.manufacturer.name,
                slug: product.manufacturer.slug
            })
            const labels = product.labels
            labels.forEach(label => filters.labels.push({ name: label.name, slug: label.slug, _id: label._id }))
            product.attributes.forEach(attr => {
                const attrIdx = filters.attributes.findIndex(fAttr => fAttr.name._id.toString() === attr.name._id.toString())
                if (attrIdx >= 0) {
                    if (!filters.attributes[attrIdx].value) {
                        filters.attributes[attrIdx].value = []
                    }
                    filters.attributes[attrIdx].value = filters.attributes[attrIdx].value.concat(attr.value)

                } else {
                    filters.attributes.push({
                        name: new AttributeModification(attr.name).toINFO(),
                        value: attr.value.map(val => ({ _id: val._id, name: val.name, slug: val.slug }))
                    })
                }
            })

        })
        const prices = Array.from(filters.price)
        filters.price = [Math.min(...prices), Math.max(...prices)]
        filters.labels = filters.labels.filter((label, index) =>
            filters.labels.findIndex(lab => lab._id.toString() === label._id.toString()) === index)

        filters.manufacturer = filters.manufacturer.filter((manufacturer, index) =>
            filters.manufacturer.findIndex(man => man._id.toString() === manufacturer._id.toString()) === index)

        filters.attributes = filters.attributes.map(attribute => {
            attribute.value = attribute.value.filter((attrValue, index) =>
                attribute.value.findIndex(attr => attr._id.toString() === attrValue._id.toString()) === index)
            if (attribute.name.attribute_type === 'decimal') {
                const values = attribute.value.map(attrVal => parseInt(attrVal.slug))
                attribute.value = [Math.min(...values), Math.max(...values)]
            }
            return attribute
        })
        return filters

    }
    async test(slug, langId) {
        return await this.Model.find({
            'slug.value': slug
        }).populate('manufacturer').populate('attributes.name attributes.value').where({
        })
    }
}

module.exports = new ProductFacade('Product', ProductSchema)
