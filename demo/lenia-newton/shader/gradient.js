class GradientShader extends FragShader{
	constructor(leniaTexPP,gradientTexPP){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;

				uniform sampler2D leniaTex;
				uniform sampler2D gradientTex;
				uniform vec2 leniaSize;
				in vec2 pos;
				out vec4 outColor;

				${SHADER_FUNCS.HASH}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord2=ivec2(pos2*leniaSize);
					
					vec4 val=texelFetch(leniaTex,coord2,0);
					vec4 pxy=texelFetch(leniaTex,coord2+ivec2(1,0),0);
					vec4 nxy=texelFetch(leniaTex,coord2+ivec2(-1,0),0);
					vec4 xpy=texelFetch(leniaTex,coord2+ivec2(0,1),0);
					vec4 xny=texelFetch(leniaTex,coord2+ivec2(0,-1),0);
					vec4 pxpy=texelFetch(leniaTex,coord2+ivec2(1,1),0);
					vec4 nxny=texelFetch(leniaTex,coord2+ivec2(-1,-1),0);
					vec4 pxny=texelFetch(leniaTex,coord2+ivec2(1,-1),0);
					vec4 nxpy=texelFetch(leniaTex,coord2+ivec2(-1,1),0);

					float sobelX=(nxny.y+nxy.y*2.+nxpy.y)-(pxny.y+pxy.y*2.+pxpy.y);
					float sobelY=(nxny.y+xny.y*2.+pxny.y)-(nxpy.y+xpy.y*2.+pxpy.y);
					vec2 sobel=vec2(sobelX,sobelY);

					outColor=vec4(sobel.x,sobel.y,0.,0.);
				}
			`,
		);
		this.leniaTexPP=leniaTexPP;
		this.gradientTexPP=gradientTexPP;
	}
	run(){
		this.uniforms={
			leniaTex:this.leniaTexPP.tex,
			gradientTex:this.gradientTexPP.tex,
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