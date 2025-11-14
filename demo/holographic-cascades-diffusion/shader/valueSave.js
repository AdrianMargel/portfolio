class ValueSaveShader extends FragShader{
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
					
					float val=texelFetch(valueTex,coord,0).r;
					vec4 channel=texelFetch(channelTex,coord,0);

					outColor=val*color+channel;
				}
			`,
		);
	}
	run(channel,cascadeNumMax,channelCount,valueTex,channelTexPP){
		this.uniforms={
			cascadeNumMax,
			channelCount,
			color:[
				channel==0?1:0,
				channel==1?1:0,
				channel==2?1:0,
				0
			],
			valueTex:valueTex.tex,
			channelTex:channelTexPP.tex,
			size:channelTexPP.size,
		};
		this.attachments=[
			{
				attachment:channelTexPP.flip().tex,
				...sizeObj(channelTexPP.size)
			}
		];
		super.run();
	}
}