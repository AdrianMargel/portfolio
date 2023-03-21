

var arrow = $('.arrow-down');
var title = $('.intro-text');

var high = $(window).height();
var st = $(this).scrollTop();

var fullProject=!(document.getElementsByClassName("project-display-full").length==0);
var projectList = JSON.parse(readTextFile("projects/projects.json"));
//var projectList = JSON.parse(readTextFile("projects/projects.json"));
projectList.sort(function(a, b){return a.weight - b.weight});

// document.getElementById("debug").innerHTML = "N/A";
title.css({
    'margin-top' : 40 - (st/high*40) + "vh"
});
arrow.css({
    'opacity' : 1 - st/60
});

// document.getElementById('log').innerHTML = 't<br>Some new content!';

window.onload = function() {
   var currentCat=localStorage.getItem("catStore");
   if(currentCat==null){
   	setCategory(getCategory(),projectList);
   	//document.getElementById("debug").innerHTML = getCategory();
   }else{
   	setCategory(currentCat,projectList);
   	//document.getElementById("debug").innerHTML = currentCat;
   }
}

$(window).on('scroll', function() {
	st = $(this).scrollTop();
	arrow.css({
	    'opacity' : Math.max(1 - st/60,0)
	});

	title.css({
	    'margin-top' : 40 - (st/high*40) + "vh"
	});
});

$(window).resize(function(){
  	high = $(window).height();
	st = $(this).scrollTop();
	title.css({
	    'margin-top' : 40 - (st/high*40) + "vh"
	});
});

function readTextFile(file)
{
	var allText="";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
                // document.getElementById("debug").innerHTML = allText;
            }
        }
    }
    // console.log(rawFile);
    rawFile.send(null);
    return allText;
}

/*function readTextFile(path) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', path, true);
	xhr.responseType = 'blob';
	xhr.onload = function(e) { 
	  if (this.status == 200) {
	      var file = new File([this.response], 'temp');
	      var fileReader = new FileReader();
	      fileReader.addEventListener('load', function(){
	           console.log(fileReader.result);
	      });
	      fileReader.readAsText(file);
	  } 
	}
	xhr.send();
}*/

/*function readTextFile(path) {
	var reader = new FileReader();
	reader.onload = function(e) {
	  var text = reader.result;
	  console.log(text);
	}

	reader.readAsText(path);

}*/

function setProjects(cat, pList){
	resetProjects();
	for (var i = 0; i < pList.length; i++) {
		var cats=pList[i].categories;
		for(var j = 0; j<cats.length;j++){
			if(cats[j].category==cat){
				addProject(pList[i]);
			}
		}
	}
	if(fullProject){
		pad();
	}
}

function resetProjects(){
	var toRemove = document.getElementsByClassName('project-item');
	for(var i=toRemove.length-1;i>=0;i--){
		toRemove[i].parentNode.removeChild(toRemove[i]);
	}
	if(fullProject){
		var toRemove2 = document.getElementsByClassName('spacer');
		for(var i=toRemove2.length-1;i>=0;i--){
			toRemove2[i].parentNode.removeChild(toRemove2[i]);
		}
	}
}

function addProject(toAdd) {
    var div = document.createElement('div');

    if(toAdd.highlight){
    	div.className = 'project-item highlight';
	}else{
		div.className = 'project-item';
	}

	var categoryString="";
	for(let i=0;i<toAdd.categories.length;i++){
		if(i>0){
			categoryString+=" ";
		}
		categoryString+="#"+toAdd.categories[i].category;
	}
    div.innerHTML =
        '<div class="background-to-add"></div>\
        <div class="over"></div>\
        <a href="'+"projects/"+toAdd.name+"/project.html"+'">\
          <div class="description">\
            <h3>'+toAdd.title+'</h3>\
			<p>'+toAdd.description+'</p>\
            <p class="fake-link">view project...</p>\
			<p class="categories-list">'+categoryString+'</p>\
          </div>\
        </a>\
        <div class="caption"><h3><a href="'+"projects/"+toAdd.name+"/project.html"+'">'+toAdd.title+'</a></h3></div>';

    document.getElementById('project-load').appendChild(div);
    var addBack = document.getElementsByClassName("background-to-add")[0];
    addBack.style.backgroundImage = "url('projects/"+toAdd.name+"/image.png')";
    addBack.className = "background";
}

function pad() {
	for(var i=0;i<4;i++){
	    var div = document.createElement('div');
	    div.classList.add("spacer");
	    document.getElementById('project-load').appendChild(div);
	}
}

function setCategory(cat){
	localStorage.setItem("catStore",cat);
	var selected = document.getElementById('cat-'+cat);
	setProjects(cat,projectList);

	var deselect = document.getElementsByClassName('category-button');
	for(var i=0;i<deselect.length;i++){
		deselect[i].classList.remove("selected");
	}
	selected.classList.add("selected");
}

function getCategory(){
	var select = document.getElementsByClassName('category-button selected');
	var cat = select[0].id;
	return cat.substring(4, cat.length);
}