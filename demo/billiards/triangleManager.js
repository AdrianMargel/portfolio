class TriangleManager{
	constructor(){
		this.rayTraceShader=new RayTraceShader();
		this.renderShader=new RenderShader();

		this.boundarySize=Vec(512,512);
		// this.boundarySize=Vec(1024,1024);
		this.triangleTex=new Texture({
			width: this.boundarySize.x,
			height: this.boundarySize.y,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
	}
	run(shaderManager,path,mousePos,canvasTex){
		shaderManager.resizeToDisplay();

		this.rayTraceShader.run(path,mousePos,this.triangleTex);
		this.renderShader.run(this.triangleTex);
	}
}