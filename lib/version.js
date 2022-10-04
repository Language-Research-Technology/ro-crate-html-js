const defaults = require("./defaults.js");
const pkg = require('../package.json');
const majorMinor = pkg.version.slice(0, pkg.version.lastIndexOf('.'));
defaults.render_script = defaults.multi_page_render_script = defaults.render_script_fn(majorMinor);

exports.version = pkg.version;
