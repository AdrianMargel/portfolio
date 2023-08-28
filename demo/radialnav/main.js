

// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(1)};
	color: ${theme.color.greyStep(-5)};
	${theme.font.fontSizeStep(0)}
	${theme.font.secondary}
}`());

// Create data
let title=bind("Radial Navigation Menu");
let pages=bind([
	{
		id:"home",
		text:"Home",
		selected:false,
		subPages:[
			{
				id:"browse",
				text:"Browse",
				selected:false,
				content: new AboutPage()
			},
			{
				id:"genre",
				text:"Genre",
				selected:true,
				content: new AboutPage()
			},
			{
				id:"authors",
				text:"Authors",
				selected:false,
				content: new AboutPage()
			},
			{
				id:"search",
				text:"Search",
				selected:false,
				content: new AboutPage()
			}
		]
	},
	{
		id:"library",
		text:"Library",
		selected:true,
		content: new LibraryPage()
	},
	{
		id:"about",
		text:"About",
		selected:false,
		content: new AboutPage()
	},
]);

// Set up paging
let selectedPage=bind(null);
selectedPage.data=getSelectedPage();
function getSelectedPage(){
	return pages.find(a=>a.selected.data);
}
function setPage(id){
	pages.forEach(a=>a.selected.data=a.id.data==id);
	selectedPage.data=getSelectedPage();
}

// Set up sub paging
pages.forEach(a=>{
	if(a.subPages!=null){
		a.paging=bind({},false);
		a.paging.getSelectedSubPage=()=>{
			return a.subPages.find(a=>a.selected.data);
		}
		a.paging.selectedSubPage=bind(null);
		a.paging.selectedSubPage.data=a.paging.getSelectedSubPage();
		a.paging.setSubPage=(id)=>{
			a.subPages.forEach(a=>a.selected.data=a.id.data==id);
			a.paging.selectedSubPage.data=a.paging.getSelectedSubPage();
		}
	}
});


function main(){

	// Set up scroll watcher
	let scrollPosition=bind(0);
	document.addEventListener('scroll', ()=>{
		scrollPosition.data=window.scrollY;
	});

	let pageWidth=bind(document.body.clientWidth);
	let pageObserver=new ResizeObserver(()=>{
		pageWidth.data=document.body.clientWidth;
	});
	pageObserver.observe(document.body);

	// Create main elements
	let headerElm=new Header(title);
	let navElm=new Nav(pages,selectedPage,(id)=>{setPage(id)},scrollPosition,pageWidth);
	let pageElm=new Page(selectedPage);

	// Populate page html
	let body=html`
		${headerElm}
		${navElm}
		${pageElm}
	`().data;
	addElm(body,document.body);
	body.disolve();
}

setTimeout(main,10); // TODO: this is a bit of a hack to make sure main only runs after everything is loaded
