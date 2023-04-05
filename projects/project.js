class ProjectHeader extends CustomElm{
	constructor(text){
		super();
		this.define(html`
			<div class="background"></div>
			<h1>${html`${text}`(text)}</h1>
		`);
	}
}
defineElm(ProjectHeader,(()=>{
	let size="400px";

	return scss`&{
		${theme.elementReset}
		${theme.center}
		height: ${size};
		z-index: 2;
		position: relative;
		overflow: hidden;
		>.background{
			position: absolute;
			inset: 0;
			background: url("image.png");
			background-position: center;
			background-repeat: no-repeat;
			background-size: cover;
			filter: blur(3px);
		}
		> h1{
			position: relative;
			background-color: ${theme.color.greyStep(0)};
			${theme.font.title}
			padding: 10px 20px;
			border-radius: 100px;
			${theme.centerText}
		}
	}`})()
);

// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
}`());

// Create data
let pages=bind([
	{
		id:"home",
		text:"Home",
		selected:false,
	},
	{
		id:"projects",
		text:"Projects",
		selected:true,
	},
	{
		id:"about",
		text:"About Me",
		selected:false,
	},
	{
		id:"contact",
		text:"Contact",
		selected:false,
	}
]);

trackPage(window.location.pathname);
// Set up paging
function setPage(id){
	// Don't need to track this page here since the page will be tracked when the new url loads
	window.location.href="/"+id;
}

// Set up scroll watcher
let scrollPosition=bind(0);
document.addEventListener('scroll',()=>{
	scrollPosition.data=window.scrollY;
});
function scrollToTop(){
	window.scrollTo(0,Math.min(window.scrollY,401));
}

let screenWidth=bind(window.innerWidth);
window.addEventListener("resize",()=>{
	screenWidth.data=window.innerWidth;
});
let isMobile=def(()=>screenWidth.data<600,screenWidth);

// Create main elements
let headerElm=new ProjectHeader(title);
let navElm=new Nav(pages,scrollPosition);
let pageElm=new Page(page);

// Populate page html
let body=html`
	${headerElm}
	${navElm}
	${pageElm}
`().data;
addElm(body,document.body);
body.disolve();

let head=html`
	<title>${title.data}</title>
`(title).data;
addElm(head,document.head);
head.disolve();
