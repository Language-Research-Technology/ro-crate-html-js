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

const pairtree = require("pairtree");
import Config from "./static-html-config";
const config = new Config();
import Page from "./paginate";
import renderPage from "../defaults/default_template.js";


function makeHtml(item, crate) {
  if (!item["@reverse"]) {
    item["@reverse"] = {};
  }
  const displayed = {};
  if (item["@type"].includes("Person")) {
    return renderPerson(item, crate);
  }
  return renderPage({
      title: item.name,
      content: summarizeItem(item["@id"], crate, displayed),
      json: JSON.stringify(crate.getJson(), null, 2),
      heading: item.name,
      crate: crate,
      getLinkToPath: getLinkToPath,
      getLinkToMetadata: getLinkToMetadata
    });
}


function summarizeItem(id, crate, displayed) {
  if (!displayed) {
    displayed = {};
  }
  //const item = _.clone(crate.getItem(id));
  const item = crate.getItem(id);

  //console.log("DISPLAYING", id, item);
  const stopRecursing = displayed[id] || false;
  displayed[id] = true;

  var table = ``;
  for (let prop of Object.keys(item)) {
    /*
  if (prop === "!@reverse") {
     table += `<div class="flex bg-white-200">${prop}</div>`
     for (let revProp of Object.keys(item["@reverse"])) {
        const reverse = new Page({values: item["@reverse"][revProp], pageSize: Config.pageSize});
        table += `<div class="flex-initial text-gray-700 text-center bg-gray-400 px-4 py-2 m-2">${revProp}
                 </div>
                 <div class="flex-initial text-gray-700 text-center bg-gray-400 px-4 py-2 m-2">${displayPage(reverse, crate, displayed, stopRecursing)}
                 </div>`;
      }
      table += "</div>"
  } else {
      */
    var cell = `${display(item[prop], crate, displayed, stopRecursing)}`;
    table += `
            <div class="flex bg-green-200">
            <div class="flex-initial text-gray-700 text-center bg-yellow-400 px-4 py-2 m-2 w-64">${prop}</div>
            <div class="flex-initial text-gray-700 text-center  px-4 py-2 m-2">${cell}</div>
            </div>
            `
    // }
  }
  table += "";
  return table;
}


function getLink(item, thisCrate) {
  return path.join(path.relative(thisCrate._relPath, segmentPath(item["@id"])), "ro-crate-preview.html");
}


function getRootLink(p, thisCrate) {
  return path.relative(thisCrate._relPath, p);
}

function getLinkToPath(p, thisCrate) {
  return path.join(path.relative(thisCrate._relPath, segmentPath(p)), "ro-crate-preview.html");
}

function getLinkToMetadata(p, thisCrate) {
  return path.join(path.relative(thisCrate._relPath, segmentPath(p)), "ro-crate-metadata.json");
}


function segmentPath(p) {
  if (p === "/") {
    return "/";
  }
  return "/ro-crate-preview_files/" + pairtree.path(p.replace(/^#/, ""));
}

function displayVal(v, crate, displayed, stopRecursing) {
  var cell = ""
  if (v && v["@id"]) {
    const target = crate.getItem(v["@id"]);
    if (stopRecursing && target) {
      cell += `${target.name}`
    } else if (target) {
      if (config.hasOwnPage(target)) {
        cell += `<a href='${getLink(target, crate)}'>${target.name}</a>`;
      } else {
        // TODO - make this a link
        cell += summarizeItem(target["@id"], crate, displayed)
      }
    }
  } else {
    cell += `<div>${v}</div>`;
  }
  return cell;
}

function displayPage(page, crate, displayed, stopRecursing) {
  var html = "";
  if (page.pages.length > 0) {
    for (let p of page.pages) {
      html += `
<details style='margin-left: 3%'>
    <summary>
        ${displayVal(p.first, crate, displayed, true)} -to- ${displayVal(p.last, crate, displayed, true)}
    </summary>
    ${displayPage(p, crate, displayed, stopRecursing)}
</details>
            `
    }
  } else {
    if (page.values.length > 1) {
      html += "<ul>";
      for (let p of page.values) {
        html += `<li>${displayVal(p, crate, displayed, stopRecursing)}</li>`;
      }
      html += "</ul>"
    } else {
      html += `<p>${displayVal(page.values[0], crate, displayed, stopRecursing)}</p>`;
    }
  }
  return html;
}

function display(val, crate, displayed, stopRecursing) {
  if (!Array.isArray(val)) {
    val = [val];
  }
  const l = val.length;
  page = new Page({values: val, pageSize: config.pageSize});
  return displayPage(page, crate, displayed, stopRecursing);
}

function renderSentences(items, crate) {
  result = "<ul>";
  for (item of crate.utils.asArray(items)) {
    const target = crate.getItem(item["@id"]);
    if (target) {
      const sent = "";
      result += `
                <li>
                    <details style='margin-left: 3%'>
                         <summary>${target.name}</summary>
                         ${summarizeItem(item["@id"], crate)}
                    </details>  
                </li>
            `
    }
  }
  result += "</ul>";
  return result;
}


function renderPerson(item, crate) {
  const pdfPath = item["@reverse"]["about"][0]["@id"];
  return renderPage({
      title: item.name,
      content: `
            Born: ${item.birthDate} - ${crate.getItem(item["birthPlace"]["@id"]).name}
                    
            <h1>Convictions</h1>
                   
            ${renderSentences(item["@reverse"]["object"], crate)}
            
            <h2>Prison Record</h2>
            <iframe src='${pdfPath}' width='100%' height='500'></iframe>
            `,
      json: JSON.stringify(crate.getJson(), null, 2),
      heading: item.name,
      crate: crate,
      getLinkToPath: getLinkToPath,
      getLinkToMetadata: getLinkToMetadata
    })

}


export const summarizeItem = summarizeItem;
export const getLink = getLink;
export const getRootLink = getRootLink;
export const segmentPath = segmentPath;
export const display = display;
export const makeHtml = makeHtml;


