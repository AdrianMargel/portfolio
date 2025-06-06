/*
	This file contains useful methods and tools for creating websites.

	I highly recomend using these plug ins for VS Code:
		https://marketplace.visualstudio.com/items?itemName=Tobermory.es6-string-html
		https://marketplace.visualstudio.com/items?itemName=ZaydekMichels-Gualtieri.sass-template-strings
*/

/*
	TODO:
		-svg``
		-txt``
		-persistance>naivigation (browser back and forward)
		-documentation types/return types
*/


//#region reactivity
/*
	█▀█ █▀▀ ▄▀█ █▀▀ ▀█▀ █ █ █ █ ▀█▀ █▄█
	█▀▄ ██▄ █▀█ █▄▄  █  █ ▀▄▀ █  █   █ 
*/

//#region proxy setup

//TODO: consider using weakmaps to allow garbage collection
/**
 * A wrapper for a callback function
 */
class Subscription{
	constructor(callback){
		this.callback=callback;
	}
}

/**
 * A handler class to use when creating a reactive proxy to bind data
 */
class ReactiveHandler{
	/**
	 * A basic constructor
	 * @param {object} data The data to bind. Must be an object since proxies can only be attached to objects.
	 * @param {boolean} isRecursive If the data should be bound recursively. This mainly effects if new data added to the object will be bound.
	 */
	constructor(data,isRecursive){
		this.subscriptions=[];
		this.bound=data;
		this.isBound=true;
		this.isRecursive=isRecursive;
		this.isSuppressed=false;
		this.hasChanged=false;
	}
	/**
	 * Determines the behavior when a value is set
	 * 
	 * @param {object} target The bound object whose value is being set
	 * @param {string | Symbol} prop The property being set
	 * @param {*} val The value being set
	 * @returns true
	 */
	set(target,prop,val) {
		let oldValue=target[prop];
		let value;
		if(prop=="data"){
			value=val;
		}else{
			value=this.isRecursive?bind(val,this.isRecursive):val;
		}
		target[prop]=value;

		if(oldValue!==value){
			this.update();
		}
		return true;
	}
	/**
	 * Determines the behavior when a value is gotten
	 * 
	 * @param {object} target The bound object whose value is being gotten
	 * @param {string | Symbol} prop The property being gotten
	 * @returns The value of the property
	 */
	get(target, prop) {
		if(prop=="isBound"){
			return this.isBound;
		}
		let value=Reflect.get(...arguments);
		return value;
	}
	/**
	 * Subscribes to this reactive proxy. Anytime the value changes the callback function will be run.
	 * 
	 * @param {function} callback The function to run
	 * @returns If the subscription could be added. False if the subscription already exists.
	 */
	sub(callback){
		if(!this.subscriptions.some(s => s.callback===callback)){
			let sub=new Subscription(callback);
			this.subscriptions.push(sub);
			return true;
		}
		return false;
	}
	/**
	 * Unsubscribes to this reactive proxy
	 * 
	 * @param {function} callback The callback function to remove 
	 */
	unSub(callback){
		for(let i=0;i<this.subscriptions.length;i++){
			if(this.subscriptions[i].callback===callback){
				this.subscriptions.splice(i,1);
				break;
			}
		}
	}
	/**
	 * A function to run anytime the value updates that will ensure all subscriptions are notified of the change.
	 * If currenty locked then no subscriptions will be informed of the change, but the change will still be noted.
	 */
	update(){
		if(!this.isSuppressed){
			for(let i=0;i<this.subscriptions.length;i++){
				this.subscriptions[i].callback();
			}
		}else{
			this.hasChanged=true;
		}
	}
	/**
	 * Prevents any subscriptions from being notifed of updates effectively disabling reactivity
	 */
	lock(){
		this.isSuppressed=true;
	}
	/**
	 * Allows subscriptions to be notified of updates once again.
	 * 
	 * @param {*} allowUpdate If updates that occurred while locked should be propagated to all subscriptions now.
	 */
	unlock(allowUpdate=true){
		this.isSuppressed=false;
		if(this.hasChanged){
			this.hasChanged=false;
			if(allowUpdate){
				this.update();
			}
		}
	}
}

/**
 * A handler class to use when creating a reactive proxy to bind an array
 */
class ReactiveArrayHandler extends ReactiveHandler{
	/**
	 * Determines the behavior when a value is set
	 * 
	 * @param {*[]} target The bound object whose value is being set
	 * @param {string | Symbol} prop The property being set
	 * @param {*} val The value being set
	 * @returns true
	 */
	set(target,prop,val) {
		if(prop=="length"){
			target[prop]=val;
			this.update();
			return true;
		}
		let oldValue=target[prop];
		let value=this.isRecursive?bind(val,this.isRecursive):val;
		target[prop]=value;

		if(oldValue!==value){
			this.update();
		}
		return true;
	}
}

/**
 * A general method for wrapping an object as a reactive proxy
 * 
 * @param {object} data The data to bind. Must be an object since proxies can only be attached to objects.
 * @param {boolean} isRecursive If the data should be bound recursively. This mainly effects if new data added to the object will be bound.
 * @returns The reactive proxy binding the object
 */
function bindGeneral(data,isRecursive){
	return bindProxy(data,new ReactiveHandler(data,isRecursive));
}

/**
 * A general method for wrapping an array as a reactive proxy
 * 
 * @param {*[]} data The data to bind
 * @param {boolean} isRecursive If the data should be bound recursively. This mainly effects if new items added to the array will be bound.
 * @returns The reactive proxy binding the array
 */
function bindArray(data,isRecursive){
	return bindProxy(data,new ReactiveArrayHandler(data,isRecursive));
}

/**
 * Binds an object with a reactive proxy
 * 
 * @param {object} data The data to bind
 * @param {ReactiveHandler} handler The handler to bind with
 * @returns The reactive proxy binding the object
 */
function bindProxy(data,handler){
	// Give the bound object access to some of the methods on the handler
	data.sub=(sub)=>{handler.sub(sub)};
	data.unSub=(sub)=>{handler.unSub(sub)};
	data.lock=()=>{handler.lock()};
	data.unlock=(allowUpdate)=>{handler.unlock(allowUpdate)};
	data.update=()=>{handler.update()};

	return new Proxy(data, handler);
}

//#endregion

/**
 * Wraps a piece of data in a proxy making it reactive so events will trigger anytime the data changes
 * 
 * @param {*} data The data to bind
 * @param {boolean} recursive If children of the data should be bound also (such as items in array or properties on an object)
 * @returns The reactive proxy for the bound data
 */
 function bind(data,recursive=true){

	// If the data is a primitive then wrap it inside an object and bind that
	// Also treat elements like primitives
	if(typeof data!=="object" || data==null || isElm(data)){
		return bindGeneral({data},recursive);
	}

	// If the data is already bound then return it as is
	if(data.isBound===true){
		return data;
	}

	// If the data is an array then bind it
	if(Array.isArray(data)){
		// If recursive then bind all of the items in the array as well
		if(recursive){
			for(let x in data){
				data[x]=bind(data[x],recursive);
			}
		}
		return bindArray(data,recursive);
	}

	// Otherwise the data is an object and should be bound as such
	// If recursive then bind all of the properties of the object array as well
	if(recursive){
		for(let x in data){
			data[x]=bind(data[x],recursive);
		}
	}
	return bindGeneral(data,recursive);
}

/**
 * Defines a bound object that will update based on a set of other bound objects
 * Regardless of what value is returned by the definition function it will always be treated like a wrapped primitive.
 * A definition can return another bound object though; that's acceptable
 * 
 * @param {function} definition The function to determine the value
 * @param {...any} bindings The bound objects which this value depends on. If any of these change the value will be updated.
 * @returns The bound object based on the definition
 */
function def(definition,...bindings){
	// The binding should not be recursive
	let bound=bind(null,false);
	let update=()=>{bound.data=definition()};
	link(update,...bindings)();
	return bound;
}
/**
 * Links a function to a set of bound objects. The function will be added as a subscription to each bound object.
 * 
 * @param {function} toRun The function to run
 * @param {...any} bindings The bound objects the function should subscribe to
 * @returns The toRun function
 */
function link(toRun,...bindings){
	bindings.forEach((b)=>{b.sub(toRun)});
	return toRun;
}

//#endregion


//#region reactive HTML
/*

	█▀█ █▀▀ ▄▀█ █▀▀ ▀█▀ █ █ █ █▀▀   █ █ ▀█▀ █▀▄▀█ █  
	█▀▄ ██▄ █▀█ █▄▄  █  █ ▀▄▀ ██▄   █▀█  █  █ ▀ █ █▄▄
*/

/*
TODO: Finding capsules to disolve and absorb them is very inefficient right now. There is probably a better solution. (Such as using query selectors)

Update: I looked into this, even completely disabling absorb() and disolve() doesn't have a significant impact on preformance
It looks like most of the time goes to parsing and rendering html which is unrelated to this.
I figured recursively iterating through every DOM element to find the capsules would present a preformance issue
but apparently traversing and moving around elements in the DOM is pretty cheap compared to rendering them which we can't get around anyways.
*/

/**
 * A placeholder element that acts as a temporary capsule allowing the construction and manipulation of a local DOM tree.
 * When the local DOM tree is complete the capsule can be disolved releasing all of its child elements its parent.
 * 
 * As a side note: I know this looks like a great place for a fragement or template but unforunately we need an active DOM we can manipulate.
 */
class Capsule extends HTMLElement{
	/**
	 * A basic constructor
	 */
	constructor(){
		super();
		this.isCapsule=true;

		this.startMarker=newComment();
		this.startMarker.isMarker=true;
		this.startMarker.capsule=this;

		this.endMarker=newComment();
		this.endMarker.isMarker=false;// Only consider the first marker as a marker for this capsule's location
		this.endMarker.capsule=this;
	}
	/**
	 * Absorbs all of the child elements it had previously released back into itself.
	 * All child capsules will also be absorbed.
	 * This is used to reset the capsule before updating it.
	 */
	absorb(){
		if(this.contains(this.startMarker)){
			// If the capsule already contains the start marker then it is already absorbed
			// This can happen if the capsule has been disconnected from the DOM since if it has no parent then it can't disolve
			// In this case just return
			return;
		}
		// Move the capsule to its marker
		replaceElm(this.startMarker,this,true);
		
		let toAbsorb=[];
		let child=this.startMarker;
		// Iterate through each child and add it to the list of elements that should be absorbed back into the capsule
		// Try to cause each child to also absorb itself of any capsules inside
		// When the end marker is hit then the scan is complete
		while(child!==this.endMarker&&child!=null){
			toAbsorb.push(child);
			child=tryAbsorb(child.nextSibling);
		}
		toAbsorb.push(this.endMarker);

		// Add all child elements back inside the capsule
		addElm(toAbsorb,this);

		/**
		 * Try to absorb an element and all of the capsules inside it
		 * 
		 * @param {HTMLElement} target The element to absorb
		 * @returns The target element of the capsule it was absorbed into if it was a marker
		 */
		function tryAbsorb(target){
			if(target==null){
				return null;
			}
			if(isMarker(target)){
				// If it is a marker then absorb the parent capsule
				target.capsule.absorb();
				// Return the capsule since that is what has replaced the marker's location
				return target.capsule;
			}else{
				// If the target is an element then loop through all the children recursively looking for markers and trying to absorb them.
				if(target.childNodes.length>0){
					// Start at the first child
					let tarChild=target.childNodes[0];
					while(tarChild!=null){
						// Try to absorb the child into a pill
						tarChild=tryAbsorb(tarChild);
						// Get the next child and repeat until there are none left
						tarChild=tarChild.nextSibling;
					}
				}
				return target;
			}
		}
	}
	/**
	 * Fills the capsule with HTML
	 * 
	 * @param {string} htmlText The HTML to set for this capsule
	 */
	fill(htmlText){
		this.innerHTML=htmlText;
		// Add the markers to the start and end
		addElmAt(this.startMarker,0,this);
		addElm(this.endMarker,this);
	}
	/**
	 * Disolve the capsule releasing its children into its parent.
	 * All other capsules contained within this capsule will also be disolved.
	 */
	disolve(){
		if(this.parentNode==null){
			// The capsule can't be disolved unless it is inside of another element
			return;
		}
		// Disolve the capsule and all capsules inside it
		tryDisolve(this);
		
		/**
		 * Disolves all capsules within an element
		 * 
		 * @param {HTMLElement} target The element to search
		 */
		function tryDisolve(target){
			// Get the current children before the capsule disolves
			let children=[...target.childNodes];
			// If the element is a capsule then disolve it
			if(isCapsule(target)){
				replaceElm(target,target.childNodes);
			}
			// Try to disolve each child recursively
			children.forEach(tryDisolve);
		}
	}
}
defineElm(Capsule);

// TODO: add text`` function

// TODO: add svg function

// TODO: clean strings before inserting them, strings cannot contain $(#) or $[#]
/**
 * Used to create reactive HTML
 * 
 * @param {string[]} strings The strings from the string template
 * @param {...any} keys The keys from the string template
 * @returns A function which when called will produce a bound reactive Capsule element
 */
function html(strings,...keys){
	// Create a function which will return the reactive HTML
	// The bindings provided to this function will determine when this should update 
	let htmlFunc=(...bindings)=>{

		/* STEP 1: determine placeholder and populate static strings */

		// Create a list of placeholders for anything that isn't a static string
		let placeholders=[];
		/**
		 * Creates a placeholder in the html string for a more non-static values
		 * Used to allow dynamic values to be replaced/updated as they change
		 * The key will also be added to the placeholders list for later
		 * 
		 * @param {*} key The value to placehold
		 * @returns The string placeholder to add to the html
		 */
		function placehold(key){
			placeholders.push(key);
			return "$("+(placeholders.length-1)+")"
		}
		/**
		 * Converts static values to strings
		 * Dynamic values will be added as placeholders to be replaced later
		 * 
		 * @param {*} key The value to convert to a string
		 * @returns The string value or placeholder value
		 */
		function convert(key){
			if(key==null){
				// Display null and undefined as a blank string
				return "";
			}
			let type=typeof key;
			if((type=="object"||type=="function")){
				if(isBinding(key)){
					// If this is an binding function with no bindings then see if it should inherit the bindings
					if(key.inheritBindings){
						return placehold(key(...bindings));
					}else{
						return placehold(key());
					}
				}
				return placehold(key);
			}
			return key;
		}
		// Create the static HTML for this template populating all static values
		let htmlText=strings[0]+keys.map((k,i)=>convert(k)+strings[i+1]).join("");

		/* STEP 2: Create a capsule that can be updated dynamically with the populate function */

		// Create an empty capsule
		let capsule=newCapsule();

		/**
		 * Populates the capsule with the dynamic values
		 * 
		 * @returns The capsule
		 */
		function populate(){
			/**
			 * Recursively finds all placeholder comments inside an element
			 * A placeholder comment is an comment containing text in the format of $[number]
			 * 
			 * @param {HTMLElement} elm The element to search
			 * @param {Record<string,HTMLElement>} comments A dictionary to add any found comments to
			 * @returns The dictionary of found comments
			 */
			function getPlaceholderComments(elm,comments){
				// If the comments dictionary was not provided then create a new one
				comments=comments??{};

				// Search all children
				elm.childNodes.forEach(n=>{
					if(n.nodeType==8){
						// If the child is a comment then check that the text is in the correct format $[number]
						let found=/\$\[([0-9]+)\]/.exec(n.data);
						if(found!=null){
							// If it is in the correct format then add it to the dictionary 
							comments[found[1]]=n;
						}
					}else{
						// If the child is not a comment then search it for comments
						getPlaceholderComments(n,comments);
					}
				});
				return comments;
			}

			// Before doing anything keep track of the focused element before the DOM updates
			saveFocus();

			// Create a copy of the html text to update with the new values
			let replacedHtmlText=htmlText;
			// Evaluate all the placeholder values
			let placeholdersResults=placeholders.map(evaluate);

			/* STEP 2-A: Populate all dynamic string values and create placholder comments for all elements */

			// Replace all placeholders with either the dynamic value or a placeholder comment
			placeholdersResults.forEach((p,i)=>{
				if(isElm(p)){
					// If the placeholder value is an element then create a placeholder comment to mark its location
					replacedHtmlText=replacedHtmlText.replace("$("+i+")","<!--$["+i+"]-->");
				}else if(isAttr(p)){
					// If the placeholder value is an attribute then keep the placeholder for now but wrap it in quotes so it can be set as the attribute
					// Add an "attribute-#" to be able to search for the element later
					replacedHtmlText=replacedHtmlText.replace(`$(${i})`,`"$(${i})" attribute-${i}="true" `);
				}else{
					// Otherwise use the placeholder value as a string and replace its placeholder in the HTML
					replacedHtmlText=replacedHtmlText.replace("$("+i+")",p);
				}
			});


			// Populate the capsule with the dynamic string values
			// If the capsule was already disolved then reset it by absorbing it
			capsule.absorb();
			// Set the innerHTML.
			// At this point anything that could be added to the DOM as a string has been added.
			// The remaining placeholders are elements, attributes or capsules that can't be added until after the HTML is populated.
			capsule.fill(replacedHtmlText);
			
			
			/* STEP 2-B: Populate elements */

			// Find all placeholder comments
			let placeholderComments=getPlaceholderComments(capsule);
			// Add all placeholder values that are elements
			placeholdersResults.forEach((p,i)=>{
				if(isElm(p)){
					// Replace the placeholder comment with the correct element
					replaceElm(placeholderComments[i+""],p);
				}else if(isAttr(p)){
					// If the placeholder value is an attribute then locate the attribute and replace it

					// Create variables to represent the placeholder values that need to be searched for
					let placeholderVal=`$(${i})`;
					let placeholderAttr=`attribute-${i}`;

					// Locate the element with the attribute
					let elm=getElm(`[${placeholderAttr}]`,capsule);
					
					// Find the correct attribute
					let attrList=[...elm.attributes];
					let matched=attrList.find((a)=>a.value==placeholderVal);

					// Attach the attribute
					p.attach(matched.name,elm);
					// Update the attribute
					p.update();

					// Remove the placeholder attribute
					elm.removeAttribute(placeholderAttr);
				}
			});
			
			/* STEP 2-C: Disolve and return the capsule */
			
			// Now that the capsule has been populated disolve it releasing all of its children
			// This will also disolve all nested capsules inside
			capsule.disolve();
			// Restore focus to the element that was focused before the DOM updated
			restoreFocus();
			// Return the capsule
			return capsule;
		}
		// Return the capsule as a reactive object that will update anytime one of the bindings changes
		// This is done by creating a reactive definition based on the populate function.
		return def(()=>populate(),...bindings);
	}
	// Indicate that the the function is a binding function.
	// This allows it to be detected and inherit bindings from its parent if it is used inside another html template
	markBinding(htmlFunc);
	return htmlFunc;
}

//#endregion


//#region Reactive Attributes
/*
	█▀█ █▀▀ ▄▀█ █▀▀ ▀█▀ █ █ █ █▀▀   ▄▀█ ▀█▀ ▀█▀ █▀█ █ █▄▄ █ █ ▀█▀ █▀▀ █▀
	█▀▄ ██▄ █▀█ █▄▄  █  █ ▀▄▀ ██▄   █▀█  █   █  █▀▄ █ █▄█ █▄█  █  ██▄ ▄█
*/

//TODO: garbage collection?

/**
 * A reactive HTML element attribute
 */
class Attribute{
	/**
	 * A basic constructor
	 * 
	 * @param {*} value The value of the attribute 
	 * @param {...any} bindings Bound variables to bind to, if any of these update the attribute will automatically update
	 */
	constructor(value,...bindings){
		this.element=null;
		this.attrName=null;
		this.value=value;
		this.isAttribute=true;

		link(()=>{this.update()},...bindings);
	}
	/**
	 * Attaches this attribute to a specific element so it can update automatically
	 * 
	 * @param {string} attrName The name of the attribute
	 * @param {HTMLElement} element The element this attribute is a part of 
	 */
	attach(attrName,element){
		this.attrName=attrName;
		this.element=element;
	}
	/**
	 * Updates this attribute on the element it is a part of
	 */
	update(){
		if(this.element==null){
			// If this attribute hasn't been attached yet then do nothing
			return;
		}

		let val=evaluate(this.value);
		if(isAction(val)){
			// For actions remove the html attribute and set the attribute directly to the lambda
			// We assume that the capitalisation on the attribute name is correct in the html
			this.element.removeAttribute(this.attrName);
			this.element[this.attrName]=val.getValue();
		}else{
			// Use a switch statement to normalize setting of html attributes.
			// I really wish this wasn't required but HTML attributes don't all follow the same rules, so we need to account for the differences in behaviour.
			// This will probably need to be expanded as new HTML attributes are encountered.
			switch(this.attrName){
				case "value":{
					this.element.setAttribute(this.attrName,val);
					// Must also set the attribute directly since the html value attribute only acts as an initial value
					this.element[this.attrName]=val;
					break;
				}
				default:
					this.element.setAttribute(this.attrName,val);
			}
		}
	}
}
/**
 * An action which should be tied to an event attribute (like onClick)
 */
class AttributeAction{
	/**
	 * A basic constructor
	 * 
	 * @param {function} value The event to fire
	 */
	constructor(value){
		this.value=value;
		this.isAction=true;
	}
	/**
	 * Gets the value of this action
	 * 
	 * @returns The value
	 */
	getValue(){
		return this.value;
	}
}
/**
 * Creates an action. Typically used for setting event attributes (like onClick)
 * 
 * @param {function} toRun The action to run 
 * @returns The attribute action
 */
function act(toRun){
	return new AttributeAction(toRun);
}
/**
 * Creates an attribute for an HTML element
 * 
 * @param {*} value The value of the attribute
 * @returns A function which will bind and return the attribute
 */
function attr(value){
	let bindFunc=(...bindings)=>new Attribute(value,...bindings);
	// Making this a binding function means that it can inherit bindings from the html`` it is inside of
	// Or at least it could, but when the html`` updates all attributes are forced to update as well
	// So to avoid redundancy updates this won't inherit the bindings from its parent
	// But I'm still marking this as a binding function since that's what it is
	markBinding(bindFunc,false);
	return bindFunc;
}

//#endregion


//#region nested css
/*
	█▄ █ █▀▀ █▀ ▀█▀ █▀▀ █▀▄   █▀▀ █▀ █▀
	█ ▀█ ██▄ ▄█  █  ██▄ █▄▀   █▄▄ ▄█ ▄█
*/

/**
 * Used to create CSS styles.
 * Supports scss-like nested styles, will automatically expand them.
 * I know what you are thinking, "why not make the CSS reactive too?" And no. I'm not doing that. CSS already scares me.
 * 
 * @param {string[]} strings The strings from the string template
 * @param {...any} keys The keys from the string template
 * @returns A function which when called will create a string containing the CSS styles 
 */
function scss(strings,...keys){ //TODO: make sure all css selectors work such as ","
	// Create a single string from what was given with all of the values converted to strings.
	let nestedStyles=strings[0]+keys.map((k,i)=>evaluate(k)+strings[i+1]).join("");
	// The top level selector to use
	return (topSelector="html")=>{
		/**
		 * Parses a string of nested CSS into a tree of objects
		 * 
		 * @param {char[]} arr The array of chars to parse 
		 * @returns A tree representing the nested CSS
		 */
		function parse(arr){
			// The styles for this node
			let styles="";
			// The current run of parsed chars since something interesting happened
			let run="";
			// The children for this node
			let children=[];

			// Continune parsing until the array runs out of new chars or a "}" is reached
			while(arr.length){
				// Get the next char
				let char=arr.shift();
				// If the char is "{" then parse it recursively
				if(char=="{"){
					// Get the child's selector based of the current run
					let selector=run.trim();
					// Rest the run
					run="";
					// Parse the child
					let child=parse(arr,children);
					if(selector.includes("@media")){
						// If the selector is a media query then store it for later
						// In this case the child has no selector so set it to "&"
						child.selector="&";
						child.mediaQuery=selector;
					}else{
						// Set the child's selector
						child.selector=selector;
					}
					// Add the child
					children.push(child);
				
				// If the char is "}" then stop parsing and exit 
				}else if(char=="}"){
					break;

				// If the char is ";" or newline then start a new run
				}else if(char==";"||char=="\n"){
					// Add the existing characters to the styles
					styles+=(run+char);
					// Reset the run
					run="";

				// Add any un-exciting characters to the run
				}else{
					run+=char;
				}
			}
			// Add any remaining text from the run to the styles
			styles+=run;
			// Return everything
			return {
				children,
				styles:styles.trim(),
				selector:""
			};
		}
		/**
		 * Flattens a tree of nested CSS objects into a list of valid CSS strings
		 * 
		 * @param {object} branch The tree branch to parse
		 * @param {string} selector The parent selector of this branch
		 * @param {string} mediaQuery The mediaQuery for this branch
		 * @returns The list of CSS strings for this branch
		 */
		function flatten(branch,selector="",mediaQuery=null){
			// Get the selector for this element
			selector=mergeSelectors(selector,branch.selector);

			if(branch.mediaQuery!=null){
				mediaQuery=branch.mediaQuery;
			}

			// Recursively flatten all children into an array of CSS strings
			let textArr=branch.children.flatMap(
				(c)=>flatten(c,selector,mediaQuery)
			);

			// Trim the styles
			let trimmedStyles=branch.styles.trim();
			// If there are any styles then add a CSS selector with them
			if(trimmedStyles!=""){
				if(mediaQuery!=null){
					textArr.unshift(mediaQuery+"{"+selector+"{"+branch.styles+"}}");
				}else{
					textArr.unshift(selector+"{"+branch.styles+"}");
				}
			}

			// Return the CSS text
			return textArr;
		}
		/**
		 * Merge two CSS selectors.
		 * Note that "&" is a special character to represent the parent selector directly.
		 * 
		 * @param {string} base The base selector the child is under
		 * @param {string} child The child selector
		 * @returns The merged selector
		 */
		function mergeSelectors(base,child){
			let trimmed=child.trim();
			if(trimmed.length>0&&trimmed[0]=="&"){
				return (base.trim()+trimmed.replace("&","")).trim();
			}else{
				return (base.trim()+" "+trimmed).trim();
			}
		}

		// Expand the nested styles into valid CSS styles
		let allChars=nestedStyles.split("");
		let tree=parse(allChars);
		
		// Set the top selector
		tree.selector=topSelector;
		// Flatten the nested css into valid flat css
		let allStyles=flatten(tree);
		// Create a css string from all the styles
		return allStyles.join("\n");
	}
}

/**
 * Adds a set of css styles to the document
 * 
 * @param {string} cssStyles The styles to add
 */
function createStyles(cssStyles){
	let styleSheet=document.createElement("style");
	styleSheet.textContent=cssStyles;
	document.head.appendChild(styleSheet);
	return styleSheet;
}


//#endregion


//#region custom elements
/*
	█▀▀ █ █ █▀ ▀█▀ █▀█ █▀▄▀█   █▀▀ █   █▀▀ █▀▄▀█ █▀▀ █▄ █ ▀█▀ █▀
	█▄▄ █▄█ ▄█  █  █▄█ █ ▀ █   ██▄ █▄▄ ██▄ █ ▀ █ ██▄ █ ▀█  █  ▄█
*/

/**
 * A generic custom element class to inherit off of
 * This holds common useful behaviour
 */
class CustomElm extends HTMLElement{
	/**
	 * A basic constructor
	 */
	constructor(){
		super();
		// A list of the attributes set on this element
		this.attributeList=[];
	}
	/**
	 * Sets the html content of this element
	 * 
	 * @param {*} htmlDef The html`` definition for this element
	 */
	define(htmlDef){
		// Get the capsule containing the html
		this.htmlDef=(typeof htmlDef=="function")?htmlDef():htmlDef;
		let capsule=this.htmlDef.data;
		// Place the capsule inside this element and then disolve it to populate the content of this element
		addElm(capsule,this);
		capsule.disolve();
	}
	/**
	 * Gets the css styleSheet for this element
	 * 
	 * @returns The styleSheet
	 */
	getStyleSheet(){
		return this.constructor.styleSheet;
	}
	/**
	 * Sets an attribute for this element
	 * 
	 * @param {string} attrName The name of the attribute
	 * @param {*} value The value of the attribute
	 * @returns A function which will bind the attribute and return this element
	 */
	attr(attrName,value){
		let bindFunc=(...bindings)=>{
			let toAdd=new Attribute(value,...bindings);
			this.attributeList.push(toAdd);
			toAdd.attach(attrName,this);
			toAdd.update();
			// Return the element so it can be added to the DOM
			return this;
		}
		// Making this a binding function means that it can inherit bindings from the html`` it is inside of
		// Unlike the other attr() function could actually be meaningful since the element won't get recreated when html updates
		markBinding(bindFunc,true);
		return bindFunc;
	}
}
/**
 * A function to define a custom element based on a class
 * 
 * @param {class} elmClass The class to define as a custom element
 * @param {function} cssFunc A function which will provide a string of css when called
 */
function defineElm(elmClass,cssStyles){
	let fullName=customElementName(elmClass);
	customElements.define(fullName, elmClass);
	// If there are css styles for this element then add them as nested styles
	if(cssStyles!=null){
		elmClass.styleSheet=createStyles(cssStyles(fullName));
	}
}
/**
 * Gets a custom element name for a class
 * 
 * @param {class} elmClass The class to make into a custom element name
 * @returns The custom element name
 */
function customElementName(elmClass){
	let nameSpace="cmx";
	return nameSpace+"-"+pascalToSlugCase(elmClass.name);
	
}

//#endregion


//#region persistence
/*
	█▀█ █▀▀ █▀█ █▀ █ █▀ ▀█▀ █▀▀ █▄ █ █▀▀ █▀▀
	█▀▀ ██▄ █▀▄ ▄█ █ ▄█  █  ██▄ █ ▀█ █▄▄ ██▄
*/

/**
 * The currently focused element
 */
let focusedElement=null;
/**
 * Gets and saves the currently focused element so it can be restored later
 */
function saveFocus(){
	focusedElement=document.activeElement;
}
/**
 * Restore focus to the saved focused element
 */
function restoreFocus(){
	if(focusedElement!=null){
		focusedElement.focus();
	}
}

//#endregion


//#region evaluation
/*
	█▀▀ █ █ ▄▀█ █   █ █ ▄▀█ ▀█▀ █ █▀█ █▄ █
	██▄ ▀▄▀ █▀█ █▄▄ █▄█ █▀█  █  █ █▄█ █ ▀█
*/

/**
 * Evaluates a dynamic value.
 * This will attempt to resolve the value to a string, attribute, element, or capsule that can be added to the html.
 * Values are evaluated recursively whenever is possible to do so.
 * 
 * @param {*} toEval The dynamic value to evaluate
 * @returns The value to add to the html
 */
 function evaluate(toEval){
	if(toEval==null){
		// Display null and undefined as a blank string
		return "";
	}
	let type=typeof toEval;
	if(type=="function"){
		if(isClass(toEval)){
			// If it is a class then assume it is a custom element and get its custom element name
			return customElementName(toEval);
		}
		// If it is a function then run it and evaluate the result
		return evaluate(toEval());
	}
	if(type=="object"){
		if(isColor(toEval)){
			return toEval.toString();
		}else if(isIterable(toEval)){
			// Note: lists should not contain attributes.
			// Each attribute can only be set to a single place, a list of them doesn't make sense

			// If it is iterable then turn it into an array
			let array=[...toEval];
			// Evaluate each item in the array
			array=array.map(evaluate);

			if(array.some(n=>isElm(n))){
				// If any item in the array is an element then return a capsule with all the values as child elements
				// This has to be done since if one of the items is an element it can't be turned into a string
				let childCapsule=newCapsule();
				array.forEach(n=>{
					if(isElm(n)){
						addElm(n,childCapsule);
					}else{
						// If the item isn't an element then take its value and turn it into a text node
						// This way it can be added to the capsule like any other element
						addElm(newText(n+""),childCapsule);
					}
				});
				return childCapsule;
			}else{
				// If all items in the array can be expressed as strings then join them together into a single string and return it.
				return array.join("");
			}
		}else if(toEval.isBound){
			// If the value is bound then get its data and evaluate it.
			// If the bound value is an object then .data will return undefined.
			// This is acceptable since how objects should be displayed is ambiguous, only bound primitives should used.
			// Technically we could check for undefined here and display it as json if it is an object.
			return evaluate(toEval.data);
		}
	}
	// If the value is something else then just return it
	return toEval;
}

//#endregion


//#region animation
/*
	▄▀█ █▄ █ █ █▀▄▀█ ▄▀█ ▀█▀ █ █▀█ █▄ █
	█▀█ █ ▀█ █ █ ▀ █ █▀█  █  █ █▄█ █ ▀█
*/

/**
 * An animation effect
 */
class GenericAnimation{
	/**
	 * A function that runs for each frame of an animation.
	 * Time is managed as a value between 0 and 1, calculated by scaling the time by the animation duration.
	 * It will run a single time when the animation first starts (at time=0).
	 * It will run a single time when the animation ends (at time=1).
	 * If the animation is infinite then the time will continue infinitely past 1 but will still be scaled by the animation duration.
	 * 
 	 * @callback animationFunc
	 * @param {number} time The current animation time (between 0 and 1)
	 * @param {number} timeDiff The time difference since the animation previously run (between 0 and 1)
	 */
	
	/**
	 * A basic constructor
	 * 
	 * @param {animationFunc} func The function to run each time the animation should update.
	 * @param {number} duration The number of seconds the animation should run for
	 * @param {boolean} isInfinite If the animation is infinite, if false the animation will stop after its duration
	 */
	constructor(func,duration=1,isInfinite=false){
		this.duration=duration*1000;
		this.isInfinite=isInfinite;
		this.func=func;
		this.animationSub=()=>{
			this.run();
		};
		this.elapsed=0;
		this.time=0;
	}
	/**
	 * Run the animation
	 * 
	 * @returns This animation object 
	 */
	run(){
		// Get time
		let currTime=getTime();
		let timeDiff=(currTime-this.time)/this.duration;
		let elapsedNext=this.elapsed+timeDiff;

		// Check if the animation should end
		if(!this.isInfinite&&elapsedNext>=1){
			// Set the time to 1 so the animation function will trigger once with a time of 1 before ending
			elapsedNext=1;
			timeDiff=1-this.elapsed;
			// Stop the animation from continuing
			this.stop();
		}

		// Update time variables
		this.elapsed=elapsedNext;
		this.time=currTime;

		// Run the animation function
		this.func(this.elapsed,timeDiff);

		return this;
	}
	/**
	 * Starts playing the animation from the beginning
	 * 
	 * @returns This animation object
	 */
	start(){
		// Reset the animation elapsed time to 0
		this.elapsed=0;
		// Cause the animation to start playing
		this.resume();

		return this;
	}
	/**
	 * Resumes playing the animation
	 * 
	 * @returns This animation object
	 */
	resume(){
		// Update the time with the current time
		this.time=getTime();
		// Subscribe to the animationUpdateNum so that the animationSub will be triggered each frame 
		animationUpdateNum.sub(this.animationSub);
		// Run once from the current point in the animation
		this.run();

		return this;
	}
	/**
	 * Stops the animation from playing
	 * 
	 * @returns This animation object
	 */
	stop(){
		// Unsubscribe from animationUpdateNum so that the animationSub will no longer be triggered each frame
		animationUpdateNum.unSub(this.animationSub);

		return this;
	}
}
/**
 * Creates and returns a GenericAnimation object
 * 
 * @param {function} func The function to run each time the animation should update
 * @param {number} duration The number of seconds the animation should run for
 * @param {boolean} isInfinite If the animation is infinite, if false the animation will stop after its duration
 * @returns The animation object
 */
function animate(func,duration=1,isInfinite=false){
	return new GenericAnimation(func,duration,isInfinite);
}

/**
 * The current animation frame number, will update each time requestAnimationFrame runs.
 * This is used to trigger animation related subscriptions each animation frame. 
 */
let animationUpdateNum=bind(0);
/**
 * A function which triggers each animation frame
 */
function animationLoop(){
	// Increment the animation number
	animationUpdateNum.data++;
	// Request the next animation frame
	requestAnimationFrame(animationLoop);
}
// Start the animation loop
animationLoop();

//#endregion


//#region utility
/*
	█ █ ▀█▀ █ █   █ ▀█▀ █▄█
	█▄█  █  █ █▄▄ █  █   █ 
*/

/**
 * HTML encodes a string
 * 
 * @param {string} text The string to encode
 * @returns The encoded string
 */
function safe(text){
	return encodeHTML(text);
}

/**
 * HTML encodes a string
 * 
 * @param {string} rawStr The string to encode
 * @returns The encoded string
 */
function encodeHTML(rawStr){
	return rawStr.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
		return '&#'+i.charCodeAt(0)+';';
	});
}

/**
 * Creates a new Capsule.
 * 
 * @returns The new capsule
 */
function newCapsule(){
	return new Capsule();
}
/**
 * Creates a new element
 * 
 * @param {string} tag The element tag
 * @param {string} classes Any classes that should be added to the element 
 * @returns The new element
 */
function newElm(tag,classes){
	let elm=document.createElement(tag);
	if(classes){
		let classSplit=classes.split(" ");
		for(let i=0;i<classSplit.length;i++){
			elm.classList.add(classSplit[i]);
		}
	}
	return elm;
}
/**
 * Creates a new text node
 * 
 * @param {string} text The text
 * @returns The text node
 */
function newText(text=""){
	return document.createTextNode(text);
}
/**
 * Creates a new comment node
 * 
 * @param {string} text The comment
 * @returns The comment node
 */
function newComment(text=""){
	return document.createComment(text);
}
/**
 * Adds an element or list of elements to another element
 * 
 * @param {HTMLElement|HTMLElement[]} toAdd The element or list of elements to add
 * @param {HTMLElement} target The element to add it to 
 * @returns The target element that had the element(s) added to it
 */
function addElm(toAdd,target){
	if(isIterable(toAdd)){
		// Make sure it is an array so items don't disappear as we add them
		let addList=[...toAdd];
		addList.forEach(n=>addElm(n,target));
	}else{
		target.appendChild(toAdd);
	}
	return target;
}
/**
 * Removes an element
 * 
 * @param {HTMLElement} target The element to remove
 * @returns The element that was removed
 */
function removeElm(target){
	target.remove();
	return target;
}
/**
 * Adds an element at a specific index to another element
 * 
 * @param {HTMLElement} toAdd The element to add
 * @param {number} index The index to add the element at
 * @param {HTMLElement} target The element to add it to
 */
function addElmAt(toAdd,index,target){
	if(index>=target.childNodes.length){
		target.appendChild(toAdd);
	}else{
		target.insertBefore(toAdd,target.childNodes[index])
	}
}
/**
 * Gets the index of an element in its parent
 * 
 * @param {HTMLElement} target The element to get the index of
 * @returns The index of the element
 */
function getElmIdx(target){
	return [...target.parentNode.childNodes].indexOf(target);
}
/**
 * Replaces an element with another element or list of elements
 * 
 * @param {HTMLElement} target The element to replace
 * @param {HTMLElement|HTMLElement[]} replaceWith The element or list of elements to replace it with
 * @param {boolean} keep If the element being replaced should be kept, if false it will be removed
 */
function replaceElm(target,replaceWith,keep=false){
	if(target.parentNode==null){
		// If there is no parent then there is no location to replace from
		return;
	}
	if(isIterable(replaceWith)){
		// Make sure it is an array so items don't disappear as we add them
		let addList=[...replaceWith];
		// If a list of replacement objects was given then run replaceElm on each of them
		// Make sure to keep the element around so the next item can find it too
		addList.forEach(n=>replaceElm(target,n,true));
	}else{
		// Of a single element was given to replace with then just insert it
		target.parentNode.insertBefore(replaceWith,target);
	}
	if(!keep){
		// If the object being replaced shouldn't be kept then remove it
		target.remove();
	}
}
/**
 * Adds a class or list of classes to an element
 * 
 * @param {string} classes A string representing the classes to add, separate multiple classes with a space
 * @param {HTMLElement} elm The element to add the class to
 * @returns The element that was changed
 */
function addClass(classes,elm){
	let classSplit=classes.split(" ");
	for(let i=0;i<classSplit.length;i++){
		elm.classList.add(classSplit[i]);
	}
	return elm;
}
/**
 * Removes a class or list of classes from an element
 * 
 * @param {string} classes A string representing the classes to remove, separate multiple classes with a space
 * @param {HTMLElement} elm The element to remove the class from
 * @returns The element that was changed
 */
function removeClass(classes,elm){
	let classSplit=classes.split(" ");
	for(let i=0;i<classSplit.length;i++){
		elm.classList.remove(classSplit[i]);
	}
	return elm;
}
/**
 * Finds an element
 * 
 * @param {string} selector The query selector
 * @param {HTMLElement} target The element to query or null for the entire document
 * @returns The element matching the query
 */
function getElm(selector,target){
	if(target!=null){
		return target.querySelector(selector);
	}
	return document.querySelector(selector);
}
/**
 * Finds a list of zero or more elements
 * 
 * @param {string} selector The query selector
 * @param {HTMLElement} target The element to query or null for the entire document
 * @returns The list of elements matching the query
 */
function getElms(selector,target){
	if(target!=null){
		return target.querySelectorAll(selector);
	}
	return document.querySelectorAll(selector);
}
/**
 * Removes all child elements from an element
 * 
 * @param {HTMLElement} target The element to clear
 * @returns The element that was cleared
 */
function clearElm(target){
	while(target.firstChild) {
		target.removeChild(target.lastChild);
	}
	return target;
}
/**
 * Converts PascalCase text to slug-case
 * 
 * @param {string} text The text to convert
 * @returns The text as slug case
 */
function pascalToSlugCase(text){
	return text.replace(/(.)([A-Z])/g, "$1-$2").toLowerCase()
}
/**
 * Marks a function as a binding function
 * That is, a function that expects be called with a set of bound variables for it to bind to
 *
 * @param {function} func The binding function
 * @param {boolean} inheritBindings If the binding function should be allowed to inherit bindings from its parent
 */
 function markBinding(func,inheritBindings=true){
	func.isBindingFunction=true;
	func.inheritBindings=inheritBindings;
}

/**
 * Get the current time
 * 
 * @returns The time in milliseconds
 */
function getTime(){
	return (new Date()).getTime();
}

//#region type checks

/**
 * Checks if a value is a binding function
 * That is, a function that expects be called with a set of bound variables for it to bind to
 * 
 * @param {*} toTest The value to test
 * @returns If the value is a binding function
 */
function isBinding(toTest){
	return !!toTest.isBindingFunction;
}
/**
 * Checks if a value is iterable
 * 
 * @param {*} toTest The value to test
 * @returns If the value is an iterable object
 */
function isIterable(toTest){
	if (toTest==null||typeof toTest!="object") {
		return false;
	}
	return typeof toTest[Symbol.iterator]=='function';
}
/**
 * Check if a value is a class
 * 
 * @param {*} toTest The value to test
 * @returns If the value is a class
 */
function isClass(toTest) {
	return typeof toTest=="function"&&/^\s*class\s+/.test(toTest.toString());
}
/**
 * Check if a value is bound
 * 
 * @param {*} toTest The value to test
 * @returns If the value is a bound
 */
 function isBound(toTest){
	return toTest.isBound;
}
/**
 * Check if a value is an attribute
 * 
 * @param {*} toTest The value to test
 * @returns If the value is a an attribute
 */
function isAttr(toTest){
	return toTest.isAttribute;
}
/**
 * Check if a value is an action
 * 
 * @param {*} toTest The value to test
 * @returns If the value is a an action
 */
function isAction(toTest){
	return toTest.isAction;
}
/**
 * Checks if a value is an html element
 * 
 * @param {*} toTest The value to check 
 * @returns If the value is an element
 */
 function isElm(toTest){
	return toTest instanceof Element
}
/**
 * Checks if an element is a capsule
 * 
 * @param {*} toTest The element to check
 * @returns If the element is a capsule
 */
function isCapsule(toTest){
	return toTest.isCapsule;
}
/**
 * Checks if an element is a marker for a capsule
 * 
 * @param {*} toTest The element to check
 * @returns If the element is a marker
 */
function isMarker(toTest){
	return toTest.isMarker;
}
/**
 * Checks if an object is a color
 * 
 * @param {*} toTest The object to check
 * @returns If the object is a color
 */
function isColor(toTest){
	return toTest instanceof Color;
}

//#endregion

//#endregion