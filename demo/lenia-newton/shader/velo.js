class VeloShader extends FragShader{
	constructor(gradientTexPP,veloTexPP){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D gradientTex;
				uniform sampler2D veloTex;
				uniform vec2 leniaSize;
				in vec2 pos;
				out vec4 outColor;

				void main(){
					vec2 pos2=pos*vec2(.5,.5)+.5;
					ivec2 coord2=ivec2(pos2*leniaSize);
					vec2 v=texelFetch(veloTex,coord2,0).xy
						+texelFetch(gradientTex,coord2,0).xy
						*.1;
					v/=max(length(v),1.);
					// v*=0.99;
					outColor=vec4(v,0.,0.);
					// outColor=vec4(0.,0.,0.,0.);
				}
			`,
		);
		this.gradientTexPP=gradientTexPP;
		this.veloTexPP=veloTexPP;
	}
	run(){
		this.uniforms={
			gradientTex:this.gradientTexPP.tex,
			veloTex:this.veloTexPP.tex,
			leniaSize:this.veloTexPP.size,
		};
		this.attachments=[
			{
				attachment:this.veloTexPP.flip().tex,
				...sizeObj(this.veloTexPP.size)
			}
		];
		super.run();
	}
}