// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
	${theme.font.secondary}
	${theme.font.sizeStep(0)}
	.scrollContainer{
		max-height:100vh;
		overflow-y:scroll;
		&.lock{
			overflow-y:hidden;
		}
	}
}`());

// Create data
let library=bind({
	books:[
		{
			title:"Twenty Thousand Leagues Under the Seas",
			author:"Jules Verne",
			year:"1870",
			description:"A journey under the sea exploring the wonders of the depths.",
			icon:"",
			src:"library/twenty-thousand-leagues-under-the-seas",
			chapters:[
				//PART 1
				{
					type:"div",
					title:"PART 1"
				},{
					title:"Chapter 1",
					time:0,
					src:"part1/chapter1.mp3",
					selected:false,
				},{
					title:"Chapter 2",
					time:0,
					src:"part1/chapter2.mp3",
					selected:false,
				},{
					title:"Chapter 3",
					time:0,
					src:"part1/chapter3.mp3",
					selected:false,
				},{
					title:"Chapter 4",
					time:0,
					src:"part1/chapter4.mp3",
					selected:false,
				},{
					title:"Chapter 5",
					time:0,
					src:"part1/chapter5.mp3",
					selected:false,
				},{
					title:"Chapter 6",
					time:0,
					src:"part1/chapter6.mp3",
					selected:false,
				},{
					title:"Chapter 7",
					time:0,
					src:"part1/chapter7.mp3",
					selected:false,
				},{
					title:"Chapter 8",
					time:0,
					src:"part1/chapter8.mp3",
					selected:false,
				},{
					title:"Chapter 9",
					time:0,
					src:"part1/chapter9.mp3",
					selected:false,
				},{
					title:"Chapter 10",
					time:0,
					src:"part1/chapter10.mp3",
					selected:false,
				},{
					title:"Chapter 11",
					time:0,
					src:"part1/chapter11.mp3",
					selected:false,
				},{
					title:"Chapter 12",
					time:0,
					src:"part1/chapter12.mp3",
					selected:false,
				},{
					title:"Chapter 13",
					time:0,
					src:"part1/chapter13.mp3",
					selected:false,
				},{
					title:"Chapter 14",
					time:0,
					src:"part1/chapter14.mp3",
					selected:false,
				},{
					title:"Chapter 15",
					time:0,
					src:"part1/chapter15.mp3",
					selected:false,
				},{
					title:"Chapter 16",
					time:0,
					src:"part1/chapter16.mp3",
					selected:false,
				},{
					title:"Chapter 17",
					time:0,
					src:"part1/chapter17.mp3",
					selected:false,
				},{
					title:"Chapter 18",
					time:0,
					src:"part1/chapter18.mp3",
					selected:false,
				},{
					title:"Chapter 19",
					time:0,
					src:"part1/chapter19.mp3",
					selected:false,
				},{
					title:"Chapter 20",
					time:0,
					src:"part1/chapter20.mp3",
					selected:false,
				},{
					title:"Chapter 21",
					time:0,
					src:"part1/chapter21.mp3",
					selected:false,
				},{
					title:"Chapter 22",
					time:0,
					src:"part1/chapter22.mp3",
					selected:false,
				},{
					title:"Chapter 23",
					time:0,
					src:"part1/chapter23.mp3",
					selected:false,
				},{
					title:"Chapter 24",
					time:0,
					src:"part1/chapter24.mp3",
					selected:false,
				},
				//PART 2
				{
					type:"div",
					title:"PART 2"
				},{
					title:"Chapter 1",
					time:0,
					src:"part2/chapter1.mp3",
					selected:false,
				},{
					title:"Chapter 2",
					time:0,
					src:"part2/chapter2.mp3",
					selected:false,
				},{
					title:"Chapter 3",
					time:0,
					src:"part2/chapter3.mp3",
					selected:false,
				},{
					title:"Chapter 4",
					time:0,
					src:"part2/chapter4.mp3",
					selected:false,
				},{
					title:"Chapter 5",
					time:0,
					src:"part2/chapter5.mp3",
					selected:false,
				},{
					title:"Chapter 6",
					time:0,
					src:"part2/chapter6.mp3",
					selected:false,
				},{
					title:"Chapter 7",
					time:0,
					src:"part2/chapter7.mp3",
					selected:false,
				},{
					title:"Chapter 8",
					time:0,
					src:"part2/chapter8.mp3",
					selected:false,
				},{
					title:"Chapter 9",
					time:0,
					src:"part2/chapter9.mp3",
					selected:false,
				},{
					title:"Chapter 10",
					time:0,
					src:"part2/chapter10.mp3",
					selected:false,
				},{
					title:"Chapter 11",
					time:0,
					src:"part2/chapter11.mp3",
					selected:false,
				},{
					title:"Chapter 12",
					time:0,
					src:"part2/chapter12.mp3",
					selected:false,
				},{
					title:"Chapter 13",
					time:0,
					src:"part2/chapter13.mp3",
					selected:false,
				},{
					title:"Chapter 14",
					time:0,
					src:"part2/chapter14.mp3",
					selected:false,
				},{
					title:"Chapter 15",
					time:0,
					src:"part2/chapter15.mp3",
					selected:false,
				},{
					title:"Chapter 16",
					time:0,
					src:"part2/chapter16.mp3",
					selected:false,
				},{
					title:"Chapter 17",
					time:0,
					src:"part2/chapter17.mp3",
					selected:false,
				},{
					title:"Chapter 18",
					time:0,
					src:"part2/chapter18.mp3",
					selected:false,
				},{
					title:"Chapter 19",
					time:0,
					src:"part2/chapter19.mp3",
					selected:false,
				},{
					title:"Chapter 20",
					time:0,
					src:"part2/chapter20.mp3",
					selected:false,
				},{
					title:"Chapter 21",
					time:0,
					src:"part2/chapter21.mp3",
					selected:false,
				},{
					title:"Chapter 22",
					time:0,
					src:"part2/chapter22.mp3",
					selected:false,
				},{
					title:"Chapter 23",
					time:0,
					src:"part2/chapter23.mp3",
					selected:false,
				},
			]
		},{
			title:"The Machine Stops",
			author:"EM Forster",
			year:"1909",
			description:"Underground mankind lives in complete comfort. Every want and need catered to by The Machine. But no machine can last forever.",
			icon:"",
			src:"library/the-machine-stops",
			chapters:[
				{
					title:"Chapter 1",
					time:0,
					src:"1.mp3",
					selected:false,
				},{
					title:"Chapter 2",
					time:0,
					src:"2.mp3",
					selected:false,
				},{
					title:"Chapter 3",
					time:0,
					src:"3.mp3",
					selected:false,
				},
			]
		},{
			title:"Star Catcher",
			author:"Adrian Margel",
			year:"2024",
			description:"Each night the sky grows dimmer of stars. Join a man on his quest to uncover the reason and attempt to stop it.",
			icon:"",
			src:"library/star-catcher",
			chapters:[
				{
					title:"Star Catcher",
					time:0,
					src:"star-catcher.mp3",
					selected:false,
				}
			]
		}
	]
});
let title=bind("Audio Books");
let pages=bind([
	{
		id:"library",
		text:"Library",
		selected:true,
		content: new LibraryPage(library.books)
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

let selectedBook=bind({
	title:"NONE",
	author:"",
	year:"0",
	description:"",
	icon:"",
	src:"",
	chapters:[]
});
let selectedChapter=bind({
	title:"NONE",
	time:0,
	timeMax:1,
	src:"",
	selected:false,
});
let player=new AudioPlayer(selectedBook,selectedChapter);
let audio=new AudioManager(selectedBook,selectedChapter);

let scrollPosition=bind(0);
// Create main elements
let headerElm=new Header(title);
let navElm=new Nav(pages,scrollPosition);
let pageElm=new Page(selectedPage);

// Populate page html
let body=html`
	<div class="scrollContainer">
		${player}
		${headerElm}
		${navElm}
		${pageElm}
	</div>
`();
addElm(body,document.body);
body.disolve();

// Set up scroll watcher
getElm(".scrollContainer",document).addEventListener('scroll', (e)=>{
	scrollPosition.data=e.target.scrollTop;
});

/*
TODO:
-volume
-paging paths
-server/website
-persistance

-add controls (SPACE+arrows)
-sync audio with device play/pause/next
-mobile styles
-download
-book icons
*/
