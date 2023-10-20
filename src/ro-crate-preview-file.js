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

import path from "path";
import fs from "fs"
import ejs from "ejs"
import defaults from "../lib/defaults.js";

class HtmlFile  {
    constructor(preview) {
        this.preview = preview;
    }
    async  render(render_script) {
        const templatePath = path.join(process.cwd(), "defaults", "metadata_template.html");
        var temp = fs.readFileSync(templatePath, { encoding: "utf8" });
        this.preview.template = ejs.compile(temp);
        this.preview.crate.index();
        await this.preview.crate.resolveContext();
        var rootNode = this.preview.crate.getRootDataset();
        var name = rootNode.name;
        if (!render_script) {
            render_script = defaults.render_script;
        }
           
        const summary = await this.preview.summarizeDataset();
    
        var date = new Date(); 
        var timestamp = date.getTime(); 
        return this.preview.template({
            html: summary,
            dataset_name: name,
            item_name: name,
            citation: this.preview.text_citation,
            up_link: "",
            time_stamp: timestamp,
            ROCrate_version: this.preview.crate.defaults.ROCrate_version,
            spec_id: this.preview.crate.defaults.DataCrate_Specification_Identifier,
            json_ld: JSON.stringify(this.preview.crate.getJson(), null, 2),
            render_script: render_script
        })  
    }
 }

export default HtmlFile;
