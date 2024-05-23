/* 

This is part of ro-crate-html-js a tool for generating HTMl 
previews of HTML files.

Copyright (C) 2021  University of Technology Sydney

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");
const defaults = require("./defaults");


class HtmlFile {
    constructor(preview) {
        this.preview = preview;
    }
    async render(render_script) {
        const templatePath = path.join(__dirname, "..", "defaults", "metadata_template.html");
        var temp = fs.readFileSync(templatePath, { encoding: "utf8" });
        const template = ejs.compile(temp);
        await this.preview.crate.resolveContext();
        return template(this.preview.templateParams(render_script));
    }
}

module.exports = HtmlFile;