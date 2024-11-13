var fs = require('fs');
var data = fs.readFileSync('./static_data/country.json', 'utf8');
var results = JSON.parse(data);

module.exports.getAllCountry = function() {
    return results;
}

module.exports.getCountryById = function(id) {
    return results.find(i => i.id == id);
};

