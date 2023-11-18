class ProjectPage extends CustomElm{
	constructor(){
		super();
		this.headings=bind([],false);
		this.define(html`
			${new Surface(html`
				<h2>Overview</h2>
				<p class="center bold projectLink"><a href="https://github.com/AdrianMargel/unlimited-skies">Github</a></p>
				<p class="center bold projectLink"><a href="https://unlimitedskies.ca/">Play</a></p>
				<p class="center bold projectLink"><a href="https://unlimitedskies.ca/play/?sandbox=1">Sandbox</a></p>
				${new ImageDisplay("img/play-graphic.png")}
				<p>
					Unlimited Skies is a free online/mobile game I created where you unlock increasingly insane planes to fight against increasingly insane waves of aliens. Although on the surface this game may look simple, there is a huge amount of depth to it. Despite each game lasting only around 5 minutes on average, the game easily provides over 5 hours of content. And a few of my friends have sunk dozens of hours into this game after becoming addicted.
				</p>
				<p> 
				</p>
			`,"lg",false,true)}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Inspiration</h2>
				<p>
					This game was inspired by many of the old flash games I remember playing as a kid. Flash games were their own kind of genre, often focusing on a gameplay loop of buying new upgrades and unlocks. I really enjoy this kind of game, but unfortunately the game industry no longer makes this style of game. So I decided to make my own as a love letter for this long-forgotten genre. 
				</p>
				<p>
					This also gave me opportunity and insight into marketing. Allowing me to experience first hand some of the challenges that surround raising awareness for a product (in this case a game). I continue to use Unlimited Skies as an experiment to test the waters for different methods of advertising which I have hopes of using for bigger projects in the future. 
				</p>
				<p>
					This game ended up being hugely more work than I was expecting and I am incredibly proud of the end result of that work. The final project ended up being over 16,000 lines of JavaScript which should give you some idea of the scope of the project. I obviously can't go in depth about everything but I'll try to highlight some of the interesting challenges and features below.
				</p>
			`,"lg")}
			${new Surface(html`
				<h2>Sections</h2>
				<div class="nav">
					<ul>
						${html`
							${()=>this.headings.map(h=>html`
								<li class="${h.tagName.toLowerCase()}">
									${new ButtonLink(h.innerText,()=>
										window.scrollTo(0,h.getBoundingClientRect().top+document.documentElement.scrollTop-50-20)
									)}
								</li>
							`())}
						`(this.headings)}
					</ul>
				</div>
			`,"sm",true)}
			${new Surface(html`
				<h2>Challenges</h2>
				<h3>Physics</h3>
				<h4>Movement</h4>
				<p>The movement of each plane is customized to give a unique feel. For example, the Helicopter follows completely different movement calculations than the Fighter Jet... because it's a helicopter. However, without going into detail of each plane I'll try to describe a few common movement properties which many of the planes use.</p>

				<p class="bold">1. Thrust</p>
				<p>Thrust determines how quickly a plane can accelerate. It is calculated in 3 parts. <span class="bold">Thrust Limit</span>: the maximum allowed acceleration. <span class="bold">Thrust Potential</span>: The maximum amount of 'stored up' acceleration. <span class="bold">Thrust Recover</span>: the speed that acceleration can be stored up.</p>
				<p>At all times the plane slowly stores up acceleration. When the player wants to move forward that stored up acceleration is then depleted as thrust. In effect while the plane is in constant movement it will have a constant acceleration equal to its <span class="bold">Thrust Recover</span>. But if it stops moving is will start to store up excess acceleration, like a spring, up to it's <span class="bold">Thrust Potential</span>. Which will then be released when it starts moving again as a quick boost to get up to speed, accelerating at its <span class="bold">Thrust Limit</span> until the excess stored up acceleration is used up. This allows more agile play since if the player stops they can very quickly get back up to speed or change direction.</p>
				<p class="bold">2. Agility</p>
				<p>Agility is based on a min and max value as well as a stall value. As the plane speeds up and approaches its max <span class="bold">Flight Efficiency</span> the agility decreases to the min value. This means at slow speeds the plane is quick to turn and at fast speeds the plane is more resistant to turning. If the plane is moving backwards from the direction it is facing that is considered a stall and the agility will be set to the stall value which is generally higher. By increasing agility during a stall it makes it easier to quickly recover to normal flight.</p>
				<p class="bold">3. Resistance (Drag)</p>
				<p>Resistance works almost identically to agility, except instead of modulating the speed which the plane can turn, it modulates the percentage the plane will be slowed by each frame. At higher speeds the resistance is higher to limit the maximum speed it can go.</p>
				<p class="bold">4. Momentum Transfer (Lift)</p>
				<p>Momentum transfer is a bit complicated, but basically when the plane turns this determines how much of the forward momentum should be "transferred" to the new forward angle. This is basically what allows the plane to glide and feel like a plane without just sliding around in the air. Like agility and resistance it is also based on <span class="bold">Flight Efficiency</span>, but it also takes into account the dot product between the plane's forward direction and the angle of its velocity. This is done so that sharper turns will cause more speed to be lost.</p>
				<p>A good way of thinking about momentum transfer is by cutting a knife through water, you will notice that as you rotate the angle of the blade it will feel like it is pushing sideways as you move it forward. But if you rotate it too far so that it is almost completely sideways there will be no sideways force. This is why a dot product is used.</p>
				<p class="bold">5. Flight Efficiency</p>
				<p>Flight efficiency is calculated as a value from 0 to 1, based on the speed of the plane compared to its min and max speed. Up until its min speed the flight efficiency is 0 and thus there is no lift but also minimal drag. As it speeds up the flight efficiency increases towards 1 where there is maximum lift and maximum drag.</p>
				<p class="bold">6. Gravity</p>
				<p>Heavier planes have a stronger gravitational vector. This is not technically how gravity works in the real world but it works very well for games.</p>
				<p class="bold">7. Water</p>
				<p>Each plane has custom values for how it interacts with water. <span class="bold">Water Resistance(Drag)</span>, <span class="bold">Buoyancy</span>, <span class="bold">Splash Size</span>, and <span class="bold">Wave Size</span> are all set per plane to give a unique sense of weight and size when the plane hits the water.</p>

				<p class="bold">- Conclusion -</p>
				<p>The movement of each plane is quite detailed and it may seem excessive. Why put all this work into details that no player will notice? But that's the thing, people do notice. It is all these small details that contribute to the "feeling" of each plane. If you simplify the movement people may not know how to describe what has changed but they will feel that something is lacking. Feeling is the way our brains allow us to experience complexity without consciously understanding it. Even though it may seem excessive, all of this depth is necessary to create a "feeling" within the player, such as the feeling of heavy sluggishness on the Flying Fortress, or slippery uncontrollable speed with Nyan Cat.</p>

				<h4>Hit Detection</h4>
				<p>Hit detection between objects is incredibly important in almost any physics engine. Unfortunately, it is also a performance bottle-neck which limits many physics engines. In order to solve this issue I created a novel system for hit detection based on <a href="https://iquilezles.org/articles/distfunctions2d/">Signed Distance Fields</a> (SDFs) to quickly approximate solutions to this problem between any two arbitrary shapes.</p>
				<p>SDFs are a way of describing shapes mathematically as a function which will for any point return the closest distance to the shape. It is commonly used in ray tracing. I discovered a simple way of doing hit detection between any two SDFs which is massively faster than conventional hit detection methods.</p>
				<p>
					The approach is simple:
					<br/>1. Pick a point within the first shape
					<br/>2. Find the closest point to it on the second shape.
					<br/>3. Get the distance from that point to the nearest point to it on the first shape.
					<br/>4. If the distance returned is negative then the two shapes overlap.
				</p>
				<p>The method does not give an exact solution for all shapes and will sometimes miss collisions, especially around sharp corners. However it guarantees an approximated solution for any two shapes only using 4 steps. This makes it perfect for a game like this where it doesn't matter if two objects slightly overlap as long as they can bump into each other when they get too close.</p>
				<p>It gets even better though, if one of those shapes happens to be a circle then the math becomes identical to ray tracing and it is now once again possible to get an exact solution regardless of how complex the second shape is. This means for round objects (such as bullets) there is zero chance of missing a collision (we'll get to that). I believe it would also be possible to improve this algorithm by allowing it multiple iterations to increase the accuracy at the cost of performance, but that was not required for this use case.</p>
				<p>On top of this I also use other common physics acceleration techniques, such as AABB checks and 2D hit detection grids. These are extremely common and not worth discussing here. The result of all this is an incredibly fast physics engine able to handle thousands of simultaneous entities on the CPU.</p>
				<p>Here you can see everything visualized. The 2D hit detection grid is visible. The SDFs are shown. And AABB hit boxes (adjusted for velocity) can also be seen.</p>
				${new ImageDisplay("img/sdfs.png")}
				<p>The result of all this can be seen here. You can see (or can't) the Flying Castle at wave 48 being completely covered by thousands of enemies.</p>
				${new ImageDisplay("img/crazywave6.png")}
				<p>Here you can see the Pod Racer at wave 47 drilling a path through thousands of enemies.</p>
				${new ImageDisplay("img/podracerwave7.png")}
				<h4>Bullet Ray Tracing</h4>
				<p>As mentioned above, the hit detection is done with SDFs, this means that we can use ray tracing calculations to get exact solutions for circular objects. This is used for calculating collisions with bullets. Each bullet is cast like a ray to see if it will hit anything. This allows the bullets to determine if they hit anything very quickly and with 100% accuracy. To put it into perspective just how fast this is, ray tracing is able to run this algorithm on complex scenes for every pixel on the screen in real time. This use case is trivial compared to that.</p>
				<p>Another huge advantage of doing things this way is that it works with bullets at any speed. Ray tracing is able to do this for light particles which move at the speed of, well, light. This means unlike conventional hit detection methods there is never any fear of missing a collision due to the bullet moving too fast.</p>
				<h4>Dynamic Framerate</h4>
				<p>The concept is pretty simple but it ended up being a huge amount of work. Different devices have different performance limits, especially phones are less powerful and thus will run at a lower framerate. The issue is that if the framerate drops then the game starts to lag.</p>
				<p>You might think that you can just solve this problem by putting the game logic into a separate loop, but then the animation loop will not be synchronized with the game loop which causes occasional frame skipping when the two misalign. This is barely noticeable but increases eye fatigue as the framerate is uneven.</p>
				<p>A better solution is to keep the animation and game logic in the same loop and then to have all game logic run with a delta-T value tracking the time between the current frame and the previous one. This is the solution I ended up going with, it ended up being a lot of work since I had to rewrite every single function in the game to work with this variable framerate. In the end it allows the game to run smoothly with minimal lag regardless of the framerate of the device. There is also a minimum framerate which it cannot go below at which point the game will start to genuinely lag, this is because if you try to simulate certain things (like water) with a large delta-T value it causes instability and glitches.</p>

				<h3>Rendering</h3>
				<p>The rendering is done by a custom GPU shader. The built-in draw functions in JavaScript are easy to use but are also very performance heavy. I found that rendering over thousand sprites caused a significant decrease to framerate. After implementing my own shader I was able to render around a million sprites before running into equivalent framerate issues. Although in the final version I ended up setting a sprite limit around ten thousand to avoid causing shader errors for lower-end devices (smart phones).</p>
				<p>
					Additionally the shader I created is written with support for surface normals which allow lighting effects to be rendered at almost no extra cost. I ended up doing all the surface normals by hand in Paint.Net which was incredibly tedious, but ultimately worth it. 
				</p>
				<p>
					Here you can see the spritesheet with surface normals on the left and the rendered result on the right.
				</p>
				${new ImageDisplay("img/sprite-compare.png")}
				<p>
					The Dragon is probably the best example of the success of this rendering engine. Every single scale is individually rendered and yet it still easily runs in real time even with the burden of rendering the rest of the game along side it.
				</p>
				${new ImageDisplay("img/dragonlong.png")}

				<h3>Sky</h3>
				<h4>Atmosphere Shading</h4>
				<p>The color of the sky is based on the altitude from the ground. As you go higher the atmosphere gets thinner and the color of the sky changes to reflect that.</p>
				<p>At high altitudes the sky gives way to blackness and stars can be seen. The clouds also thin away to nothing, as seen here.</p>
				${new ImageDisplay("img/space.png")}
				<h4>Clouds</h4>
				<p>The clouds are procedurally generated based on various noise textures and math. The clouds ended up being a huge technical challenge. For the sake of your time and my sanity I won't go into the details here. If you are interested you can <a href="https://www.guerrilla-games.com/read/the-real-time-volumetric-cloudscapes-of-horizon-zero-dawn">read more about it here</a>, my version is basically a simplified 2D version of what is written about there.</p>
				<p>The clouds are randomized with a new seed each new game. They also slowly change and evolve over time as a result of scrolling noise textures.</p>
				${new ImageDisplay("img/clouds.png")}
				<p>The clouds at higher altitudes are thinner and have a unique appearance.</p>
				${new ImageDisplay("img/cloudshigh.png")}
				<h4>Cloud Trails</h4>
				<p>
					Various things can leave behind cloud trails, such as explosions or jet engines. These trails are persistent even when not visible on screen but slowly fade away over time.
				</p>
				<p>
					When something explodes and a cloud trail is made the smoke color and current time is written to UintArrays which hold the cloud data. These UintArrays are 1D but by storing a series of them in a 2D grid and interpreting their data as 2D, they can be used to hold continuous 2D data using only finite 1D arrays. This data is then combined every frame into a unified UIntArray based on the position of the camera. Then this data along with the camera state is sent to the GPU shader where it can be interpreted as 2D data once again and rendered.
				</p>
				<p>
					By storing the time with each cloud trail update, the trails can slowly fade away just by checking the difference between the current time and the update time for that pixel. This prevents the need to do expensive updates each frame to fade the trails.
				</p>
				${new ImageDisplay("img/cloudtrail.png")}
				<p>
					The cloud trails also support blending of any color. This can be clearly seen with Nyan Cat or the Hippie Bomber which both cause the smoke from all explosions to be rainbow colored.
				</p>
				${new ImageDisplay("img/cloudtrailcolor.png")}

				<h3>Water</h3>
				<h4>Movement</h4>
				<p>
					The movement of the water is calculated with an array of points along the surface of the water that bounce up and down on a spring while transferring momentum to their neighboring points. The surface of the water is defined by the line going along these points.
				</p>
				<p>White "splash" and "bubble" particles are created when ever something hits the water. The amount, size and speed of these created particles is based on speed of the colliding object and is customized for every type of plane and alien in the game to give a unique sense of weight and size for that object.</p>
				${new ImageDisplay("img/splash.png")}
				<h4>Water Shading</h4>
				<p>
					The water is colored with a custom shader which uses some lengthy math to determine the color of each pixel based on its distance from the surface and the shape of the waves on the surface. I'm massively simplifying here, the details are very technical and long.
				</p>
				<h4>Water Shadows</h4>
				<p>The water shadows work by having each object write its Y position to a numeric array each frame. The array represents a horizontal line which captures the shadows cast on it by all objects above it. When a shadow is written it will not overwrite any existing shadow which is higher than itself. In this way the shadow array effectively works as a 1D z-buffer.</p>
				<p>This array of shadows is then sent to the GPU water shader allowing for rendering of dynamic underwater shadows, as seen below.</p>
				${new ImageDisplay("img/dragon-shadow.png")}

				<h3>Enemy AI</h3>
				<p>
					The enemy AI ended being way more complicated than you might expect. Each enemy is capable of making its own decisions but can also be influenced by other enemies around it. For example even the most basic enemy, the Dart, will try to match its momentum with neighboring ships in the swarm to create coordinated flocking behavior. This has to be done in a way that doesn't slow performance and can handle any possible game state.
				</p>
				<p>
					To complicate things even more, the behaviour of large numbers of enemies can be influenced by the presence of bosses which arrange those enemies into formations around them.
				</p>
				<p>In order to solve this problem I broke it into two parts: enemy awareness and enemy behaviour.</p>
				<h4>Enemy Awareness</h4>
				<p>
					Enemy awareness is how enemies and find and coordinate with their neighbors. This is an N-to-N problem which can very quickly lead to performance issues if not handled properly. To solve this problem each enemy starts off with awareness of 0 neighbors and then will randomly sample from the list of all enemies each frame and choose whether it wants to remember that enemy for later. This allows enemies to slowly build up a list of relevant neighbors over time and thus coordinate with them.
				</p>
				<h4>Enemy Behavior</h4>
				<p>Enemy behaviour is how the enemy chooses to act. I solved this problem by having each enemy send out orders to its neighbors telling them how it would like them to act. It also includes a priority on the order to indicate how important that order is. The enemy then looks at all orders it received and determines how it can act to satisfy as many of those orders as possible.<p>
				<p>So for example a unit might have a low priority order to move towards and shoot at the player, but a boss might order it to stay within a certain radius of the boss as defense. In response it will find the point in that radius circle which is closest to the player and then try to stay on that closest point as a compromise which satisfies both constraints. If it is not possible to satisfy both orders it will go with the higher priority order. All enemy AI is handled in this way.</p>
				<p>This allows complex decentralized enemy behaviour. For example here you can see Swarmers arranging themselves into long chains around the player.</p>
				${new ImageDisplay("img/longchain.png")}
				<p>Or for another example below, you can see the Spike Boss ordering the Shields into a defensive ring formation around it. Then the Snipers nest within that ring since they will try to take cover behind Shields. And finally you can see a slight offset to the ring of Snipers as they try to move towards the player for extra range while staying within a protective radius behind the shield. These are 3 different behaviors all of which are able to overlap with one another to make for interesting and complex swarm-intelligence.</p>
				${new ImageDisplay("img/protect.png")}
			`,"lg")}
			<div class="gap"></div>
			${new Surface(html`
				<h2>Features</h2>
				<h3>Planes</h3>
				<p>I designed each plane in the game to be incredibly different both in terms of aesthetic and also in the way they control and their play-style.</p>
				<p>Each plane is infinitely upgradable. Planes can be leveled down to a level 0 version which is much weaker. At level 5 many planes upgrade to a new type.</p>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Wright Flyer</p>
							${new ImageDisplay("img/planes/10.png")}
						</div>
						<div>
							<p class="title">Fighter Jet</p>
							${new ImageDisplay("img/planes/11.png")}
						</div>
						<div>
							<p class="title">F-22 Raptor</p>
							${new ImageDisplay("img/planes/12.png")}
						</div>
					</div>
					<div class="tell">
						<p>The most basic plane. Decently balanced in all aspects.</p>
						<p>The Fighter Jet was designed to be a little bit more difficult to pilot so that new players get a feel for the controls and the importance of momentum.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Nullplane</p>
							${new ImageDisplay("img/planes/20.png")}
						</div>
						<div>
							<p class="title">Biplane</p>
							${new ImageDisplay("img/planes/21.png")}
						</div>
						<div>
							<p class="title">Pile of Wings</p>
							${new ImageDisplay("img/planes/22.png")}
						</div>
					</div>
					<div class="tell">
						<p>A slower easier to control version of the first plane for closer range combat.</p>
						<p>As it levels up more wings and guns are added. As more wings are added the plane gains more lift but becomes more difficult to turn, thus changing the way it feels to fly.</p>
						<p>The Nullplane has no wings and thus generates no lift making it nearly impossible to keep airborne.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Buzz Bomb</p>
							${new ImageDisplay("img/planes/30.png")}
						</div>
						<div>
							<p class="title">War Plane</p>
							${new ImageDisplay("img/planes/31.png")}
						</div>
						<div>
							<p class="title">Corsair</p>
							${new ImageDisplay("img/planes/32.png")}
						</div>
					</div>
					<div class="tell">
						<p>Similar to the first plane but with higher fire power and unique handling.</p>
						<p>The War Plane can be leveled up to drop small bombs.</p>
						<p>The Buzz Bomb has no attack but will self-destruct when it hits an enemy dealing massive damage. It can one-hit kill almost everything but you only get one shot.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Hippie Bomber</p>
							${new ImageDisplay("img/planes/40.png")}
						</div>
						<div>
							<p class="title">Bomber</p>
							${new ImageDisplay("img/planes/41.png")}
						</div>
						<div>
							<p class="title">Black Bird</p>
							${new ImageDisplay("img/planes/42.png")}
						</div>
					</div>
					<div class="tell">
						<p>A bomber able to fly at high altitude and drop bombs on the enemies below.</p>
						<p>As the bomber is leveled up the bombs become more powerful, ultimately ending with the Black Bird dropping nuclear bombs.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Helicopter?</p>
							${new ImageDisplay("img/planes/50.png")}
						</div>
						<div>
							<p class="title">Helicopter</p>
							${new ImageDisplay("img/planes/51.png")}
						</div>
						<div>
							<p class="title">Attack Helicopter</p>
							${new ImageDisplay("img/planes/52.png")}
						</div>
					</div>
					<div class="tell">
						<p>Flies like a helicopter shooting sideways at any enemies. Allows very quick and agile movement.</p>
						<p>The level 0 "Helicopter?" is the same as the normal Helicopter but the body spins instead of the propeller.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Flying House</p>
							${new ImageDisplay("img/planes/60.png")}
						</div>
						<div>
							<p class="title">Hot Air Balloon</p>
							${new ImageDisplay("img/planes/61.png")}
						</div>
						<div>
							<p class="title">Zeppelin</p>
							${new ImageDisplay("img/planes/62.png")}
						</div>
					</div>
					<div class="tell">
						<p>High-range, high-firepower, no propulsion. Instead it relies on the knockback from its massive gun to move around.</p>
						<p>Only the basket of the Hot Air Balloon takes damage so the balloon can be used like a massive inflatable shield.</p>
						<p>The Zeppelin overcomes the main limitation of the Hot Air Balloon by adding propellers to help move around. It also gains lift like a plane when moving which gives it the weirdest handling of any plane in the game. However it can no longer can use the balloon as a shield.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Air Liner</p>
							${new ImageDisplay("img/planes/70.png")}
						</div>
						<div>
							<p class="title">Flying Fortress</p>
							${new ImageDisplay("img/planes/71.png")}
						</div>
						<div>
							<p class="title">Flying Castle</p>
							${new ImageDisplay("img/planes/72.png")}
						</div>
					</div>
					<div class="tell">
						<p>The Flying Fortress has smaller turrets which fire randomly in all directions around it. It moves slowly but has a huge amount of health.</p>
						<p>The Flying Castle fires massive bullets which explode on impact.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">???</p>
							${new ImageDisplay("img/planes/80.png")}
						</div>
						<div>
							<p class="title">Triebflugel</p>
							${new ImageDisplay("img/planes/81.png")}
						</div>
						<div>
							<p class="title">Rocket</p>
							${new ImageDisplay("img/planes/82.png")}
						</div>
					</div>
					<div class="tell">
						<p>The Triebflugel uses 3 wing-propeller-things rotating around it to generate speed. As it accelerates its firerate increases. This plane has a low acceleration which makes it difficult to get up to speed, but once it does it's almost unstoppable.</p>
						<p>The Rocket once launched cannot be stopped unless the engine is drown in water. It uses the fireball from its engine to damage enemies. It can go infinitely high, I wonder what's up there anyways...</p>
						<p>The "???" does damage be whacking into things and slowly gets bigger each time it hits something allowing it to grow into a massive wrecking ball of doom.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Pod</p>
							${new ImageDisplay("img/planes/90.png")}
						</div>
						<div>
							<p class="title">Pod Racer</p>
							${new ImageDisplay("img/planes/91.png")}
						</div>
						<div>
							<p class="title">Pod Racer</p>
							${new ImageDisplay("img/planes/92.png")}
						</div>
					</div>
					<div class="tell">
						<p>The Pod Racer uses its thrusters to pull it around on bungee-cables. The lightning between the thrusters instantly destroy anything caught between them. As it levels up it gains more thrusters becoming a chaotic mess of cables and deadly lightning.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Flappy Bird</p>
							${new ImageDisplay("img/planes/100.png")}
						</div>
						<div>
							<p class="title">Nyan Cat</p>
							${new ImageDisplay("img/planes/101.png")}
						</div>
						<div>
							<p class="title">Nyan Cat</p>
							${new ImageDisplay("img/planes/102.png")}
						</div>
					</div>
					<div class="tell">
						<p>Nyan Cat destroys things with its rainbow trail. As it levels up it becomes fatter leaving behind a bigger trail.</p>
						<p>Flappy Bird is Flappy Bird but shoots bombs whenever it flaps.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Dragon</p>
							${new ImageDisplay("img/planes/110.png")}
						</div>
					</div>
					<div class="tell">
						<p>Deals damage to anything that touches it. Each time it does damage it grows longer. The Dragon has no upgrades, it's already over-powered.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Spagootz</p>
							${new ImageDisplay("img/planes/120.png")}
						</div>
					</div>
					<div class="tell">
						<p>If you fly high enough the Flying Spaghetti Monster will spawn, preventing you from going too far away. When this happens Spagootz is unlocked as a playable character.</p>
						<p>Spagootz is a peaceful giant and does no damage. This "plane" exists mainly as a secret easter-egg.</p>
					</div>
				</div>
				
				<h3>Aliens</h3>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Dart</p>
							${new ImageDisplay("img/aliens/dart.png")}
						</div>
					</div>
					<div class="tell">
						<p>A simple alien ship which chases and shoots at the player.</p>
						<p>It uses a modified version of the boids flocking algorithm which allows for interesting behavior of large groups.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Arrow</p>
							${new ImageDisplay("img/aliens/arrow2.png")}
						</div>
					</div>
					<div class="tell">
						<p>An upgraded version of the Dart that shoots two bullets instead of one, moves faster and has more health.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Shell</p>
							${new ImageDisplay("img/aliens/shell.png")}
						</div>
					</div>
					<div class="tell">
						<p>An upgraded version of the Dart which is slower with way more health.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Shield</p>
							${new ImageDisplay("img/aliens/shield.png")}
						</div>
					</div>
					<div class="tell">
						<p>A slow moving unit which can only be damaged when hit from behind. It will join up with other nearby shields to form defensive lines which face towards the player.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Sniper</p>
							${new ImageDisplay("img/aliens/sniper.png")}
						</div>
					</div>
					<div class="tell">
						<p>A long-range unit which shoots at the player from a distance.</p>
						<p>Will try to hide behind shields when it can.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Star Gunner</p>
							${new ImageDisplay("img/aliens/stargunner.png")}
						</div>
					</div>
					<div class="tell">
						<p>A version of the sniper but with an extra short-range machine gun on its back. When the player gets too close it will turn around and start firing at the player with its machine gun while running away.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Swarmer</p>
							${new ImageDisplay("img/aliens/swarmer.png")}
						</div>
					</div>
					<div class="tell">
						<p>A small ship which does damage when it hits the player. Forms long chains which target the player.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Wrecker</p>
							${new ImageDisplay("img/aliens/wrecker2.png")}
						</div>
					</div>
					<div class="tell">
						<p>A fast moving wrecking ball which whacks into things knocking them around and damaging the player. Spinning blades, big smiles, what more could you want?</p>
					</div>
				</div>
				<h3>Bosses</h3>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Spike</p>
							${new ImageDisplay("img/aliens/spike.png")}
						</div>
					</div>
					<div class="tell">
						<p>A giant ball of spinning spikes which slowly moves towards the player, damaging the player if they hit it.</p>
						<p>Will cause nearby shields to form a defensive circle around it, making it difficult to approach.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Drill</p>
							${new ImageDisplay("img/aliens/drill.png")}
						</div>
					</div>
					<div class="tell">
						<p>A giant thruster with a drill mounted on front made of spinning guns. Chases the player with a massive central eye that never looks away. Terrifying.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Axe</p>
							${new ImageDisplay("img/aliens/axe.png")}
						</div>
					</div>
					<div class="tell">
						<p>An ultra long-range sniper which fires massive shots which do insane damage. Shaped kind of like an axe.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Yarn</p>
							${new ImageDisplay("img/aliens/yarn.png")}
						</div>
					</div>
					<div class="tell">
						<p>A ball that randomly flies around shooting bullets in all directions when the player is in range. Shaped kind of like a ball of yarn.</p>
					</div>
				</div>
				<div class="plane">
					<div class="show">
						<div>
							<p class="title">Mothership</p>
							${new ImageDisplay("img/aliens/mothership.png")}
						</div>
					</div>
					<div class="tell">
						<p>The final boss of the game. Does no damage directly but makes the other alien ships fall into formation around it protecting it.</p>
					</div>
				</div>
				
				<p>
					
				</p>
			`,"lg")}
			<p class="center">${new ButtonLink("back to top",()=>scrollToTop())}</p>
		`);
	}
	connectedCallback(){
		this.headings.lock();
		this.headings.splice(0,this.headings.length);
		this.headings.push(...([...getElms("h2,h3,h4",this)].slice(3)));
		this.headings.unlock();
	}
}
defineElm(ProjectPage,scss`&{
	.nav{
		${theme.font.interact}
		${theme.center}
		ul{
			padding: 0 40px;
			padding-bottom:20px;
			border:4px solid ${theme.color.greyStep(.5)};
			background-color:${theme.color.greyStep(-1)};
			${theme.boxShadowStep(-2)}
		}
		li{
			list-style: inside;
		}
		.h2{
			margin-top:20px;
		}
		.h3{
			margin-top:10px;
			margin-left:50px;
		}
		.h4{
			margin-left:100px;
		}
	}
	h4{
		background-color:${theme.color.greyStep(.5)};
		padding:10px;
		${theme.font.interact}
		${theme.boxShadowStep(-2)}
		border-bottom: 2px solid ${theme.color.white};
		margin-top:40px;
	}
	width: 100%;
	>.gap{
		height: 40px;
	}
	p.center{
		${theme.centerText}
	}
	.bold{
		font-weight: 700;
	}
	.projectLink{
		a{
			padding: 5px 10px;
			background-color: ${theme.color.greyStep(-2)};
			border-radius: 50px;
		}
	}
	code{
		background-color: ${theme.color.inputStep(-2)};
		color: ${theme.color.inputStep(10)};
		padding: 2px 10px;
		border-radius: 8px;
	}
	.plane{
		border:2px solid ${theme.color.greyStep(.5)};
		${theme.boxShadowStep(-2)}
		margin-bottom:20px;
		>.tell{
			border:2px solid ${theme.color.greyStep(.5)};
			text-align:center;
			padding:0 20px;
		}
		>.show{
			border:2px solid ${theme.color.greyStep(.5)};
			${theme.font.interact}
			text-align:center;
			${theme.center}
			flex-wrap:wrap;
			>div{
				max-width:250px;
				min-width:250px;
				&:last-child{
					>p{
						margin:10px 0;
						border:none;
					}
				}
				&:first-child{
					>p{
						margin:10px 0;
						border:none;
					}
				}
				>p{
					margin:10px 0;
					border:4px solid ${theme.color.greyStep(1)};
					border-top:none;
					border-bottom:none;
				}
				>${ImageDisplay}{
					margin:10px 0;
				}
			}
		}
	}
}`);

let title=bind("Unlimited Skies");
let page=bind(null);
page.data=bind({
	content: new ProjectPage()
});