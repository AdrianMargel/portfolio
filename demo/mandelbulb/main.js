class RenderShader extends FragShader{
	constructor(ppTex){
		super(glsl`#version 300 es
				precision highp float;

				in vec2 coord;

				uniform float rand;
				uniform sampler2D tex;
				uniform vec3 dirX;
				uniform vec3 dirY;
				uniform vec3 dirZ;
				uniform vec3 viewPos;
				uniform vec2 rez;
				uniform float t;

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

				float mandel(vec3 pos, out int steps,int stepsMax) {
					float Power=t;
					vec3 z = pos;
					float dr = 1.0;
					float r = 0.0;
					for (int i = 0; i < stepsMax ; i++) {
						r = length(z);
						steps = i;
						if (r>4.0) break;
						
						// convert to polar coordinates
						float theta = acos(z.z/r);
						float phi = atan(z.y,z.x);
						dr =  pow( r, Power-1.0)*Power*dr + 1.0;
						
						// scale and rotate the point
						float zr = pow( r,Power);
						theta = theta*Power;
						phi = phi*Power;
						
						// convert back to cartesian coordinates
						z = zr*vec3(sin(theta)*cos(phi), sin(phi)*sin(theta), cos(theta));
						z+=pos;
					}
				
					return 0.5*log(r)*r/dr;
				}
				float sdf2(vec3 p){
					return length(p-vec3(0))-1.;
				}
				float sdf1(vec3 p){
					return min(
						length(p-vec3(0.,0.,50.))-40.,
						length(p-vec3(0.,10.,700.))-500.
					);
				}
				float repeated( vec3 p, float s )
				{
					vec3 r = p - s*round(p/s);
					return max(sdf2(r),max(max(-p.x,-p.y),-p.z));
				}
				float sdf(vec3 p){
					return min(
						sdf1(p),
						repeated(p-vec3(2.5),5.)
					);
				}
				void main(){
					float stretch=rez.x/rez.y;
					vec3 pos=viewPos;
					vec3 dir=normalize(vec3(coord*vec2(stretch,1.),1.));
					dir=dir.x*dirX + dir.y*dirY + dir.z*dirZ;
					float di;
					int iMax=200;
					int steps=0;
					int stepsMax=50;
					for(int i=0;i<iMax;i++){
						float d=mandel(pos,steps,stepsMax);//sdf(pos);
						if(d<.00001){
							di=float(i);
							break;
						}
						pos+=dir*d;
					}
					// outColor=vec4(vec3(float(di)*0.01),1.);
					outColor=vec4(hsv2rgb(vec3(float(steps)/20.,1.,float(di)/float(iMax))),1.);
					// outColor=vec4(vec3(length(pos-viewPos)/10000.),1.);
					if(sdf1(pos)<.1){
						outColor*=vec4(1.,0.,0.,1.);
					}
					// outColor=vec4(pos.zzz*.01,1.);
				}
			`
		);
		this.ppTex=ppTex;
		this.t=2;
	}
	run(pos,angles){
		let dirX=Vec(1,0,0);
		let dirY=Vec(0,1,0);
		let dirZ=Vec(0,0,1);

		dirX.yz=dirX.YZ.rot(angles.y);
		dirY.yz=dirY.YZ.rot(angles.y);
		dirZ.yz=dirZ.YZ.rot(angles.y);

		dirX.xz=dirX.XZ.rot(angles.x);
		dirY.xz=dirY.XZ.rot(angles.x);
		dirZ.xz=dirZ.XZ.rot(angles.x);

		this.uniforms={
			rand: rand(),
			tex: this.ppTex.tex(),
			dirX,
			dirY,
			dirZ,
			viewPos:pos,
			rez:[gl.canvas.width,gl.canvas.height],
			t:this.t+=0.01
		};
		
		super.run();
	}
}