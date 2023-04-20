class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/3d-color-space">Github</a></p>
				<p class="center bold projectLink"><a href="demo" rel="nofollow">Demo</a></p>
				${new ImageDisplay("img/colors-wild.png")}
				<p>
					This program allows color spaces to be easily and intuitively visualised. It can take any image and display it as a 3D cloud in color space. By taking every pixel in an image and treating its RGB values as XYZ coordinates the image can be remapped into 3D space.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					The inspiration for this project came from researching color theory from a computational perspective. After reading an <a href="https://iquilezles.org/articles/palettes/">article</a> about using mathematics to define color pallets I was interested to see what else you could do with color theory. While learning about color theory I very quickly found that most resources on the subject fall into one of two categories: incredibly simplistic explanations written by artists, or hieroglyphic math written by academics. There is a huge amount of complexity in color theory but its almost impossible to get a deep understanding of it from just reading academic papers.
				</p>
				<p>
					I wanted a tool that could allow me to see 3D color space in a visual way. I searched online for something that could do this but came up short. There are a few programs out there, but none with the fidelity I was looking for. So I built my own. I had recently learned the basics of WebGL and decided to use this as an opportunity to practice those skills.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Implementation</h2>
				<p>
					In order to solve this problem I wrote a raytracer that could handle rendering of translucent objects. The raytracer is written to render voxels within a 256x256x256 space which lends itself very nicely to using a Sparse Voxel Octree (SPO). I'm not going to go into detail on the implementation of the raytracer here, but if you are interested in raytracing please see my <a href="https://adrianmargel.ca/projects/voxelLighting">Voxel Lighting Engine</a>.
				</p>
				<p>
					This may seem like overkill but in fact using a raytracer is the only way to correctly render opacity for volumetric data. For example here is a close up of a single yellow voxel. You can see that the opacity is rendered based on the volume of material which each ray passes through. This gives each voxel an aerogel-like appearance which could not be calculated any other way.
				</p>
				${new ImageDisplay("img/cube-compare.png")}
				<p>Here you can see the entire color space rendered, notice how each corner represents a primary or secondary color:</p>
				${new ImageDisplay("img/color-cube-transparent.png")}
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Discoveries</h2>
				<p>
					There are a huge number of things I've learned from this tool. I'll try to highlight a few of the more interesting discoveries I've made below. (Example images from <a href="https://www.pexels.com/">Pexels</a>)
				</p>
				<h3>Fire</h3>
				<p>
					Anyone who has tried to capture fire's appearance will quickly realise that its palette is not as simple as it first appears. It passes from red to orange to yellow to white and its exact path is difficult to understand. However if you look at it in color space it becomes quite obvious what is going on.
				</p>
				${new ImageDisplay("img/pexels-pixabay-36851-low.jpg")}
				${new ImageDisplay("img/fire-path.png")}
				<p>
					You can see that in RGB space it is practically a straight line. The path starts at black, moves towards orange until the red component is maxed out (it hits the wall of the cube), then it continues on towards yellow until the green component is maxed out (it hits the wall of the cube), then continues until it reaches white and cannot become any brighter. Here it is from another angle.
				</p>
				${new ImageDisplay("img/fire-path-2.png")}
				<h3>Harmonious Colors</h3>
				<p>
					Why do some colors look nice together and others not? It's a difficult question to answer. Most artists and designers leave it up to their own intuition and experience. I was interested in seeing if I could spot any patterns so I started analyzing digital art and photos using this tool. I very quickly noticed that almost all the images with nice colors followed a similar pattern - their colors conformed to a plane. Take the following image for example:
				</p>
					${new ImageDisplay("img/pexels-pixabay-301417-low.jpg")}
				<p>
					There is a huge amount of variety in the colors here: yellow, pink, purple, orange, blue and grey. And yet these colors all look very nice together though there doesn't seem to be any particular reason why. However when we look at it in color space it is clear to see what is going on.
				</p>
				${new ImageDisplay("img/sun-path.png")}
				${new ImageDisplay("img/sun-path-2.png")}
				<p>
					You can see the colors in this image are almost completely flat with each other in color space, forming a near perfect plane. This pattern is repeated in almost all images with harmonious colors. There are of course exceptions to this rule but it holds true in the vast majority of cases.
				</p>
				
				<h3>Bubbles</h3>
				<p>
					Bubbles have a strange rainbow sheen which divides light into its different wavelengths similar to prism. This effect looks even more interesting in color space. 
				</p>
				${new ImageDisplay("img/pexels-pixabay-35016-low.jpg")}
				${new ImageDisplay("img/bubble-path.png")}

				<h3>And Much More</h3>
				<p>
					This isn't even scratching the surface of everything I've learned through this program. It's been a very colorful rabbit-hole. Seriously. Rayleigh scattering, paint mixing, gemstone refraction, galaxies, alternative color spaces. There is so so much to talk about. I'll cut myself off here though to prevent this from getting too long.
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p class="center">
					Here are a few additional results I'd like to highlight. 
				</p>
				<h3>Animation</h3>
				${new VideoDisplay("video/recording-1.mp4")}
				${new VideoDisplay("video/recording-2.mp4")}
				<h3>Parrot</h3>
				${new ImageDisplay("img/pexels-anthony-)-133396-low.jpg")}
				${new ImageDisplay("img/bird-path.png")}
				<h3>Jelly Fish</h3>
				${new ImageDisplay("img/pexels-guillaume-meurice-1894350-low.jpg")}
				${new ImageDisplay("img/jelly-path.png")}
				<h3>Butterfly</h3>
				${new ImageDisplay("img/pexels-leonardo-jarro-633437-low.jpg")}
				${new ImageDisplay("img/butterfly-path.png")}
				<h3>Clouds</h3>
				${new ImageDisplay("img/pexels-james-wheeler-1486974-low.jpg")}
				${new ImageDisplay("img/cloud-path.png")}
				<h3>Aurora</h3>
				${new ImageDisplay("img/pexels-visit-greenland-360912-low.jpg")}
				${new ImageDisplay("img/aurora-path.png")}
			`,"lg")}
			<p class="center">${new ButtonLink("back to top",()=>scrollToTop())}</p>
		`);
	}
}
defineElm(ProjectPage,scss`&{
	width: 100%;
	>.gap{
		height: 40px;
	}
	p.center{
		${theme.centerText}
	}
	.bold{
		font-weight: 700;
	}
	.projectLink{
		a{
			padding: 5px 10px;
			background-color: ${theme.color.greyStep(-2)};
			border-radius: 50px;
		}
	}
}`);

let title=bind("3D Color Spaces");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});