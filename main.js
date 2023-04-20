// Create global page styles
createStyles(scss`&{
	background-color: ${theme.color.greyStep(-1)};
}`());

// Create data
let title=bind("Adrian Margel");
let projectsList=bind([
	{
		id:"alchemyCircles",
		title:"Alchemy Circles",
		description:"An algorithmic approach to creating alchemy circles.",
		weight: 2,
		highlight: false,
		categories:[
			"programming","design"
		]
	},{
		id: "antFarm",
		title: "Ant Farm",
		weight: 1,
		highlight: false,
		categories:[
			"programming"
		],
		description: "An evolutionary simulation based off langton's ant."
	},
	{
		id: "bot2048",
		title: "2048 AI",
		weight: 1.1,
		highlight: false,
		categories:[
			"programming"
		],
		description: "An AI to play the game 2048."
	},
	{
		id: "botTetris",
		title: "Tetris AI",
		weight: 1.2,
		highlight: false,
		categories:[
			"programming"
		],
		description: "An AI to play a multiplayer version of the game Tetris."
	},
	{
		id: "chainFlocking",
		title: "Chain Flocking",
		weight: 4,
		highlight: false,
		categories:[
			"programming"
		],
		description: "An experiment involving modified flocking algorithms."
	},
	{
		id: "evoCells",
		title: "Evolving Cells",
		weight: 3,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A cellular automaton where cells are able to evolve their rule sets via a genetic algorithm."
	},
	{
		id: "explodeTrees",
		title: "Exploding Trees",
		weight: 5,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A simple test for procedurally generating trees."
	},
	{
		id: "jelly",
		title: "Jelly Engine",
		weight: 5,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A 2D simulation of soft body physics using shape memory to resolve self-intersections."
	},
	{
		id: "pixelLighting",
		title: "Pixel Renderer",
		weight: 3.2,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A lighting engine able to render low resolution 2D environments."
	},
	{
		id: "simpleTexture",
		title: "Simple Textures",
		weight: 4,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A test for procedurally generating pixel art tile textures."
	},
	{
		id: "solarSystem",
		title: "Solar System",
		weight: 3.3,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A gravitational simulation to model the formation of a 3D solar system"
	},
	{
		id: "spiral",
		title: "Spiral Generator",
		weight: 3.4,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A program for rendering complex visually interesting spiral patterns."
	},
	{
		id: "flame",
		title: "Fire Simulation",
		weight: 1,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A visually plausible simulation for low resolution fire."
	},
	{
		id: "buddhabrot",
		title: "Buddhabrot",
		weight: 3.5,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A program for rendering mandelbrot based fractals, most notably the buddhabrot"
	},
	{
		id: "fireBird",
		title: "Fire Bird",
		weight: 1,
		highlight: false,
		categories:[
			"art"
		],
		description: "A phoenix-like digital art bird."
	},
	{
		id: "leviathan",
		title: "Leviathan",
		weight: 1,
		highlight: false,
		categories:[
			"art"
		],
		description: "A piece of fanart for the game Rain World."
	},
	{
		id: "dawnBird",
		title: "The Dawn Wing",
		weight: 2,
		highlight: false,
		categories:[
			"art"
		],
		description: "A pixel art fantasy creature."
	},
	{
		id: "pixelGuns",
		title: "Pixel Art Guns",
		weight: 2.2,
		highlight: false,
		categories:[
			"art"
		],
		description: "A number of pixel art guns."
	},
	{
		id: "botSlitherio",
		title: "Slitherio AI",
		weight: 4,
		highlight: false,
		categories:[
			"programming"
		],
		description: "An AI able to learn the basics of how to play the game Slitherio."
	},
	{
		id: "proceduralInk",
		title: "Procedural Ink",
		weight: 2.5,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A program that creates abstract patterns using the emergent behavior of thousands of particles."
	},
	{
		id: "celestialCircles",
		title: "Celestial Circles",
		weight: 2,
		highlight: false,
		categories:[
			"programming",
			"design"
		],
		description: "A program to generate aesthetically pleasing circular designs."
	},
	{
		id: "mazeGen",
		title: "Maze Generator",
		weight: 3.7,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A program for generating mazes."
	},
	{
		id: "squareEncoder",
		title: "Square Encoder",
		weight: 3.8,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A program able to represent shapes using different sizes of squares."
	},
	{
		id: "usernameGen",
		title: "Username Generator",
		weight: 5,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A program for generating usernames."
	},
	{
		id: "rayTracer",
		title: "Ray Tracer",
		weight: 3.9,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A program able to render simple 3D environments."
	},
	{
		id: "cornerstoneLogo",
		title: "Cornerstone Logo",
		weight: 1,
		highlight: false,
		categories:[
			"design"
		],
		description: "A redone logo for a rural school."
	},
	{
		id: "bethelFlag",
		title: "Bethel Flag",
		weight: 3.61,
		highlight: false,
		categories:[
			"design"
		],
		"description": "A national flag for a church."
	},
	{
		id: "pixelTree",
		title: "Pixel Tree",
		weight: 2.2,
		highlight: false,
		categories:[
			"art"
		],
		description: "A simple pixel art tree."
	},
	{
		id: "enhancedQuotes",
		title: "Enhanced Quotes",
		weight: 1.5,
		highlight: false,
		categories:[
			"design"
		],
		description: "Visually enhanced quotes for posters."
	},
	{
		id: "letterTransforms",
		title: "Letter Transforms",
		weight: 3,
		highlight: false,
		categories:[
			"design"
		],
		description: "A design composed of symbols based on tranforming the lines from different letters in the alphabet."
	},
	{
		id: "patternLetters",
		title: "Pattern Letters",
		weight: 4,
		highlight: false,
		categories:[
			"design"
		],
		description: "Decorative letters using interchangeable modules."
	},
	{
		id: "botSawtooth",
		title: "Sawtooth AI",
		weight: 0.9,
		highlight: false,
		categories:[
			"programming"
		],
		description: "The winning AI in an international AI competition."
	},
	{
		id: "truchetPatterns",
		title: "Truchet Patterns",
		weight: 3.6,
		highlight: false,
		categories:[
			"programming",
			"design"
		],
		description: "A program for procedurally generating Truchet patterns."
	},
	{
		id: "deformedPenrose",
		title: "Deformed Penrose",
		weight: 3.9,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A test in generating aperiodic tiles and applying deformations to them."
	},
	{
		id: "glyphs",
		title: "Glyphs",
		weight: 3.65,
		highlight: false,
		categories:[
			"programming",
			"design"
		],
		description: "A program for procedurally generating glyphs."
	},
	{
		id: "runes",
		title: "Runes",
		weight: 3.65,
		highlight: false,
		categories:[
			"programming",
			"design"
		],
		description: "A program for procedurally generating runes."
	},
	{
		id: "voxelCathedral",
		title: "Voxel Cathedral",
		weight: 1.5,
		highlight: false,
		categories:[
			"art"
		],
		description: "A gothic cathedral built in Minecraft."
	},
	{
		id: "voxelLighting",
		title: "Voxel Lighting",
		weight: 0.85,
		highlight: true,
		categories:[
			"programming"
		],
		description: "A realtime ray tracer supporting dynamic ambient lighting."
	},
	{
		id: "colors3d",
		title: "3D Color Spaces",
		weight: 0.8,
		highlight: true,
		categories:[
			"programming",
			"art"
		],
		description: "A visualisation tool that displays any image as a 3D cloud in color space."
	},
	{
		id: "tetrisPong",
		title: "Tetris Pong",
		weight: 3.55,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A game combining Tetris and Pong."
	},
	{
		id: "koi",
		title: "Koi",
		weight: 2.4,
		highlight: false,
		categories:[
			"programming",
			"design"
		],
		description: "Simulated koi fish."
	},
	{
		id: "ultimateTicTacToe",
		title: "Ultimate Tic Tac Toe",
		weight: 3.55,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A digital version of the game Ultimate Tic Tac Toe."
	},
	{
		id: "waveTank",
		title: "Ripple Tank",
		weight: 3.75,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A 2D pressure wave simulator."
	},
	{
		id: "fluid2d",
		title: "2D Fluid Simulator",
		weight: 3.75,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A 2D fluid simulator."
	},
	{
		id: "teachingGame",
		title: "AI Education Game",
		weight: 1.9,
		highlight: false,
		categories:[
			"programming"
		],
		description: "A small start up using AI to teach highschool students how to program."
	}
]).sort((a,b)=>a.weight.data-b.weight.data);
let selectedCategory=bind("programming");

let initialPage=(window.location.pathname.split("/")[1]??"").toLowerCase();
if(initialPage==""){
	initialPage="home";
}
let pages=bind([
	{
		id:"home",
		text:"Home",
		selected:initialPage=="home",
		content: new HomePage(projectsList,selectedCategory)
	},
	{
		id:"projects",
		text:"Projects",
		selected:initialPage=="projects",
		content: new ProjectsPage(projectsList,selectedCategory)
	},
	{
		id:"about",
		text:"About Me",
		selected:initialPage=="about",
		content: new AboutPage()
	},
	{
		id:"contact",
		text:"Contact",
		selected:initialPage=="contact",
		content: new ContactPage()
	}
]);

// Set up paging
let selectedPage=bind(null);
selectedPage.data=getSelectedPage();
function getSelectedPage(){
	return pages.find(a=>a.selected.data);
}
trackPage(initialPage);
function setPage(id,pushState=true){
	if(id==""){
		id="home";
	}
	if(id===selectedPage?.data?.id?.data){
		//if it is already the correct page then do nothing
		return;
	}
	trackPage(id);
	pages.forEach(a=>a.selected.data=a.id.data==id);
	selectedPage.data=getSelectedPage();
	scrollToTop();
	if(pushState){
		history.pushState([id],"","/"+id);
	}
}
window.onpopstate=function(e){
	if(e.state){
		let id=e.state[0];
		setPage(id,false);
	}else{
		let id=(window.location.pathname.split("/")[1]??"").toLowerCase();
		setPage(id,false);
	}
};

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
let headerElm=new Header(title);
let navElm=new Nav(pages,scrollPosition);
let pageElm=new Page(selectedPage);

// Populate page html
let body=html`
	${headerElm}
	${navElm}
	${pageElm}
`().data;
addElm(body,document.body);
body.disolve();
