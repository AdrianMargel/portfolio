class CopyShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				precision highp float;
				precision highp int;
				precision highp sampler2D;

				uniform sampler2D tex;
				uniform vec2 size;
				in vec2 pos;
				
				out vec4 outColor;

				void main(){
					vec2 pos2=(pos+1.)*.5;
					ivec2 coord=ivec2(pos2*size);

					outColor=texelFetch(tex,coord,0);
				}
			`,
		);
	}
	run(texPP){
		this.uniforms={
			tex:texPP.tex,
			size:texPP.size,
		};
		this.attachments=[
			{
				attachment:texPP.flip().tex,
				...sizeObj(texPP.size)
			}
		];
		super.run();
	}
}