class FlowShader extends FragShader{
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

				void main(){
					vec2 pos2=pos*vec2(.5,.5)+.5;
					ivec2 coord2=ivec2(pos2*leniaSize);
					
					vec4 val=texelFetch(leniaTex,coord2,0);

					float total=0.;
					float bestD=0.;
					vec2 bestPos=vec2(0.,0.);
					for(int x=-2;x<=2;x++){
						for(int y=-2;y<=2;y++){
							vec4 data=texelFetch(leniaTex,coord2+ivec2(x,y),0);
							float density=clamp(data.x-1.,0.,1.);
							float diffuse=mix(1.5,3.,density);
							float diffuseOff=(diffuse-1.)/2.;
							vec2 velo=data.zw;
							vec2 offset=velo+vec2(x,y);
							vec2 boundMin=clamp(offset-diffuseOff,0.,1.);
							vec2 boundMax=clamp(offset+1.+diffuseOff,0.,1.);
							vec2 bound=boundMax-boundMin;
							float overlap=bound.x*bound.y;
							float add=data.x*overlap/(diffuse*diffuse);
							total+=add;
						}
					}
					// vec4 drawData=texture(canvas,pos2);//TODO
					// float drawn=max((drawData.r*2.-1.)*drawData.w,-total);

					outColor=vec4(total,val.y,val.z,val.w);
					// outColor=vec4(total+drawn,val.y,val.z,val.w);
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