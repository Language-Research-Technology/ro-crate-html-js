
function render(id, preview) {


// TODO some template selection in here...
const item = preview.crate.getItem(id);
return `
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<!-- Bootstrap CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">


<script type="application/ld+json"> 
  ${JSON.stringify(preview.crate.getJson(), null, 2)}
</script>

<title>${item.name}</title>

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


<script>
const config = ${JSON.stringify(preview.config)};
const entryId = "${id}";
const places = ${JSON.stringify(preview.places)}
</script>

<script src="${preview.defaults.multi_page_render_script}"> </script>





</head>


<body>

<nav class="navbar">

    <ul class="nav navbar-nav" >
        <li ><a href="${preview.config.utils.getHomeLink(id)}"><span class="glyphicon glyphicon-home dataset_name">HOME</span></a></li>
    </ul>
    
  </nav>
<div class="container">
<div class="jumbotron">
<div id="check"> </div>

<h3 class="item_name">${preview.displayValuesAsString(item["@type"])} <a href="#${id}">${preview.displayValuesAsString(item.name)}</a></h3>
</div>  

${preview.displayPlaces()}
<div id="summary">



${preview.completeDataset(item["@id"])}

</div>


<a href="./ro-crate-metadata.json">⬇️🏷️ Download all the metadata for <span class='name'>${item.name}</span> in JSON-LD format</a>


</body>
</html>
`}

export default render = render;
