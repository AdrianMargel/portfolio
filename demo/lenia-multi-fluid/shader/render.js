class RenderShader extends FragShader{
	constructor(){
		super(
			glsl`#version 300 es
				precision highp float;

				uniform sampler2D tex;
				uniform sampler2D tex2;
				in vec2 pos;
				out vec4 outColor;
				
				vec3 rgb2hsv(vec3 c){
					vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
					vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
					vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
	
					float d = q.x - min(q.w, q.y);
					float e = 1.0e-10;
					return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
				}
	
				vec3 hsv2rgb(vec3 c){
					vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
					vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
					return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					vec4 col=texture(tex,pos2);
					vec4 col2=texture(tex2,pos2);
					// outColor=vec4(col.xyz,1);
					// outColor=vec4(col.xxx,1);
					outColor=vec4(col.x*.5,col2.x*.5,0.,1);
					// outColor=vec4(col.x,col.x*.25,col.x*.125,1);
					// outColor=vec4(col.y/2.,-col.y/2.,col.x,1.);
					// outColor=vec4(-col.z,-col.w,0.,1);
					// outColor=vec4(hsv2rgb(vec3(col2.y,1.,col.x*.5)),1);
				}
			`,
		);
	}
	run(renderTex,render2Tex){
		this.uniforms={
			tex:renderTex.tex,
			tex2:render2Tex.tex,
			size:renderTex.size,
		};
		super.run();
	}
}