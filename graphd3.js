var rootarray = [];
var discroot;
var discnodes;
var rootindex = 0;
var treenodes = [];
var width,height,diagonal,svg,root,index,obj,tip,zoom;
var trees = [];
var treeindex = -1;
var nodes = [];
var links = [];
var text = [];
var presindex = -1;
var status = 0;

//initializes the tree
function treeinitialize()
{
  width = 2000;
  height = 800;

  diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.x, d.y]; });

  svg = d3.select("#mainDisplay").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(100,0)")

  tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
    	return "Name: "+d.name+"\nId: "+d.id+"\nDepth: "+d.depth;
  	})  

  svg.call(tip);	
}

//creates and stores the trees
function createtree(source) 
{
	if(source!=null)
  {
    treeindex++;
    trees[treeindex] = d3.layout.tree()
      .size([ width,height]);
    svg.selectAll("*").remove();
    nodes[treeindex] = [];
    nodes[treeindex] = trees[treeindex].nodes(source).reverse();
    links[treeindex] = trees[treeindex].links(nodes[treeindex]);
  }
}

//draws the trees step-by-step
function drawtree () 
{
  if(status == 0)
  {
    alert("Load data to start !!!");
  }
  else
  {
    var treeindex = ++presindex;
    if(treeindex >= text.length)
    {
      document.getElementById('txt').innerHTML = "End of the graph";
    }  
    else
    {
    document.getElementById('txt').innerHTML = text[treeindex];

    //nodes of the tree
    nodes[treeindex].forEach(function(d) {d.y = d.depth * 40 + 20;});
  
    var node = svg.selectAll("g.node")
      .data(nodes[treeindex], function(d) { return d.id});
 
    var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        return "translate(" + d.x + "," + d.y + ")"; });

    nodeEnter.append("rect")
      .attr("width", 45)
      .attr("height", 30)
      .attr("x", function(d) { 
        return d.children || d._children ? -23 : 23; })
      .attr("y", function(d) { 
        return d.children || d._children ? -15 : 15; })
      .style("fill", "#fff")
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide)

    nodeEnter.append("text")
      .attr("x", function(d) { 
        return d.children || d._children ? -20 : 20; })
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1);

    //links of the tree
    var link = svg.selectAll("path.link")
      .data(links[treeindex], function(d) { return d.target.id; });

    link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", diagonal);
    }
  }
}

//finds the source and target of the edge
function drawedge(srcname,targname)
{
  if(navigateTree(root,srcname)!=1)
  {
    addnode(srcname);
  }
  if(navigateTree(root,targname)!=1)
  {
    addnode(targname);
  }
  var srcind = findtreenodeindex(srcname);
  var targind = findtreenodeindex(targname);
  if ((srcind!=-1)&&(targind!=-1))
  {
    addedge(root,srcname,targname,treenodes[srcind],treenodes[targind]);
    id = 0;
    setid(root);
    setdepth(root);
    createtree(root);
    text[treeindex] = "Adding edge from '"+srcname+"' to '"+targname+"'";
  }
}

//adds edges to the tree if not present already
function addedge(object,srcname,targname,srcobj,targobj)
{
	if(numofchildren(srcobj) == 2)
	{
	}
	else
	{
      var par = srcobj.parent;
  		targobj.parent = srcobj;
  		if(srcobj.children == null)
        {
          	srcobj.children = [];
        }
  		srcobj.children.push(targobj);
  		if(par == null)
  		{
    	root = srcobj;
  		}
	}
}

//forms a link of the disconnected nodes
function formdiscnodes(src,targ){
      if(discnodes == null)
      {
        discnodes = [];
        targ.id = ++rootindex;
        targ.x = targ.id * 40;
        targ.y = 40;
        discnodes.push(targ);}
      else if(src.children == null)
      {
      src.children = [];
      targ.id = ++rootindex;
      src.children.push(targ);
      }
      else
      {
        formdiscnodes(discnodes.children[0],targ);
      }
}

//adds nodes to the tree if not present already
function addnode(name)
{
  if(findtreenodeindex(name) == -1)
  {
      var newjsonobj = {};
      newjsonobj.name = name;
      newjsonobj.parent = null;
      newjsonobj.children = []; 
      newjsonobj.depth = 0;
      newjsonobj.id = 0;
      treenodes.push(newjsonobj);
      createtree(newjsonobj);
      text[treeindex] = "Adding node '"+name+"'";
  }
}

//navigates through the tree 
function navigateTree(object,name)
{
    if(object!=null)
  	{
  		if(object.name == name)
  		{
    		return 1;
  		}
  		for (var i = 0; i<numofchildren(object); i++)
  		{
  			navigateTree(object.children[i],name);
  		}
  	}
}

//finds the index of the node with the input name
function findtreenodeindex(name)
{
    for(var i=0;i<treenodes.length;i++)
    {
        if(treenodes[i].name == name)
        {
          	return i;
        }
    }
    return -1;
}

//re-calculates the id of each node in the tree
function setid(object)
{
  	for (var i = 0; i<numofchildren(object); i++)
  	{
  		setid(object.children[i]);
  	}
  	if(object!=null)
  	{
  		object.id = ++id;
  	}
}

//re-calculates the depth of each node in the tree
function setdepth(object)
{
 	if((object!=null)&&(object.parent == null))
 	{
  		object.depth = 1;
 	}
 	else
  	{
    	object.depth = object.parent.depth + 1;
  	}
  	for (var i = 0; i<numofchildren(object); i++)
  	{
  		setdepth(object.children[i]);
  	}
}

//finds the number of children of the passed object
function numofchildren(object)
{
  if(object.children != null)
    return object.children.length;
}

var parser = {
  tag: " ",
	useString: function(data){
    //split file data into lines
		parser.lines = data.split('\n');
        parser.currentLine = 0;
	},
	parseLines: function(){
        var args, title, text;
        //parsing each line
        var line = parser.lines[parser.currentLine];
        var split = line.indexOf(']');
        var el = line.slice(0,split);
        if(el.charAt(0) == '['){
            args = el.substr(1).split(' ');
            parser.tag = args.shift();
            title = line.slice(split+1);
        }else{
            args = [];
            parser.tag = '';
            title = '';
            currentLine = -1;
        }
        var nextLine = parser.currentLine+1;
        while(nextLine<parser.lines.length && parser.lines[nextLine][0]!='[') {
            nextLine++;
        }
        text = parser.lines.slice(parser.currentLine+1,nextLine).join('\n');
        parser.dispatch(parser.tag, args, title, text);
        parser.currentLine = nextLine;  
        if(parser.currentLine<parser.lines.length) 
        _.delay(parser.parseLines,1);
        else
        {
          document.getElementById('txt').innerHTML = "Click on the next button to navigate through the steps";
          status = 1;
        }
    },
    dispatch: function(tag, args, title, text){
      //handling nodes and edges separately
        switch (tag) {
            case 'node':
      			addnode(args[0]);
                break;
            case 'edge':
            	drawedge(args[0],args[1]);
                break;
        }
    }
}

//parsing the file data
function generateMovie(logText)
{
	parser.useString(logText);
	parser.parseLines();
}

function loadFile(file) {
    window.location.hash = '';
    var reader = new FileReader();
    reader.onload = function(e) {
      generateMovie(e.target.result);
    }
    if(file) reader.readAsText(file);
}

function handleFileSelect()
{
    //reset the data
    rootarray = [];
    rootindex = 0;
    treenodes = [];
    trees = [];
    treeindex = -1;
    nodes = [];
    links = [];
    text = [];
    presindex = -1;
    status = 0;
    //get the file
    var files = event.target.files;
    var f = files[0];
    document.getElementById('txt').innerHTML = "Loading data...";
    //loading the file
    loadFile(f);
}

//initializes the document
function init(){
  //handles the file select
  $('#file').change(handleFileSelect);
  document.getElementById('txt').innerHTML = "Choose input file to start the graph";
  treeinitialize();
}

$(document).ready(init());
