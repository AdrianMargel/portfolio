class FlowShader extends FragShader{
	constructor(leniaTexPP,veloTexPP){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D leniaTex;
				uniform sampler2D veloTex;
				uniform vec2 leniaSize;
				in vec2 pos;
				
				layout(location = 0) out vec4 outColor0;
				layout(location = 1) out vec4 outColor1;

				void main(){
					vec2 pos2=pos*vec2(.5,.5)+.5;
					ivec2 coord2=ivec2(pos2*leniaSize);
					
					vec4 val=texelFetch(leniaTex,coord2,0);

					float total=0.;
					vec2 totalVelo=vec2(0.);
					for(int x=-2;x<=2;x++){
						for(int y=-2;y<=2;y++){
							vec4 data=texelFetch(leniaTex,coord2+ivec2(x,y),0);
							float val=data.x;
							float density=clamp(data.x-1.,0.,1.);
							float diffuse=mix(1.5,3.,density);
							// float diffuse=3.;
							float diffuseOff=(diffuse-1.)/2.;

							vec2 velo=texelFetch(veloTex,coord2+ivec2(x,y),0).xy;
							vec2 offset=velo+vec2(x,y);
							vec2 boundMin=clamp(offset-diffuseOff,0.,1.);
							vec2 boundMax=clamp(offset+1.+diffuseOff,0.,1.);
							vec2 bound=boundMax-boundMin;
							float overlap=bound.x*bound.y;
							
							float add=overlap/(diffuse*diffuse);
							total+=val*add;
							totalVelo+=val*velo*add;
						}
					}
					if(total>0.){
						totalVelo/=total;
					}
					// vec4 drawData=texture(canvas,pos2);//TODO
					// float drawn=max((drawData.r*2.-1.)*drawData.w,-total);

					outColor0=vec4(total,0.,0.,0.);
					outColor1=vec4(totalVelo,0.,0.);//texelFetch(veloTex,coord2,0);
					// outColor=vec4(total+drawn,val.y,val.z,val.w);
				}
			`,
		);
		this.leniaTexPP=leniaTexPP;
		this.veloTexPP=veloTexPP;
	}
	run(){
		this.uniforms={
			leniaTex:this.leniaTexPP.tex,
			veloTex:this.veloTexPP.tex,
			leniaSize:this.leniaTexPP.size,
		};
		this.attachments=[
			{
				attachment:this.leniaTexPP.flip().tex,
				...sizeObj(this.leniaTexPP.size)
			},{
				attachment:this.veloTexPP.flip().tex,
			},
		];
		super.run();
	}
}