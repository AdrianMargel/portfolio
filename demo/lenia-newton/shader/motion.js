class MotionCapacityShader extends FragShader{
	constructor(leniaTexPP,gradientTexPP,motionTexPP){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;

				uniform sampler2D leniaTex;
				uniform vec2 leniaSize;
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}

				float smallerDivide(float a,float b){
					return (a<b)?a/b:1.;
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*leniaSize);
					
					float weight=texelFetch(leniaTex,coord2,0).r;
					float weightTotal;
					int kSize=10;
					for(int x=-kSize;x<=kSize;x++){
						for(int y=-kSize;y<=kSize;y++){
							ivec2 offset=ivec2(x,y);
							float l=length(vec2(offset));
							if(l<=float(kSize)&&offset!=ivec2(0,0)){
								ivec2 coordOff=coord2+offset;
								weightTotal+=texelFetch(leniaTex,coordOff,0).r;
							}
						}
					}
					float effect=smallerDivide(weightTotal,weight);
					float outflow=smallerDivide(weight,weightTotal);

					outColor=vec4(effect,outflow,weightTotal,0.);
				}
			`,
		);
		this.leniaTexPP=leniaTexPP;
		this.motionTexPP=motionTexPP;
	}
	run(){
		this.uniforms={
			leniaTex:this.leniaTexPP.tex,
			leniaSize:this.leniaTexPP.size,
		};
		this.attachments=[
			{
				attachment:this.motionTexPP.tex,
				...sizeObj(this.motionTexPP.size)
			}
		];
		super.run();
	}
}

class MotionShader extends FragShader{
	constructor(leniaTexPP,gradientTexPP,motionTexPP){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;

				uniform sampler2D leniaTex;
				uniform sampler2D gradientTex;
				uniform sampler2D motionTex;
				uniform vec2 leniaSize;
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*leniaSize);
					//local effect
					float effect=texelFetch(motionTex,coord2,0).x;
					vec2 gradient=texelFetch(gradientTex,coord2,0).xy;
					gradient*=effect;
					
					//shared effect
					int kSize=10;
					for(int x=-kSize;x<=kSize;x++){
						for(int y=-kSize;y<=kSize;y++){
							ivec2 offset=ivec2(x,y);
							float l=length(vec2(offset));
							if(l<=float(kSize)&&offset!=ivec2(0,0)){
								ivec2 coordOff=coord2+offset;
								vec4 t=texelFetch(motionTex,coordOff,0);
								float tOutflow=t.y;
								float tTotal=t.z;
								float tVal=texelFetch(leniaTex,coordOff,0).x;
								vec2 tGrad=texelFetch(gradientTex,coordOff,0).xy;

								gradient-=tGrad*tOutflow;
							}
						}
					}

					outColor=vec4(gradient,0.,0.);
				}
			`,
		);
		this.leniaTexPP=leniaTexPP;
		this.gradientTexPP=gradientTexPP;
		this.motionTexPP=motionTexPP;
	}
	run(){
		this.uniforms={
			leniaTex:this.leniaTexPP.tex,
			gradientTex:this.gradientTexPP.tex,
			motionTex:this.motionTexPP.tex,
			leniaSize:this.leniaTexPP.size,
		};
		this.attachments=[
			{
				attachment:this.gradientTexPP.flip().tex,
				...sizeObj(this.gradientTexPP.size)
			}
		];
		super.run();
	}
}