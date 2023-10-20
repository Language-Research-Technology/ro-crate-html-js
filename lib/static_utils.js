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

import pairtree from "pairtree";
import path from "path";
class StaticUtils {
    hasOwnPage(item, config) {
        // Check if something 
        if (!Array.isArray(item["@type"])) {
            item["@type"] = [ item["@type"]];
        }
        if (!config.types) {
            config.types = {};
        }
        const typeOverlap = Object.keys(config.types).filter(value => item["@type"].includes(value));
        return typeOverlap.length > 0
    }

   getLink(baseID, toID){
        const from = this.segmentPath(baseID);
        const to = this.segmentPath(toID);
        const rel = path.relative(`${from}`, `${to}`);
        return path.join(rel, "ro-crate-preview.html");
   }

   getImagePath(baseID, toID){
    const from = this.segmentPath(baseID);
    const to = toID;
    const rel = path.relative(`${from}`, `${to}`);
    return path.join(rel);
}

   getHomeLink(baseID) {
        return path.join(path.relative(`/${this.segmentPath(baseID)}`, "/"), "ro-crate-preview.html");
   }


   getRelDataPath() {
        return path.join(path.relative("/" + this.rootDisplayableItem.graph._relPath, "/" + this.itemID));
    }

   segmentPath(p) {
        if (p === "./") {
                return "/";
        }    
        return `/ro-crate-preview_files${pairtree.path(p.replace(/^#/, ""))}`;
    }
}

export default StaticUtils;
