class Lenia{
	constructor(){
		this.leniaTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.leniaShader=new LeniaShader(this.leniaTexPP);
		this.gradientShader=new GradientShader(this.leniaTexPP);
		this.flowShader=new FlowShader(this.leniaTexPP);
		this.renderShader=new RenderShader();
	}
	run(){
		shaderManager.resizeToDisplay(this.leniaTexPP);
		this.leniaShader.run();
		this.gradientShader.run();
		this.flowShader.run();
		this.renderShader.run(this.leniaTexPP);
	}
}