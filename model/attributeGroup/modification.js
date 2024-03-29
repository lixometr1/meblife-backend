const Modification = require('../../lib/modification')
const facade = require('./facade')
module.exports = class AttributeGroupModification extends Modification {

    translate() {
        this.item = facade.translate(this.item, this.langId, this.defaultLangId)
        return this
    }
}