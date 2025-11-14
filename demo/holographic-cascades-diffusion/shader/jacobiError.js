class JacobiErrorShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define PI ${PI}
				#define TAU ${TAU}
				precision highp float;
				precision highp int;
				precision highp sampler2D;

				uniform sampler2D valueTex;
				uniform sampler2D channelTex;
				uniform vec2 size;
				uniform vec4 color;
				uniform int cascadeNumMax;
				uniform int channelCount;
				in vec2 pos;
				
				out vec4 outColor;

				${SHADER_FUNCS.INT_MATH}
				${SHADER_FUNCS.DATA_TEX}
				${SHADER_FUNCS.CASCADE}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord=ivec2(pos2*size);
					
					float mid=texelFetch(valueTex,coord,0).r;
					float px=texelFetch(valueTex,coord+ivec2(1,0),0).r;
					float py=texelFetch(valueTex,coord+ivec2(0,1),0).r;
					float nx=texelFetch(valueTex,coord+ivec2(-1,0),0).r;
					float ny=texelFetch(valueTex,coord+ivec2(0,-1),0).r;

					float error=px+py+nx+ny-4.*mid;

					outColor=vec4(error*10.,0.,0.,1.);
				}
			`,
		);
	}
	run(valueTex,errorTex){
		this.uniforms={
			valueTex:valueTex.tex,
			size:valueTex.size,
		};
		this.attachments=[
			{
				attachment:errorTex.tex,
				...sizeObj(errorTex.size)
			}
		];
		super.run();
	}
}