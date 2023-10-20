import Config from "./static-html-config";

const config = new Config();
import renderPage from "../defaults/metadata_template.js";
import GeoJSON from "geojson";


function displayPlaces(places, config) {
  // Places is an array
  if (places && places.length > 0) {
    var jsonFile = GeoJSON.parse(places, {Point: ['latitude', 'longitude']})
    var jsonString = JSON.stringify(jsonFile, null, 2)

    const dir = config.geoURL || "http://localhost:8081";
    return `
        <link rel='stylesheet' href='${dir}/css/leaflet.css'/>
        <script src='${dir}/js/jquery-3.5.1.min.js'></script>
        <script src='${dir}/js/leaflet.js'></script>
        <script src='${dir}/js/timeSliderControl.js'></script>
        <link rel='stylesheet' href='${dir}/css/jquery-ui.css'/>
        <script src='${dir}/js/jquery-ui.js'></script>
        <link rel='stylesheet' href='${dir}/css/style.css'/>
        <link rel='stylesheet' href='${dir}/css/MarkerCluster.css'/>
        <link rel='stylesheet' href='${dir}/css/MarkerCluster.Default.css'/>
        <script src='${dir}/js/leaflet.markercluster.js'></script>
        <div id='mapdiv' style='height: 420px;'></div>
        <script src='${dir}/js/mapmaker.js'></script><!-- Handles a lot of the marker stuff -->
        <script>mapinit(${JSON.stringify(places)})</script>
        <br><a id='download_link'><button>Export as geoJSON</button></a><br>
                        
        <script>
            var data = new Blob([${JSON.stringify(jsonString, null, 2)}], {type: 'text/json'});
            var url = window.URL.createObjectURL(data);
            document.getElementById('download_link').href = url;
            document.getElementById('download_link').download = "file.json"
        </script> 
        `
  } else {
    return ``;
  }
}


function displayDisplayableValue(dv, opts) {
  if (!opts) {
    opts = {summary: false, noLink: false}
  }
  const {summary, noLink} = opts;
  var html = "";
  if (!summary && dv.displayableItem) {
    html += displayDisplayableItem(dv.displayableItem, true);
  } else if (dv.url && !noLink) {
    html = `
                <span><a href="${dv.url}">${dv.text}</a></span>
               `;
  } else {
    html = dv.text;
  }
  return html;
}


function displayPage(page) {
  var html = "";
  if (page.pages.length > 0) {
    for (let p of page.pages) {
      if (p.first && p.last) {
        html += `
                        <details style='margin-left: 3%'>
                            <summary>
                                ${displayDisplayableValue(p.first, {
          summary: true,
          noLink: true
        })} -to- ${displayDisplayableValue(p.last, {summary: true, noLink: true})}
                            </summary>
                            ${displayPage(p)}
                        </details>
                `;
      }
    }
  } else {
    if (page.values.length > 1) {
      html += "";
      for (let p of page.values) {
        html += `
                        <div>${displayDisplayableValue(p)}</div>
                        `;
      }
      html += "";
    } else if (page.values[0]) {
      html += `${displayDisplayableValue(page.values[0])}`;
    }
  }
  html += "";
  return html;
}

function displayDisplayableProp(dp, showName) {
  // dp is a displayableProp
  if (showName == undefined) {
    showName = true;
  }
  var html = "";

  if (showName) {
    html = `
            <dl>
              <dt>${displayPropName(dp)}</dt>
              <dd>${displayPage(dp.paginatedValues)}</dd>
            </dl>
            `;
  } else {
    html += `
            ${displayPage(dp.paginatedValues)}
            `;
  }
  return html;
}

function displayDisplayableProps(di) {
  // dp is a displayableItem
  var html = ``;
  for (let prop of Object.keys(di.displayableProps)) {
    if (!di.doNotDisplayProps[prop]) {
      html += displayDisplayableProp(di.displayableProps[prop])
    }
  }
  return html;
}

function displayDisplayableReverseProps(di) {
  // dp is a displayableItem
  var html = ``;
  if (Object.keys(di.displayableReverseProps).length > 0) {
    html += `
            <dl>
            <dt>Reverse Properties</dt>
            <dd>
            `
    for (let prop of Object.keys(di.displayableReverseProps)) {
      if (!di.doNotDisplayReverseProps[prop]) {
        html += `${displayDisplayableProp(di.displayableReverseProps[prop])}`
      }
    }
    html += `
            </dd>
            </dl>
             `


  }
  return html;
}

function displayDisplayableItem(di, embedded) {
  di.doNotDisplayProps["name"] = true;
  di.doNotDisplayProps["@id"] = true;
  di.doNotDisplayProps["@type"] = true;

  var html = `<div id="${di.itemID.replace(/^#/, "")}">`;
  var linkStartTag = "";
  var linkEndTag = ""
  const path = di.itemID;
  const types = di.graph.utils.asArray(di.item["@type"]);
  if (path.match(/^https?:\/\//i)) {
    linkStartTag += `
            Go to:
            `;
  } else if (types.includes("Dataset")) {
    if (di.item["distribution"]) {
      for (let dist of this.crate.utils.asArray(di.item["distribution"])) {
        const download = this.crate.getItem(dist["@id"]);
        // Dealing with legacy - we used to have path mapped to contentUrl
        if (download) {
          var downloadName = download.name ? download.name : name;
          var u = download["contentUrl"] ? download["contentUrl"] : download["path"];
          if (u) {
            html += `<a href="${u}">⬇️📦 Download this dataset: ${downloadName}</a>`
            html += "<br><br>";
          }
        }
      }
    }
  } else if (types.includes("File") || types.includes("ImageObject") || types.includes("MediaObject")) {
    linkStartTag += `
        ⬇️ Download: <a href="${di.getRelDataPath()}">`;

  } else if (di.relPath) {
    linkStartTag += `<a href="${di.getLink()}">`;
    linkEndTag += "</a>";
  }
  // Previews
  var imageHtml = "";
  if ((types.includes("Dataset") || types.includes("File") || types.includes("ImageObject") || types.includes("MediaObject"))) {
    if (path.match(/(\.txt)|(\.html?)|(\.md)$/i)) {
      imageHtml += `<iframe src='${di.getRelDataPath(path)}' width='100%' height='500'></iframe>`;
    } else if (path.match(/(\.mp3)|(\.ogg?)|(\.wav)$/i)) {
      itemHtml += `<audio controls><source src='${di.getRelDataPath(path)}'/></audio>`;
    } else if (path.match(/(\.jpe?g)|(\.png)$/i)) {
      imageHtml += `<img width='100%' style='object-fit: contain' src='./${di.getRelDataPath(path)}'/>`;
    } else if (path.match(/pdf$/i)) {
      imageHtml += `<embed  src="./${di.getRelDataPath(path)}" type="application/pdf" width="100%" height="600px" />`;
    }
  }

  if (Object.keys(di.displayableProps).filter(p => !di.doNotDisplayProps[p]).length < 3) {
    html += `
            <dl>
            <dt>${displayDisplayableProp(di.displayableProps["@type"], false)}:
            ${linkStartTag}${displayDisplayableProp(di.displayableProps.name, false)}${linkEndTag}</dt>
            <dd>
            ${displayDisplayableProps(di)}
            ${displayDisplayableReverseProps(di)}
            <dd>
            </dl>
            `;

  } else if (embedded) {
    html += `
        <details>
            <summary>
                ${displayDisplayableProp(di.displayableProps["@type"], false)}:
                ${linkStartTag}${displayDisplayableProp(di.displayableProps.name, false)}${linkEndTag}
            </summary>
            ${displayDisplayableProps(di)}
            ${displayDisplayableReverseProps(di)}
            ${imageHtml}
        </details>
    `;
  } else {
    html += `
            
                ${displayDisplayableProps(di)}
                ${displayDisplayableReverseProps(di)}
                ${imageHtml}  
        `;
  }
  html += "</div>";
  return html;
}


function displayPropName(displayableProp) {
  const c = displayableProp.graph;
  var href = c.resolveTerm(displayableProp.name);
  const same = c.getItem(href);
  if (same && same.sameAs) {
    href = same.sameAs["@id"];
  }
  if (href) {
    return (`<span class="prop">${displayableProp.name} [<a class="prop" href="${href}">?</a>]</span>`);
  } else {
    return (`<span class="prop">${displayableProp.name}</a>`);
  }
}


export {
  displayDisplayableValue,
  displayDisplayableProp,
  displayDisplayableItem,
  renderPage,
  displayPlaces
}
