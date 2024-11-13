var fs = require('fs');
var data = fs.readFileSync('./static_data/role.json', 'utf8');
var results = JSON.parse(data);

module.exports.getAll = function() {
    return results;
}

module.exports.getById = function(id) {
    return results.find(i => i.id == id);
};

