class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/voxel-lighting">Github</a></p>
				<p class="center bold projectLink"><a href="demo" rel="nofollow">Demo</a></p>
				
				${new ImageDisplay("img/voxel-tunnel-side.png")}
				<p>
					This ray tracer runs in realtime on the browser. It can handle both dynamic light sources and dynamic scenes. It is common for ray tracers to support direct lighting, often even with support for multiple direct light sources. However, this project takes rendering to the next level by also calculating the indirect ambient lighting in real time.
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Purpose</h2>
				<p>
					Ambient lighting is something we generally don't think about in day to day life. It refers to the way light bounces around after hitting a surface to illuminate other nearby objects. It is so ubiquitous that we usually only notice it when it is absent. In the context of computer graphics this turns out to present a difficult problem as calculating ambient light is incredibly computationally expensive. Any point on any object can potentially reflect light onto the surface of any other object which creates an N-to-N operation for every object in the scene. To illustrate the importance of ambient lighting see the below image comparing with and without ambient lighting.  
				</p>
				${new ImageDisplay("img/ambient-on-off.png")}
				<p>
					Most conventional methods used for realtime rendering avoid solving this problem either by using pre-calculated "baked-in" lighting or by approximating the solution with ambient occlusion. Methods such as radiosity allow realtime ambient lighting but only work on static scenes (though radiosity does allow dynamic lighting). This project was my exploration of this problem to come up with a realtime fully dynamic solution to the problem.
				</p>
				<p>
					Additionally this entire project was written in JavaScript and WebGL which gives it the ability to run inside the browser on any website. (<a href="demo" rel="nofollow">See live demo</a>)
				</p>
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Explanation</h2>
				<p>
					To solve this problem I decided to come at it from a unique perspective - voxels. Most computer graphics use triangle mesh to describe complex scenes. Triangle mesh has many great advantages, however it does not lend itself well to ray tracing. In fact many approaches to ray trace triangle meshes involve wrapping the mesh in a Sparse Voxel Octree (SVO) to accelerate performance. I decided for this project to limit the entire scene to voxels, both for simplicity and performance. It is worth noting that this does not exclude use of triangle mesh, it is merely beyond the scope of this project.
				</p>
				<h3>Core</h3>
				<p>
					The core of this project is a ray tracing engine optimized for SVOs. The algorithm itself to ray trace a SVO is pretty straight-forward, its implementation however is not. WebGL is intended for rendering triangle meshes with textures and shaders. In order to use it for arbitrary ray tracing requires very creative use of its features.
				</p>
				<p>
					Typically to render a scene you describe it with a triangle mesh and then render all the triangles through WebGL. However, we are going to do something very different. We instead are going to use two triangles to create a box around the screen and do all of our calculations within the fragment shader. That is to say we will ray trace each pixel on the screen rather than rendering individual polygons. A great introduction on how this is done can be found <a href="https://iquilezles.org/articles/nvscene2008/">here</a>.
				</p>
				<p>
					The next problem we run into is random memory access. WebGL is meant for graphics, not general computing. As a result WebGL doesn't allow you to pass in arrays of data to the GPU in a way that can be arbitrary read. To get around this we create <a href="https://webgl2fundamentals.org/webgl/lessons/webgl-data-textures.html">data textures</a> to hold any data we want access to. The data textures must also be resized and updated by the program as the data they represent changes. By encoding our data into data textures on the CPU we can then cleverly convert array indexes into pixel positions to retrieve the data on the GPU. We can likewise use a data texture as an output to a fragment shader to create multi-step GPU pipelines.
				</p>
				<p>
					For our purposes we need access to an SVO describing the scene and any associated voxel data, such as color and lighting. Although it is possible to have this all in a single data texture it works out cleaner to use separate data textures for storing the SVO and the voxel data. The easiest way to achieve this is to use the SVO to store an index at each leaf node which points to the position in the other data texture(s) where that voxel is stored. This allows structural (SVO) data to be stored separately in a UInt format without adding type restrictions to the voxel data. Additionally it allows for per-voxel operations to be done by running a fragment shader over the voxel data texture (this will come in handy later).
				</p>
				<h3>Sparse Voxel Octrees</h3>
				<p>
					It is worth taking a second to talk about Sparse Voxel Octrees (SVO). In order to store an SVO to a data texture the typical approach is to compress it to an array where each chunk of 8 items points to the index of the next child/chunk in the array. This allows the tree to be easily traversed either recursively or iteratively. Here we use a UInt format which does not allow null or -1 values to denote dead ends in the tree, instead we use one-based indexing so that 0 can be used as the dead end value. Who knew there would ever be a sensible use case for one-based indexing!
				</p>
				<p>
					One major drawback of SVOs is that there does not exist an effective way to update them using the GPU. This is a consequence of its hierarchical nature which does not lend itself nicely to parallelization. This is not a problem for most applications, but in our case we are using voxels as our primary scene description. And due to the density of volumetric information this makes updating scenes on the CPU relatively slow. I believe that this could be solved by using relative indexes in the SVO rather than absolute indexes. This way when updating a branch of the octree only the parent branches would need to be reindexed (instead of needing to reindex the entire tree past the updated index). This is not something I implemented in this demo, however I'm mentioning it here because I think it's really cool and I haven't seen anyone else discover this optimization.
				</p>
				<h3>View</h3>
				<p>
					Now that we have our basic setup out of the way we can create a fragment shader in GLSL to render our scene. This involves setting up a simple SVO-optimized ray tracer along with a bit of basic math to define our perspective and view-cone.
				</p>
				<h3>Direct Lighting</h3>
				<p>
					We now make use of the ray tracer to calculate direct lighting. This is done simply by casting a single ray from the voxel face in question to the light source and checking if it hits anything along the way. If it does we cast a shadow, otherwise the light from the light source is added (remember to handle distance, and surface normals). This direct lighting is stored to an independent data texture.
				</p>
				<h3>Ambient Lighting</h3>
				<p>
					This is where things get fun. Since the voxel data is defined using a separate data texture we can now create an output data texture of the same size and run a fragment shader that will perform an operation for each voxel. We take advantage of this and have each voxel cast a ray in a random direction each frame. The result from this is added to the ambient light of the voxel. By running this repeatedly over every voxel we can calculate realtime ambient lighting for the scene!
				</p>
				<p>
					It may seem unimportant but in order for ambient lighting to look correct it is important to capture not just secondary bounces of the light but also third, forth, fifth and beyond. To do this the ambient light sampling rays need to also render the current ambient lighting. This requires use of a ping-pong texture since WebGL does not allow a fragment shader to sample from its own output texture (for obvious reasons).
				</p>
				<p>
					Now at this point you might think that's it. Unfortunately no. It almost works but at this point there is still a large amount of noise in the render. There are two obvious solutions to this: cast more rays per voxel, or aggregate the lighting over a larger period of time. The first solution sacrifices the realtime viability of the system. The second solution sacrifices the realtime response to dynamic scene and lighting changes. Instead I opted for a third solution that takes advantage of the properties of voxels - I share the ambient lighting of each voxel face with the lighting of its neighbors. 
				</p>
				<h3>Ambient Light Sharing</h3>
				<p>
					To prevent noise without decreasing performance or speed, ambient light is shared between neighboring voxel faces. This is achieved by using a weighted blur algorithm which weights each neighboring face according to the dot product of the two faces' surface normals. Furthermore by taking advantage of the ping-pong texture used to store the ambient lighting, each voxel face can exclude itself from the blur calculation leading to incredibly fast light propagation. The only downside of this being a faint dithering artifact.
				<p>
				<p>
					To minimize this dithering artifact, the two ping-pong textures holding ambient lighting can be sampled and the minimum value between them selected for each voxel face. This works incredibly well in our case, since we are excluding each voxel face from sampling itself. 
				<p>
				<p class="center">No light sharing (heavy noise):</p>
				${new ImageDisplay("img/voxel-tunnel-none.png")}
				<p class="center">Light sharing (smooth but slow):</p>
				${new ImageDisplay("img/voxel-tunnel-smooth.png")}
				<p class="center">Light sharing with self-exclusion (dithered but fast):</p>
				${new ImageDisplay("img/voxel-tunnel-dither.png")}
				<h3>Surface Normals</h3>
				<p>
					As has been stated up to this point the entire system uses voxels to calculate the ambient lighting. But by using custom surface normals for each voxel face and the ambient light sharing described above, it is actually possible to approximate ambient lighting for any shape. To show this, here is an example of a voxel sphere with and without surface normals.
				<p>
				${new ImageDisplay("img/normal-compare.png")}
				<p>
					The only problem here is the blocky hard shadows from the direct lighting. Luckily, it is possible to disable direct hard lighting resulting in only smooth shading, as seen below.
				</p>
				${new ImageDisplay("img/soft-compare.png")}

			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Results</h2>
				<p>
					Below are a few more rendered examples from the program, note that some of these images came from earlier stages of development.
				</p>
				${new ImageDisplay("img/voxel-tunnel-sunlight-3.png")}
				${new ImageDisplay("img/voxel-light11.png")}
				${new ImageDisplay("img/voxel-light10.png")}
				${new ImageDisplay("img/voxel-light15.png")}
				${new ImageDisplay("img/voxel-light6.png")}
				${new ImageDisplay("img/voxel-bowl4.png")}
				${new ImageDisplay("img/voxel-bowl5.png")}
				${new ImageDisplay("img/voxel-tunnel-sunlight.png")}
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

let title=bind("Voxel Lighting");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});