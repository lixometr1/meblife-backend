const Modification = require('../../lib/modification')
const facade = require('./facade')
module.exports = class AttributeModification extends Modification {

    translate() {
        this.item = facade.translate(this.item, this.langId, this.defaultLangId)
        return this
    }
    async init() {
        this.translate()
    }
    toINFO() {
        return {
            _id: this.item._id,
            name: this.item.name,
            attribute_type: this.item.attribute_type,
            slug: this.item.slug,
            groupId: this.item.groupId,
        }
    }

}