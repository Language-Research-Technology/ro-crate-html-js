
function render(di, config, libPath, places) {

    const {displayDisplayableValue, displayDisplayableProp, displayDisplayableItem, displayPlaces} = require('../lib/display');
  
  // TODO some template selection in here...
  
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
  
  <!-- Bootstrap CSS -->
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">  
  <script type="application/ld+json"> 
    ${JSON.stringify(di.graph.getJson(), null, 2)}
  </script>
  
  <title>${displayDisplayableProp(di.displayableProps.name, false)}</title>
  
  <meta charset='utf-8'/>
  
  <style> 
  
  dl {
    padding: 0;
    margin: 0;
  
  }
  dt {
    /* adjust the width; make sure the total of both is 100% */
    background: #green;
    padding: 0;
    margin: 0;
  }
  dd {
    /* adjust the width; make sure the total of both is 100% */
    background: #dd0
    padding: 0;
    margin-left: 20;
  }
  details {
    border-left-style: solid;
    border-left-color: red;
    margin: 20;
    padding: 10;
  }
  
  summary {
    font-weight: bold;
    font-size: larger;

  }
  
  </style>
  
  </head>
  
  
  <body>
  
  <nav class="navbar">
  
      <ul class="nav navbar-nav" >
          <li ><a href="${di.getHomeLink()}"><span class="glyphicon glyphicon-home dataset_name">HOME</span></a></li>
      </ul>
  
    </nav>
  <div class="container">
  <div class="jumbotron">
  
  <h3 class="item_name">${displayDisplayableProp(di.displayableProps["@type"], false)}: ${displayDisplayableProp(di.displayableProps.name, false)}</h3>
  </div>  
  
  
  
  
  ${displayPlaces(places, config)}
  
  ${displayDisplayableItem(di)}
  
  
  <a href="./ro-crate-metadata.json">⬇️🏷️ Download all the metadata for <span class='name'>${displayDisplayableProp(di.displayableProps.name, false)}</span> in JSON-LD format</a>
  
  
  </body>
  </html>
  `}
  
  module.exports = render;