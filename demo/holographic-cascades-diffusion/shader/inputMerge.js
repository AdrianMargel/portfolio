class InputMergeShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				precision highp float;
				precision highp int;
				precision highp sampler2D;

				uniform sampler2D aTex;
				uniform sampler2D bTex;
				uniform sampler2D barrierTex;
				uniform vec2 size;
				in vec2 pos;
				
				out vec4 outColor;

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord=ivec2(pos2*size);

					vec4 barrier=texture(barrierTex,pos2);
					if(barrier.r<0.1&&barrier.a>0.){
						outColor=vec4(0.,0.,0.,-1.);
						return;
					}

					vec4 a=texture(aTex,pos2);
					vec4 b=texture(bTex,pos2);

					outColor=a+b;//TODO
				}
			`,
		);
	}
	run(aTex,bTex,barrierTex,tex){
		this.uniforms={
			aTex:aTex.tex,
			bTex:bTex.tex,
			barrierTex:barrierTex.tex,
			size:tex.size,
		};
		this.attachments=[
			{
				attachment:tex.tex,
				...sizeObj(tex.size)
			}
		];
		super.run();
	}
}