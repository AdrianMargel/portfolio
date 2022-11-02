/*TODO:
	-add decoration (probably fish)
		-performance testing

	-update email
	-move to next chapter when finished
	-fix button click off
	
	-basic tracking
	-mobile friendly
	-accessible/semantic
	-metadata
		-sitemap
		-fav icon
	-SEO/linkable
		-add book pages for easy linking
		-search query
	-error handling/recoverability
		-future proofing

	------------------------------------
	-firefox animation delays
	-memory leaks/ add weakmaps
	-css improvements
		-support comments
		-support comma selectors
*/

// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
	scroll-behavior: smooth;
	&.locked{
		overflow:hidden;
	}
}`());

async function requestBook(book,author,email){
	return await fetch('/request', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			book,
			author,
			email
		})
	});
}

//TODO: avoid duplicate requests
async function getBookInfo(id){
	// await sleep(10000);
	return await fetch(demoPath+"/books/"+id+"/info.json")
	.then(async response=>{
		if (!response.ok) {
			throw new Error("HTTP error "+response.status);
		}
		let resp=await response.json();
		let local=loadBook(id);
		resp.chapters.forEach((c,i)=>{
			c.selected=local?.chapters?.[i]?.selected??i==0;
			c.progress=local?.chapters?.[i]?.progress??0;
		});
		resp.id=id;
		resp.liked=local?.liked??false;
		return resp;
	});
}
function prepBookSave(book){
	let toSave={};
	toSave.chapters=book.chapters.map((c)=>
		({
			selected:c.selected.data,
			progress:c.progress.data
		})
	);
	toSave.liked=book.liked.data;
	return JSON.stringify(toSave);
}
function saveBook(book){
	localStorage.setItem("book-"+book.id.data,prepBookSave(book));
}
function loadBook(bookId){
	return JSON.parse(localStorage.getItem("book-"+bookId));
}
function saveFavourites(toSave){
	localStorage.setItem("favourites",JSON.stringify(toSave));
}
function loadFavourites(){
	return JSON.parse(localStorage.getItem("favourites"));
}
function saveBookmarks(toSave){
	localStorage.setItem("bookmarks",JSON.stringify(toSave));
}
function loadBookmarks(){
	return JSON.parse(localStorage.getItem("bookmarks"));
}
function saveVolume(toSave){
	localStorage.setItem("volume",JSON.stringify(toSave));
}
function loadVolume(){
	return JSON.parse(localStorage.getItem("volume"));
}

async function getFilteredBooks(text,genre,searchType){
	// text=text.trim();
	// searchType=searchType.toLowerCase();

	// if(searchType!="genre"&&text==""){
	// 	return [];
	// }
	// return await fetch('/search', {
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 	},
	// 	body: JSON.stringify({
	// 		text,
	// 		genre,
	// 		type:searchType
	// 	})
	// }).then((response) => response.
	await sleep(100);
	return Array(6).fill().map((_,i)=>i).filter(()=>Math.random()>0.5);
	//TODO: make sure there are no results that are more than books.length
}
function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

//TODO: error handling
//TODO: fetch cancelling

let bookCount=6;
let highlightBooks=bind([1,2,3]);

let books=bind(Array(bookCount).fill());
books.forEach((item,i,arr)=>{
	let loading=false;
	arr[i]=async()=>{
		if(loading){
			return;
		}
		loading=true;
		let result=await getBookInfo(i);
		let keys=Object.keys(result);
		arr[i].lock();
		keys.forEach(k=>{
			arr[i][k]=result[k];
		}); 
		delete arr[i].data;
		arr[i].unlock();

		arr[i].liked.sub(()=>{
			if(arr[i].liked.data){
				like(arr[i].id.data);
			}else{
				unlike(arr[i].id.data);
			}
			saveBook(arr[i]);
		});
		
		arr[i].chapters.forEach((c)=>{
			link(()=>{
				saveBook(arr[i]);
			},c.selected,c.progress);
		});

		return arr[i];
	};
});

let genres=bind([
	{
		id:"historic",
		name:"Historic",
		imgLow:"historic-sm.png",
		imgHigh:"historic.png"
	},{
		id:"scifi",
		name:"Sci Fi",
		imgLow:"historic-sm.png",
		imgHigh:"historic.png"
	},{
		id:"fantasy",
		name:"Fantasy",
		imgLow:"historic-sm.png",
		imgHigh:"historic.png"
	},{
		id:"fiction",
		name:"Fiction",
		imgLow:"historic-sm.png",
		imgHigh:"historic.png"
	},{
		id:"romance",
		name:"Romance",
		imgLow:"historic-sm.png",
		imgHigh:"historic.png"
	},{
		id:"drama",
		name:"Drama",
		imgLow:"historic-sm.png",
		imgHigh:"historic.png"
	},{
		id:"horror",
		name:"Horror",
		imgLow:"historic-sm.png",
		imgHigh:"historic.png"
	},
]);

// Create data
let title=bind("Audio Books");
let searchCriteria=bind({
	text:"",
	type:"Title",
	genre:"all"
});
let searching=bind(false);
let searchResults=bind({data:[]});
let selectedGenre=bind(null,false);
let genreResults=bind({data:[]});

// let initialPage=(window.location.pathname.split("/")[1]??"").toLowerCase();
// let initialSubPage=(window.location.pathname.split("/")[2]??"").toLowerCase();
// if(initialPage=="genre"){
// 	let genre=genres.find(g=>g.id.data==initialSubPage)??genres[0];
// 	selectedGenre.data=genre;
// }
let initialPage="home";
let initialSubPage="";
let pages=bind([
	{
		id:"home",
		text:"Home",
		selected:initialPage=="home"||initialPage=="",
		content: new HomePage(books,genres,highlightBooks)
	},
	{
		id:"search",
		text:"Search",
		selected:initialPage=="search",
		content: new SearchPage(searchCriteria,books,genres,searchResults,searching)
	},
	{
		id:"genre",
		text:"Genre",
		selected:initialPage=="genre",
		content: new GenrePage(books,selectedGenre,genreResults)
	},
	{
		id:"about",
		text:"About",
		selected:initialPage=="about",
		content: new AboutPage()
	},
	{
		id:"request",
		text:"Request",
		selected:initialPage=="request",
		content: new RequestPage()
	},
]);

// Set up paging
let selectedPage=bind(null);
selectedPage.data=getSelectedPage();
function getSelectedPage(){
	return pages.find(a=>a.selected.data);
}
function setPage(id,resetScroll=true,pushState=true){
	if(id==""){
		id="home";
	}
	if(id==selectedPage.data?.id.data&&id!="genre"){
		return;
	}

	if(pushState){
		if(id=="genre"){
			let sub=selectedGenre.data?.id.data??"";
			// history.pushState([id,sub],"","/"+id+"/"+sub);
		}else{
			// history.pushState([id],"","/"+id);
		}
	}
	pages.forEach(a=>a.selected.data=a.id.data==id);
	selectedPage.data=getSelectedPage();
	if(resetScroll){
		window.scrollTo({
			top: Math.min(scrollPosition.data,400),
			behavior: 'instant'
		});
	}
}
window.onpopstate = function(e){
	if(e.state){
		let id=e.state[0];
		if(id=="genre"){
			let sub=e.state[1];
			setGenre(genres.find(g=>g.id.data==sub)??genres[0]);
		}
		setPage(id,true,false);
	}else{
		let id=(window.location.pathname.split("/")[1]??"").toLowerCase();
		let sub=(window.location.pathname.split("/")[2]??"").toLowerCase();
		if(id=="genre"){
			setGenre(genres.find(g=>g.id.data==sub)??genres[0]);
		}
		setPage(id,true,false);
	}
};

// Set up scroll watcher
let scrollPosition=bind(0);
document.addEventListener('scroll', ()=>{
	scrollPosition.data=window.scrollY;
});

let volume=bind(loadVolume()??0.6);
volume.sub(()=>{
	saveVolume(volume.data);
});

let bookmarksMaxLength=12;

let favourites=bind(null,false);
favourites.data=bind(loadFavourites()??[]);
let bookmarks=bind(null,false);
bookmarks.data=bind(loadBookmarks()??[]);

favourites.sub(()=>{
	saveFavourites(favourites.data.map(b=>b.data));
});
bookmarks.sub(()=>{
	saveBookmarks(bookmarks.data.map(b=>b.data));
});

function like(id){
	favourites.lock();
	favourites.data=bind(favourites.data.filter(f=>f.data!=id));
	favourites.data.push(id);
	favourites.unlock();
}
function unlike(id){
	favourites.data=bind(favourites.data.filter(f=>f.data!=id));
}
function bookmark(id){
	bookmarks.lock();
	bookmarks.data=bind(bookmarks.data.filter((f,i,arr)=>
		f.data!=id
	));
	//shorten the array for the correct length only after filtering out any duplicates, otherwise the length will be wrong
	bookmarks.data=bind(bookmarks.data.filter((f,i,arr)=>
		i>arr.length-bookmarksMaxLength
	));
	bookmarks.data.push(id);
	bookmarks.unlock();
}

let openTab=bind("");
let favouritesOpen=def(()=>openTab.data=="favourites",openTab);
let bookmarksOpen=def(()=>openTab.data=="bookmarks",openTab);
let playerOpen=bind(false);
let pageLocked=bind(false);
let playingBook=bind(null,false);
function play(book){
	if(typeof book.data=="function"){
		return;
	}
	bookmark(book.id.data);
	playingBook.data=book;
	playerOpen.data=true;
}
function lockPage(){
	pageLocked.data=true;
}
function unlockPage(){
	pageLocked.data=false;
}
function setGenre(genre){
	selectedGenre.data=genre;
}

let searchNum=0;
async function updateSearch(num){
	searching.data=true;
	let result=await getFilteredBooks(searchCriteria.text.data,searchCriteria.genre.data,searchCriteria.type.data);
	if(searchNum==num){
		searching.data=false;
		searchResults.data=result;
	}
}

let genreNum=0;
async function updateGenre(num){
	let result=await getFilteredBooks("",selectedGenre.data.id.data,"Genre");
	if(genreNum==num){
		genreResults.data=result;
	}
}

link(()=>{
	if(searchCriteria.data!=""){
		setPage("search");
		searchResults.data=[];
		searchNum++;
		updateSearch(searchNum);
	}
},searchCriteria.text,searchCriteria.type,searchCriteria.genre);

link(()=>{
	if(selectedGenre.data!=null){
		genreResults.data=[];
		genreNum++;
		updateGenre(genreNum);
	}else{
		genreResults.data=[];
	}
},selectedGenre)();

link(()=>{
	if(pageLocked.data){
		addClass("locked",document.documentElement);
	}else{
		removeClass("locked",document.documentElement);
	}
},pageLocked)();

// Create main elements
let headerElm=new Header(title);
let navElm=new Nav(openTab,scrollPosition,searchCriteria);
let pageElm=new Page(selectedPage,pageLocked);

// Populate page html
let body=html`
	${headerElm}
	${navElm}
	${new Side("Favourites",scrollPosition,favouritesOpen,favourites)}
	${new Side("History",scrollPosition,bookmarksOpen,bookmarks)}
	${pageElm}
	${new Player(playerOpen,playingBook,volume)}
`().data;
addElm(body,document.body);
body.disolve();
/*
<div style="display:flex">
	${Array(1000).fill().map((_,i)=>`<div style="width:1px; height:100px; background-color:${theme.color.greyStep((i-500)/100)}"></div>`)}
</div>
*/

