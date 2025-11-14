class ClearShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				precision highp float;
				precision highp int;
				precision highp sampler2D;

				out vec4 outColor;

				void main(){
					outColor=vec4(0.,0.,0.,0.);
				}
			`,
		);
	}
	run(tex){
		this.attachments=[
			{
				attachment:tex.tex,
				...sizeObj(tex.size)
			}
		];
		super.run();
	}
}