var pluginName = 'plugin-node-pattern-lab-state-output';
var path = require('path');
var fs = require('fs-extra');
var util = require('./src/util');
/**
 * Wrap each pattern HTML in START/END comments.
 * (<!-- START: pattern-name -->...<!-- END: pattern-name -->)
 *
 * (Emitted after patterns are iterated over to gather data about them. Right before Pattern Lab
 * processes and renders patterns into HTML.)
 *
 * @params {Object} patternlab - contains all patterns in {Array} `patternlab.patterns`
 *
 * */
function appendPatternDetails(patternlab) {
  
  for (var i = 0; i < patternlab.patterns.length; i++) {
    
    patternlab.patterns[i].template = '<!-- START: '
      + patternlab.patterns[i].name
      + ' -->\n'
      + patternlab.patterns[i].template
      + '\n<!-- END: '
      + patternlab.patterns[i].name
      + ' -->\n';
  }
}

/**
 * Update pattern data.
 *
 * (Emitted after a pattern's template, HTML, and encoded HTML files are written to their output location)
 *
 * @params {Object} patternlab
 * @params {Object} pattern - recently outputted pattern
 *
 * */
function onPatternIterate (patternlab, pattern) {
  console.log('onPatternIterate');
  if (pattern.relPath.indexOf('probably-not-needed') === -1 &&
    (pattern.relPath.indexOf('.mustache') !== -1 ||
      pattern.relPath.indexOf('.json') !== -1)) {
    
    // lineageState or patternState or 'inprogress' (first in state cascade) as fallback if nothing is defined
    var state = (pattern.lineageState !== undefined) ?
      pattern.lineageState : (pattern.patternState === '') ?
        patternlab.config.patternStateCascade[0] : pattern.patternState;
    
    updatePatternState(patternlab, pattern, state);
  }
}

/**
 * Read and update pattern state in .md file.
 *
 * @params {Object} patternlab
 * @params {Object} pattern - recently outputted pattern
 * @params {Object} pattern - pattern state
 *
 * */
function updatePatternState(patternlab, pattern, newState){
  
  var currentJsonData = {};
  currentJsonData['patternLink'] = pattern.patternLink;
  currentJsonData['patternState'] = newState;
  util.updateDataJson(patternlab, pattern.name, currentJsonData);
  
}

function registerEvents (patternlab) {
  console.log('Register Events');
  // Emitted after patterns are iterated over to gather data about them. Right before Pattern Lab processes and renders patterns into HTML.
  patternlab.events.on('patternlab-pattern-iteration-end', appendPatternDetails);
  // Emitted after a pattern's template, HTML, and encoded HTML files are written to their output location
  patternlab.events.on('patternlab-pattern-write-end', onPatternIterate);
}

function getPluginFrontendConfig () {
  return {
    'name': pluginName,
    'templates': [],
    'stylesheets': [],
    'javascripts': [],
    'onready': '',
    'callback': ''
  }
}


function pluginInit (patternlab) {
  console.log('Init Plugin');
  if (!patternlab) {
    console.error('patternlab object not provided to plugin-init');
    process.exit(1);
  }
  
  var pluginConfig = getPluginFrontendConfig();
  
  try {
    fs.outputFileSync(path.resolve(patternlab.config.paths.public.root, 'additionalPatternsData.json'),
      JSON.stringify({patterns: {}}, null, 2));
  } catch (ex) {
    console.trace(
      'plugin-node-tab: Error occurred while writing additionalPatternsData.json in '
      + patternlab.config.paths.public.root);
    console.log(ex);
  }
  
  if (!patternlab.plugins) {
    patternlab.plugins = []
  }
  
  patternlab.plugins.push(pluginConfig);
  
  
  registerEvents(patternlab);
  patternlab.config[pluginName] = true;
}

module.exports = pluginInit;
