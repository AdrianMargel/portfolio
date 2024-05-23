class LeniaMaterial{
	constructor(){
		this.leniaTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});
		this.affinityTexPP=new TexturePingPong({
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
	}
	*[Symbol.iterator]() {
		yield this.leniaTexPP;
		yield this.affinityTexPP;
		yield this.veloTexPP;
	}
}
class Lenia{
	constructor(){
		this.materials=[
			new LeniaMaterial(),
			new LeniaMaterial(),
		];
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

		this.noiseShader=new NoiseShader();
		this.leniaShader1=new LeniaShader();
		this.leniaShader2=new LeniaShader();
		this.gradientShader=new GradientShader();
		this.motionCapacityShader=new MotionCapacityShader(2);
		this.motionShader=new MotionShader(2);
		this.viscosityShader=new ViscosityShader(2);
		this.veloShader=new VeloShader();
		this.flowShader=new FlowShader();
		this.renderShader=new RenderShader();
		
		this.balanceMotion=true;
	}
	run(){
		let resized=shaderManager.resizeToDisplay(
			this.gradientTexPP,
			this.motionTexPP,
			...this.materials.flatMap(x=>[...x])
		);
		if(resized){
			this.noiseShader.run(this.materials[0].leniaTexPP);
			this.noiseShader.run(this.materials[1].leniaTexPP,false);
		}

		this.leniaShader1.run(
			this.materials[0].leniaTexPP,
			this.materials[1].leniaTexPP,
			this.materials[1].affinityTexPP,
		);
		this.leniaShader2.run(
			this.materials[1].leniaTexPP,
			this.materials[0].leniaTexPP,
			this.materials[0].affinityTexPP,
		);
		this.materials.forEach((m,i,arr)=>{
			this.gradientShader.run(m.affinityTexPP,this.gradientTexPP);
			//These lines make it so that for every action there must be an equal and opposite reaction
			if(this.balanceMotion){
				this.motionCapacityShader.run(m.leniaTexPP,this.motionTexPP);
				this.motionShader.run(this.gradientTexPP,this.motionTexPP);
			}
			this.viscosityShader.run(m.leniaTexPP,m.veloTexPP);
			this.veloShader.run(this.gradientTexPP,m.veloTexPP);
		});
		this.materials.forEach(m=>{
			this.flowShader.run(m.leniaTexPP,m.veloTexPP);
		});
		this.renderShader.run(this.materials[0].leniaTexPP,this.materials[1].leniaTexPP);
	}
}