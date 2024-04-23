class GradientShader extends FragShader{
	constructor(leniaTexPP){
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

					//slow density
					sobel=sobel*clamp(2.-val.x,0.,1.);
					//limit speed
					float sLeng=length(sobel);
					if(sLeng>1.){
						sobel/=sLeng;
					}
	
					outColor=vec4(val.x,val.y,sobel.x,sobel.y);
				}
			`,
		);
		this.leniaTexPP=leniaTexPP;
	}
	run(){
		this.uniforms={
			leniaTex:this.leniaTexPP.tex,
			leniaSize:this.leniaTexPP.size,
		};
		this.attachments=[
			{
				attachment:this.leniaTexPP.flip().tex,
				...sizeObj(this.leniaTexPP.size)
			}
		];
		super.run();
	}
}