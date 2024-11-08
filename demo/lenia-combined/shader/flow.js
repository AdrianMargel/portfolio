class FlowShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				#define TAU ${TAU}
				precision highp float;
				precision highp sampler2D;
				
				uniform sampler2D leniaTex;
				uniform sampler2D veloTex;
				uniform sampler2D dnaTex;
				uniform sampler2D drawTex;
				uniform vec2 size;
				uniform bool updateDna;
				in vec2 pos;
				
				layout(location = 0) out vec4 outColor0;
				layout(location = 1) out vec4 outColor1;
				layout(location = 2) out vec4 outColor2;
				
				ivec2 loopCoord(ivec2 coord){
					return ivec2(mod(vec2(coord),size));
				}

				void main(){
					vec2 pos2=pos*vec2(.5,.5)+.5;
					ivec2 coord2=ivec2(pos2*size);
					
					vec4 valOrigin=texelFetch(leniaTex,coord2,0);
					vec4 valDraw=texture(drawTex,vec2(pos2.x,1.-pos2.y));

					float best=0.;
					ivec2 bestCoord=coord2;
					float total=0.;
					vec2 totalVelo=vec2(0.);
					for(int x=-2;x<=2;x++){
						for(int y=-2;y<=2;y++){
							ivec2 coordOff=loopCoord(coord2+ivec2(x,y));
							vec4 data=texelFetch(leniaTex,coordOff,0);
							float val=data.x;
							// float density=clamp(data.x-1.,0.,1.);
							// float diffuse=mix(1.5,3.,density);
							float diffuse=3.;
							float diffuseOff=(diffuse-1.)/2.;

							vec2 velo=texelFetch(veloTex,coordOff,0).xy;
							vec2 offset=velo+vec2(x,y);
							vec2 boundMin=clamp(offset-diffuseOff,0.,1.);
							vec2 boundMax=clamp(offset+1.+diffuseOff,0.,1.);
							vec2 bound=boundMax-boundMin;
							float overlap=bound.x*bound.y;
							
							float add=overlap/(diffuse*diffuse);
							float addVal=val*add;
							vec2 addVelo=addVal*velo;
							total+=addVal;
							totalVelo+=addVelo;

							if(addVal>best){
								best=addVal;
								bestCoord=coordOff;
							}
							// if(val>best){
							// 	best=val;
							// 	bestCoord=coordOff;
							// }
						}
					}
					if(total>0.){
						totalVelo/=total;
					}
					// vec4 drawData=texture(canvas,pos2);//TODO
					// float drawn=max((drawData.r*2.-1.)*drawData.w,-total);

					// float affinity=texelFetch(leniaTex,coord2,0).y;
					// outColor0=vec4(total,affinity,valOrigin.z,0.);
					outColor0=vec4(max(
						total//-.001
						+valDraw.y-valDraw.x,0.
					),0.,0.,0.);
					// outColor0=vec4(clamp(
					// 	total*1.005-.001
					// 	+valDraw.y-valDraw.x,0.,2.
					// ),0.,0.,0.);
					outColor1=vec4(totalVelo,0.,0.);//texelFetch(veloTex,coord2,0);
					if(total==0.){
						outColor2=vec4(-1.);
					}else if(updateDna){
						outColor2=texelFetch(dnaTex,bestCoord,0);//texelFetch(veloTex,coord2,0);
					}else{
						outColor2=texelFetch(dnaTex,coord2,0);//texelFetch(veloTex,coord2,0);
					}
					// outColor=vec4(total+drawn,val.y,val.z,val.w);
				}
			`,
		);
	}
	run(updateDna,leniaTexPP,veloTexPP,dnaTexPP,drawTex){
		this.uniforms={
			leniaTex:leniaTexPP.tex,
			veloTex:veloTexPP.tex,
			dnaTex:dnaTexPP.tex,
			drawTex:drawTex.tex,
			size:leniaTexPP.size,
			updateDna,
		};
		this.attachments=[
			{
				attachment:leniaTexPP.flip().tex,
				...sizeObj(leniaTexPP.size)
			},{
				attachment:veloTexPP.flip().tex,
			},{
				attachment:dnaTexPP.flip().tex,
			},
		];
		super.run();
	}
}