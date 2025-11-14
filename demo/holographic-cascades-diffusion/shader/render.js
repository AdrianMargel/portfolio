class RenderShader extends FragShader{
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

				${SHADER_FUNCS.GAMMA}
				
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

				vec4 heatColorMap(float x){
					vec4 col[10];
					col[0] = vec4(0.0,0.0,0.0,1.0);
					col[1] = vec4(24./255.,8./255.,64./255.,1.0);
					col[2] = vec4(65./255.,13./255.,96./255.,1.0);
					col[3] = vec4(107./255.,21./255.,108./255.,1.0);
					col[4] = vec4(148./255.,35./255.,103./255.,1.0);
					col[5] = vec4(186./255.,54./255.,82./255.,1.0);
					col[6] = vec4(233./255.,116./255.,21./255.,1.0);
					col[7] = vec4(251./255.,163./255.,17./255.,1.0);
					col[8] = vec4(245./255.,216./255.,61./255.,1.0);
					col[9] = vec4(1.,1.,176./255.,1.0);

					const int ncolours=10;
					int n=int(x*float(ncolours-1));
					float samplePlace=fract(x*float(ncolours-1));
				
					return mix(col[n],col[n+1],samplePlace);
				}

				void main(){
					vec2 pos2=(pos+1.)*.5;
					vec4 col=texture(tex,pos2);

					outColor=vec4(gammaCorrect(col.rgb),1.);
					// outColor=vec4(gammaCorrect(col.rrr)*vec3(1.,.3,.01)*2.,1.);
					// outColor=heatColorMap(min(col.r+0.001,.99));
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