var fs = require('fs-extra');
var path = require('path');

module.exports = {
  
  updateDataJson: function(patternlab, pattern, data){
    var jsonPath = path.resolve(patternlab.config.paths.public.root, 'additionalPatternsData.json');
    var patternData = require(jsonPath);
    patternData.patterns[pattern] = data;
    // path.resolve(patternlab.config.paths.public.root, 'additionalPatternsData.json')
    return fs.outputFileSync(jsonPath, JSON.stringify(patternData, null, 2));
    
  }
};

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile()
  } catch (err) { return false }
}
