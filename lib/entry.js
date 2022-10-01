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
const Preview = require("./ro-crate-preview");
const Checker = require("ro-crate").Checker;
const ROCrate = require("ro-crate").ROCrate;
const config = {};

var meta;
var preview;

async function check() {
    var checker = new Checker(meta);
    await checker.check();
    document.getElementById("check").innerHTML = `<details><summary>${checker.summarize()}</summary><a href='#___check___'><pre>${checker.report()}</pre></a></details>`;
};

async function load() {
    if (!meta) {
         meta = new ROCrate(
                 JSON.parse(document.querySelector('script[type="application/ld+json"]').innerHTML)
        );
        preview = await new Preview(meta, config);
        meta.resolveContext().then(function () {updatePage()}); // This is async
    }
    var css = document.createElement('style');
    css.type = 'text/css';
    var styles = 'summary { display: list-item; }';
    css.appendChild(document.createTextNode(styles));

   document.getElementsByTagName("head")[0].appendChild(css);
        
         
   document.getElementsByTagName("body").append
   document.getElementById("check").innerHTML = "<button><a href='#___check___'>Check this crate</a></button>";
    updatePage();
}

window.onhashchange = function () {
    load();
};

window.onload = function () {
    load();
};



async function updatePage() {
    var hash = location.hash;

    if (hash.startsWith("#___check")) {
        check();
    } else if (hash) {
        await preview.display(unescape(hash.replace("#", "")));
    } else {
        await preview.display(preview.root["@id"]);
    }
}
