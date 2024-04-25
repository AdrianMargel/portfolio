let SHADER_FUNCS={
	DATA_TEX:glsl`
		ivec2 getIdxCoord(int idx,vec2 size){
			int width=int(size.x);
		
			int y=idx/width;
			int x=idx-(y*width);

			if(y<0||y>=int(size.y)){
				return ivec2(-1);
			}
			return ivec2(x,y);
		}
		vec2 getIdxPos(int idx,vec2 size){
			ivec2 coord=getIdxCoord(idx,size);
			if(coord.x==-1){
				return vec2(-1.);
			}
			//sample from center of the pixel
			return (vec2(coord)+.5)/size;
		}
	`,
	HASH:glsl`
		//1 out, 1 in...
		float hash11(float p){
			p = fract(p * .1031);
			p *= p + 33.33;
			p *= p + p;
			return fract(p);
		}
	`,
};

class Sorter{
	constructor(array,maxItems=array.length){
		this.inputTex=new Texture({
			...sizeObj(boxSize(array.length)),
			internalFormat: gl.R32I,
			minMag: gl.NEAREST,
			src:boxArray(array),
		});
		this.outputTex=new Texture({
			...sizeObj(boxSize(maxItems)),
			internalFormat: gl.R32I,
			minMag: gl.NEAREST,
		});

		this.countTexPP=new TexturePingPong({
			...sizeObj(boxSize(maxItems)),
			internalFormat: gl.R32F,
			minMag: gl.NEAREST
		});
		this.splitTexPP=new TexturePingPong({
			...sizeObj(boxSize(maxItems)),
			internalFormat: gl.RG32I,
			minMag: gl.NEAREST,
		});
		this.splitDepthTex=new Texture({
			...sizeObj(boxSize(maxItems)),
			internalFormat: gl.DEPTH_COMPONENT32F,
			format: gl.DEPTH_COMPONENT,
			type: gl.FLOAT,
			minMag: gl.NEAREST,
		});
		this.doneTex=new Texture({
			width: 1,
			height: 1,
			internalFormat: gl.R32I,
			minMag: gl.NEAREST,
		});
		
		this.arrayBuffPP=new BufferPingPong({
			numComponents: 3,
			type: gl.INT,
			data: array.length*3
		});

		this.sortInputShader=new SortInputShader(this.arrayBuffPP,this.inputTex);
		this.sortOutputShader=new SortOutputShader(this.arrayBuffPP,this.outputTex);
		this.sortShader=new SortShader(this.arrayBuffPP,this.countTexPP,this.splitTexPP);
		this.sortSplitShader=new SortSplitShader(this.arrayBuffPP,this.splitTexPP,this.splitDepthTex);
		this.sortDoneShader=new SortDoneShader(this.arrayBuffPP,this.doneTex);
	}
	run(){
		this.sortInputShader.run();
		// console.log("input",this.inputTex.read(1,gl.RED_INTEGER,gl.INT,Int32Array));
		// console.log("buff",this.arrayBuffPP.read(Int32Array));

		let done;
		let max=1000;
		let i=0;
		this.sortSplitShader.run();
		// console.log("split",this.splitTexPP.read(2,gl.RG_INTEGER,gl.INT,Int32Array));
		do{
			// console.log("buff in",this.arrayBuffPP.read(Int32Array));
			this.sortShader.run();
			this.sortSplitShader.run();
			this.sortDoneShader.run();
			done=this.doneTex.read(1,gl.RED_INTEGER,gl.INT,Int32Array)[0];
			// console.log("buff out",this.arrayBuffPP.read(Int32Array));
			// console.log("split",this.splitTexPP.read(2,gl.RG_INTEGER,gl.INT,Int32Array));
			// console.log("count",this.countTexPP.read(1,gl.RED,gl.FLOAT,Float32Array));
			console.log("#"+i+" - done: "+(done==0));
			i++;
		}while(done>0&&i<max);

		this.sortOutputShader.run();
		return this.outputTex.read(1,gl.RED_INTEGER,gl.INT,Int32Array);
	}
}
class SortInputShader extends Shader{
	constructor(arrayBuffPP,inputTex){
		super(
			glsl`#version 300 es
				precision highp float;
				precision highp isampler2D;

				uniform vec2 arrSize;
				uniform isampler2D inputTex;
				in ivec3 dataIn;
				flat out ivec3 dataOut;
				
				${SHADER_FUNCS.DATA_TEX}

				void main(){
					gl_PointSize=1.;

					ivec2 idxCoord=getIdxCoord(gl_VertexID,arrSize);
					int val=texelFetch(inputTex,idxCoord,0).r;

					dataOut=ivec3(0,val,0);
					gl_Position=vec4(-2.);
				}
			`,
			glsl`#version 300 es
				precision highp float;

				out vec4 outColor;

				void main(){
					outColor=vec4(0.);
				}
			`,
			["dataOut"]
		);
		this.drawType=gl.POINTS;

		this.arrayBuffPP=arrayBuffPP;
		this.inputTex=inputTex;
	}
	run(){
		this.uniforms={
			arrSize:this.inputTex.size,
			inputTex:this.inputTex.tex,
		};
		this.attributes={
			dataIn:this.arrayBuffPP.buff,
		};
		this.transformFeedbackVaryings={
			dataOut:this.arrayBuffPP.flip().buff,
		};

		super.run();
	}
}
class SortOutputShader extends Shader{
	constructor(arrayBuffPP,outputTex){
		super(
			glsl`#version 300 es
				precision highp float;

				uniform vec2 arrSize;
				in ivec3 dataIn;
				flat out ivec4 col;
				
				${SHADER_FUNCS.DATA_TEX}

				void main(){
					gl_PointSize=1.;

					gl_Position=vec4(getIdxPos(dataIn.r,arrSize)*2.-1.,1.,1.);
					col=ivec4(dataIn.g);
				}
			`,
			glsl`#version 300 es
				precision highp float;

				flat in ivec4 col;
				out ivec4 outColor;

				void main(){
					outColor=col;
				}
			`
		);
		this.drawType=gl.POINTS;

		this.arrayBuffPP=arrayBuffPP;
		this.outputTex=outputTex;
	}
	run(){
		this.uniforms={
			arrSize:this.outputTex.size,
		};
		this.attachments=[
			{
				attachment:this.outputTex.tex,
				...sizeObj(this.outputTex.size)
			}
		];
		this.attributes={
			dataIn:this.arrayBuffPP.buff,
		};

		super.run();
	}
}

class SortShader extends Shader{
	constructor(arrayBuffPP,countTexPP,splitTexPP){
		super(
			glsl`#version 300 es
				precision highp float;
				precision highp isampler2D;
				precision highp sampler2D;

				uniform sampler2D countTex;
				uniform isampler2D splitTex;
				uniform vec2 arrSize;
				in ivec3 dataIn;
				flat out ivec3 dataOut;
				
				${SHADER_FUNCS.DATA_TEX}

				void main(){
					gl_PointSize=1.;

					//filter
					if(dataIn.b==-1){
						dataOut=dataIn;
						gl_Position=vec4(-2.);
						return;
					}
					int idx=dataIn.r;
					int val=dataIn.g;
					bool isRight=bool(dataIn.b);
					ivec2 idxCoord=getIdxCoord(idx,arrSize);
					//offset
					if(isRight){
						ivec2 idxPrevCoord=getIdxCoord(idx-1,arrSize);
						float count=texelFetch(countTex,idxPrevCoord,0).r;
						idx+=int(count)-1;
					}
					//split
					ivec2 splitVal=texelFetch(splitTex,idxCoord,0).rg;
					isRight=val>splitVal.r
						||(val==splitVal.r&&gl_VertexID>splitVal.g);
					if(isRight){
						idx++;
					}
					//end
					bool ended=texelFetch(countTex,idxCoord,0).r==1.;
					if(ended){
						dataOut=ivec3(idx,val,-1);
						gl_Position=vec4(-2.);
						return;
					}
					//write
					dataOut=ivec3(idx,val,isRight);
					gl_Position=vec4(getIdxPos(idx,arrSize)*2.-1.,1.,1.);
				}
			`,
			glsl`#version 300 es
				precision highp float;

				out vec4 outColor;

				void main(){
					outColor=vec4(1);
				}
			`,
			["dataOut"]
		);
		this.drawType=gl.POINTS;

		this.arrayBuffPP=arrayBuffPP;
		this.countTexPP=countTexPP;
		this.splitTexPP=splitTexPP;
	}
	run(){
		this.countTexPP.get(false).clear();

		this.uniforms={
			countTex:this.countTexPP.tex,
			splitTex:this.splitTexPP.tex,
			arrSize:this.splitTexPP.size,
		};
		this.attachments=[
			{
				attachment:this.countTexPP.flip().tex,
				...sizeObj(this.countTexPP.size)
			}
		];
		this.attributes={
			dataIn:this.arrayBuffPP.buff,
		};
		this.transformFeedbackVaryings={
			dataOut:this.arrayBuffPP.flip().buff,
		};
		/*
			IMPORTANT NOTE
			Blending only works for floats. Therefor we can't use int textures for the count.
			Quote from the OpenGL spec:
			"Blending applies only if the color buffer has a fixed-point format. If the color buffer has an integer format, proceed to the next operation."
		*/
		gl.enable(gl.BLEND);
		gl.blendEquation(gl.FUNC_ADD);
		gl.blendFunc(gl.ONE,gl.ONE);
		super.run();
		gl.disable(gl.BLEND);
	}
}
class SortSplitShader extends Shader{
	constructor(arrayBuffPP,splitTexPP,splitDepthTex){
		super(
			glsl`#version 300 es
				precision highp float;

				uniform vec2 arrSize;
				uniform float rand;
				in ivec3 dataIn;
				flat out ivec2 val;
				
				${SHADER_FUNCS.DATA_TEX}
				${SHADER_FUNCS.HASH}

				void main(){
					gl_PointSize=1.;

					//filter
					if(dataIn.b==-1){
						gl_Position=vec4(-2.);
						return;
					}
					int idx=dataIn.r;
					//write
					val=ivec2(dataIn.g,gl_VertexID);
					gl_Position=vec4(
						getIdxPos(idx,arrSize)*2.-1.,
						hash11(float(gl_VertexID)+rand),
						1.
					);
				}
			`,
			glsl`#version 300 es
				precision highp float;

				flat in ivec2 val;
				out ivec4 outColor;

				void main(){
					outColor=ivec4(val,0,0);
				}
			`
		);
		this.drawType=gl.POINTS;

		this.arrayBuffPP=arrayBuffPP;
		this.splitTexPP=splitTexPP;
		this.splitDepthTex=splitDepthTex;
	}
	run(){
		this.splitDepthTex.clear();

		this.uniforms={
			arrSize:this.splitTexPP.size,
			rand:rand()
		};
		this.attachments=[
			{
				attachment:this.splitTexPP.tex,
				...sizeObj(this.splitTexPP.size)
			},
			{
				// format: gl.DEPTH_COMPONENT,
				attachmentPoint: gl.DEPTH_ATTACHMENT,
				attachment:this.splitDepthTex.tex,
				...sizeObj(this.splitDepthTex.size)
			}
		];
		this.attributes={
			dataIn:this.arrayBuffPP.buff,
		};

		gl.enable(gl.DEPTH_TEST);
		/*
			IMPORTANT NOTE
			Chrome and Firefox implement depth function differently
		*/
		if(navigator.userAgent.match(/firefox|fxios/i)?.[0]!=null){
			gl.depthFunc(gl.LESS);
		}else{
			gl.depthFunc(gl.GREATER);
		}
		super.run();
		gl.disable(gl.DEPTH_TEST);
	}
}
class SortDoneShader extends Shader{
	constructor(arrayBuffPP,doneTex){
		super(
			glsl`#version 300 es
				precision highp float;

				in ivec3 dataIn;
				
				${SHADER_FUNCS.DATA_TEX}

				void main(){
					gl_PointSize=1.;
					//filter
					if(dataIn.b==-1){
						gl_Position=vec4(-2.);
						return;
					}
					//write
					gl_Position=vec4(0.,0.,0.,1.);
				}
			`,
			glsl`#version 300 es
				precision highp float;

				out ivec4 outColor;

				void main(){
					outColor=ivec4(1);
				}
			`
		);
		this.drawType=gl.POINTS;

		this.arrayBuffPP=arrayBuffPP;
		this.doneTex=doneTex;
	}
	run(){
		this.doneTex.clear();

		this.attachments=[
			{
				attachment:this.doneTex.tex,
				...sizeObj(this.doneTex.size)
			}
		];
		this.attributes={
			dataIn:this.arrayBuffPP.buff,
		};

		super.run();
	}
}