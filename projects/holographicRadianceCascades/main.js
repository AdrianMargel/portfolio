class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/radiance-cascades">Github</a></p>
				<p class="center bold projectLink"><a href="/demo/nested-radiance-cascades-fast/" rel="nofollow">Demo (fast)</a></p>
				<p class="center bold projectLink"><a href="/demo/nested-radiance-cascades-accurate/" rel="nofollow">Demo (accurate)</a></p>
				${new ImageDisplay("img/radiance-cascade-nested-19.png")}
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

let title=bind("Holographic Radiance Cascades");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});