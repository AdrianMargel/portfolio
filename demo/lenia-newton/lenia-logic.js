class Lenia{
	constructor(){
		this.leniaTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.gradientTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.motionTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.veloTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RG32F,
		});
		this.leniaShader=new LeniaShader(this.leniaTexPP);
		this.gradientShader=new GradientShader(this.leniaTexPP,this.gradientTexPP);
		this.motionCapacityShader=new MotionCapacityShader(this.leniaTexPP,this.gradientTexPP,this.motionTexPP);
		this.motionShader=new MotionShader(this.leniaTexPP,this.gradientTexPP,this.motionTexPP);
		this.veloShader=new VeloShader(this.gradientTexPP,this.veloTexPP);
		this.flowShader=new FlowShader(this.leniaTexPP,this.veloTexPP);
		this.renderShader=new RenderShader();
		
		this.balanceMotion=true;
	}
	run(){
		shaderManager.resizeToDisplay(
			this.leniaTexPP,
			this.gradientTexPP,
			this.motionTexPP,
			this.veloTexPP,
		);
		this.leniaShader.run();
		this.gradientShader.run();

		//These lines make it so that for every action there must be an equal and opposite reaction
		if(this.balanceMotion){
			this.motionCapacityShader.run();
			this.motionShader.run();
		}

		this.veloShader.run();
		this.flowShader.run();
		this.renderShader.run(this.leniaTexPP);
	}
}