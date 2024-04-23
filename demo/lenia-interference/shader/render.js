class RenderShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				precision highp float;

				uniform sampler2D tex;
				in vec2 pos;
				out vec4 outColor;

				void main(){
					vec2 pos2=(pos+1.)*.5;
					vec4 col=texture(tex,pos2);
					// outColor=vec4(col.xyz,1);
					outColor=vec4(col.xxx,1);
					// outColor=vec4(col.x,col.y*5.,-col.y*5.,1);
					// outColor=vec4(-col.z,-col.w,0.,1);
				}
			`,
		);
	}
	run(renderTex){
		this.uniforms={
			tex:renderTex.tex,
			size:renderTex.size,
		};
		super.run();
	}
}