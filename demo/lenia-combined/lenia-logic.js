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
		
		this.geneMaxLength=100000;
		this.geneGroupLength=3+1;//leave the first pixel open as a meta pixel for list control
		this.geneTexPP=new TexturePingPong({
			...sizeObj(boxSize(this.geneMaxLength*this.geneGroupLength,{},this.geneGroupLength)),
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
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
			// new LeniaMaterial(),
			// new LeniaMaterial(),
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

		this.dnaTexPP=new TexturePingPong({
			width: 1,
			height: 1,
			minMag: gl.NEAREST,
			wrap: gl.REPEAT,
			internalFormat: gl.RGBA32F,
		});

		this.geneInitShader=new GeneInitShader();
		this.dnaInitShader=new DnaInitShader();
		this.noiseShader=new NoiseShader();
		this.leniaShader1=new LeniaShader();
		this.gradientShader=new GradientShader();
		this.motionCapacityShader=new MotionCapacityShader(2);
		this.motionShader=new MotionShader(2);
		this.viscosityShader=new ViscosityShader(2);
		this.veloShader=new VeloShader();
		this.flowShader=new FlowShader();
		this.renderShader=new RenderShader();
		
		this.balanceMotion=false;

		this.materials.forEach((m,i,arr)=>{
			this.geneInitShader.run(m.geneTexPP,m.geneGroupLength);
			// console.log("gene",m.geneTexPP.read(4,gl.RGBA,gl.FLOAT,Float32Array));
		});
	}
	run(drawTex){
		let resized=shaderManager.resizeToDisplay(
			this.gradientTexPP,
			this.motionTexPP,
			this.dnaTexPP,
			...this.materials.flatMap(x=>[...x])
		);
		if(resized){
			this.materials.forEach((m,i,arr)=>{
				this.noiseShader.run(m.leniaTexPP);
			});
			this.dnaInitShader.run(this.dnaTexPP,this.materials[0].geneMaxLength);
			// console.log("dna",this.materials[0].read(4,gl.RGBA,gl.FLOAT,Float32Array));
		}

		this.materials.forEach((m,i,arr)=>{
			let nextM=this.materials[(i+1)%this.materials.length];
			this.leniaShader1.run(
				m.geneGroupLength,
				m.geneTexPP,
				this.dnaTexPP,
				m.leniaTexPP,
				nextM.affinityTexPP,
			);
			this.gradientShader.run(m.affinityTexPP,this.gradientTexPP);
			//These lines make it so that for every action there must be an equal and opposite reaction
			if(this.balanceMotion){
				this.motionCapacityShader.run(m.leniaTexPP,this.motionTexPP);
				this.motionShader.run(this.gradientTexPP,this.motionTexPP);
			}
			this.viscosityShader.run(m.leniaTexPP,m.veloTexPP);
			this.veloShader.run(this.gradientTexPP,m.veloTexPP);
		});
		this.materials.forEach((m,i,arr)=>{
			this.flowShader.run(i==0,m.leniaTexPP,m.veloTexPP,this.dnaTexPP,drawTex);
		});
		// this.renderShader.run(this.materials[0].leniaTexPP,this.dnaTexPP,this.gradientTexPP,this.materials[1].leniaTexPP);
		this.renderShader.run(this.materials[0].leniaTexPP,this.dnaTexPP,this.gradientTexPP,this.materials[0].leniaTexPP);
		// this.renderShader.run(this.materials[0].leniaTexPP,this.materials[0].affinityTexPP);
	}
}