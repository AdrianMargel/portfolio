const bindType={
	ALL: "ALL",
	SET: "SET",
	ADD: "ADD",
	REMOVE: "REMOVE",
	CHANGE: "CHANGE",
	ERROR: "ERROR",
};

class Subscription{
	constructor(type,callback){
		this.enabled=true;
		this.type=type;
		this.callback=callback;
	}
}

//TODO: use recursive update ids to allow recursive chains of updates to be created
//ex: rather than using updateId=1, use updateId=[1,2,1] to indicate different levels up updates
//allow pushUpdate and popUpdate plus newUpdate to allow creation of new update chains

//TODO: use weakmaps to allow garbage collection
//this will bind to objects or arrays
//also create a list of perminant subs and allow the option of creating a sub as perminant
function bind(data,recurse){
	if(typeof data==="function"){
		//do not try to wrap functions
		return data;
	}else if(typeof data!=="object" || data==null){
		//wrap the data inside an object
		data={
			data:data
		};
		return bindGeneral(data,true);
	}else if(Array.isArray(data)){
		if(!data.isBound){
			if(recurse){
				for(let x in data){
					data[x]=bind(data[x],recurse);
				}
			}
			return bindArray(data);
		}else{
			return data;
		}
	}else{
		if(!data.isBound){
			if(recurse){
				for(let x in data){
					data[x]=bind(data[x],recurse);
				}
			}
			return bindGeneral(data,false);
		}else{
			return data;
		}
	}
}
//binding for general objects with no special handling
function bindGeneral(data,isWrapped){
	let handler = {
		updateId: getUpdateId(),
		isBound: true,
		subscriptions: [],
		bound: data,
		set: function (target,prop,val) {
			let boundVal=val;
			if(prop!="data"){
				let boundVal=bind(val,true);
			}
			target[prop]=boundVal;
			this.update(bindType.SET,{prop:prop,val:val,bound:boundVal});
			return true;
		},
		get: function(target, prop, receiver) {
			if(prop==="isBound"){
				return this.isBound;
			}else{
				let value = Reflect.get(...arguments);
				return value;
			}
		},
		/*get: function(target, prop, receiver) {
			let value = Reflect.get(...arguments);
			if(typeof value=="object"
				&& value!=null
				&& value.data!==undefined){
				return value.data;
			}else{
				return value;
			}
		},*/

		sub: function(type,sub){
			this.subscriptions.push(new Subscription(type,sub));
		},
		unSub: function(type,sub){
			if(type==bindType.ALL){
				this.unSubAll(sub);
			}else{
				for(let i=0;i<this.subscriptions.length;i++){
					if(this.subscriptions[i].callback==sub && this.subscriptions[i].type==type){
						this.subscriptions.splice(i,1);
					}
				}
			}
		},
		unSubAll: function(sub){
			for(let i=0;i<this.subscriptions.length;i++){
				if(this.subscriptions[i].callback==sub){
					this.subscriptions.splice(i,1);
				}
			}
		},
		toggleSub: function(type,sub,toggle){
			if(type==bindType.ALL){
				this.toggleSubAll(sub);
			}else{
				let targets=this.getSub(type,sub);
				if(target!=null){
					target.enabled=toggle;
				}
			}
		},
		toggleSubAll: function(sub,toggle){
			let targets=this.getSubFull(sub);
			if(target!=null){
				target.enabled=toggle;
			}
		},
		getSub: function(type,sub){
			if(type==bindType.ALL){
				return this.getSubAll(sub);
			}else{
				let matches=[];
				for(let i=0;i<this.subscriptions.length;i++){
					if(this.subscriptions[i].callback==sub && this.subscriptions[i].type==type){
						matches.push(this.subscriptions[i]);
					}
				}
				return matches;
			}
		},
		getSubAll: function(sub){
			for(let i=0;i<this.subscriptions.length;i++){
				if(this.subscriptions[i].callback==sub){
					matches.push(this.subscriptions[i]);
				}
			}
			return matches;
		},
		update: function(type,info){
			if(canUpdate(this.updateId)){
				this.updateId=getUpdateId();

				if(type==bindType.ALL){
					this.updateAll(info);
				}else{
					console.log("updated "+type+" with:",info);
					for(let i=0;i<this.subscriptions.length;i++){
						if((this.subscriptions[i].type==type||this.subscriptions[i].type==bindType.ALL)&&this.subscriptions[i].enabled){
							this.subscriptions[i].callback(info,type,this);
						}
					}
				}
			}
		},
		updateAll: function(type,info){
			for(let i=0;i<this.subscriptions.length;i++){
				if(this.subscriptions[i].enabled){
					this.subscriptions[i].callback(info,type,this);
				}
			}
		}
	}

	data.sub=(type,sub)=>{handler.sub(type,sub)};
	data.unSub=(type,sub)=>{handler.unSub(type,sub)};
	data.toggleSub=(type,sub,toggle)=>{handler.toggleSub(type,sub,toggle)};
	//getting the update id can help avoid bounce-back when creating subscriptions
	data.getUpdateId=()=>{return handler.updateId};
	//allow manual updating of wrapped primitives
	if(isWrapped){
		data.update=()=>{handler.update(bindType.SET,{prop:"data",val:data.data})};
	}

	return new Proxy(data, handler);
}
//binding for arrays
function bindArray(data){
	let handler = {
		updateId: getUpdateId(),
		isBound: true,
		subscriptions: [],
		arrLength: data.length,
		surpressUpdates: false,
		bound: data,
		set: function (target,prop,val) {
			if(prop=="length"){
				if(!this.surpressUpdates){
					this.update(bindType.CHANGE,{lengthChange:val-this.arrLength});
				}
				this.arrLength=val;
			}else{
				let boundVal=val;
				if(prop!="data"){
					let boundVal=bind(val,true);
				}
				target[prop]=boundVal;
				if(!this.surpressUpdates){
					this.update(bindType.SET,{prop:prop,val:val,bound:boundVal});
				}
			}
			return true;
		},
		get: function(target, prop, receiver) {
			if(prop==="isBound"){
				return this.isBound;
			}else{
				let value = Reflect.get(...arguments);
				return value;
			}
		},
		/*get: function(target, prop, receiver) {
			let value = Reflect.get(...arguments);
			if(typeof value=="object"
				&& value!=null
				&& value.data!==undefined){
				return value.data;
			}else{
				return value;
			}
		},*/

		add: function(toAdd,index){
			let boundVal=bind(toAdd,true);
			this.surpressUpdates=true;
			if(index != null){
				this.bound.splice(index,0,boundVal);
				this.update(bindType.ADD,{index:index,val:toAdd,bound:boundVal});

			}else{
				this.bound.push(boundVal);
				this.update(bindType.ADD,{index:this.bound.length-1,val:toAdd,bound:boundVal});
			}
			this.surpressUpdates=false;
		},
		remove: function(index){
			this.surpressUpdates=true;
			let removed=this.bound[index];
			this.bound.splice(index,1);
			this.update(bindType.REMOVE,{index:index,removed:removed});
			this.surpressUpdates=false;
		},
		removeItem: function(item){
			let index=this.bound.indexOf(item);
			if(index!==-1){
				this.remove(index);
			}
		},



		sub: function(type,sub){
			this.subscriptions.push(new Subscription(type,sub));
		},
		unSub: function(type,sub){
			if(type==bindType.ALL){
				this.unSubAll(sub);
			}else{
				for(let i=0;i<this.subscriptions.length;i++){
					if(this.subscriptions[i].callback==sub && this.subscriptions[i].type==type){
						this.subscriptions.splice(i,1);
					}
				}
			}
		},
		unSubAll: function(sub){
			for(let i=0;i<this.subscriptions.length;i++){
				if(this.subscriptions[i].callback==sub){
					this.subscriptions.splice(i,1);
				}
			}
		},
		toggleSub: function(type,sub,toggle){
			if(type==bindType.ALL){
				this.toggleSubAll(sub);
			}else{
				let targets=this.getSub(type,sub);
				if(target!=null){
					target.enabled=toggle;
				}
			}
		},
		toggleSubAll: function(sub,toggle){
			let targets=this.getSubFull(sub);
			if(target!=null){
				target.enabled=toggle;
			}
		},
		getSub: function(type,sub){
			if(type==bindType.ALL){
				return this.getSubAll(sub);
			}else{
				let matches=[];
				for(let i=0;i<this.subscriptions.length;i++){
					if(this.subscriptions[i].callback==sub && this.subscriptions[i].type==type){
						matches.push(this.subscriptions[i]);
					}
				}
				return matches;
			}
		},
		getSubAll: function(sub){
			for(let i=0;i<this.subscriptions.length;i++){
				if(this.subscriptions[i].callback==sub){
					matches.push(this.subscriptions[i]);
				}
			}
			return matches;
		},
		update: function(type,info){
			if(canUpdate(this.updateId)){
				this.updateId=getUpdateId();

				if(type==bindType.ALL){
					this.updateAll(info);
				}else{
					console.log("updated "+type+" with:",info);
					for(let i=0;i<this.subscriptions.length;i++){
						if((this.subscriptions[i].type==type||this.subscriptions[i].type==bindType.ALL)&&this.subscriptions[i].enabled){
							this.subscriptions[i].callback(info,type,this);
						}
					}
				}
			}
		},
		updateAll: function(type,info){
			for(let i=0;i<this.subscriptions.length;i++){
				if(this.subscriptions[i].enabled){
					this.subscriptions[i].callback(info,type,this);
				}
			}
		}
	}

	data.sub=(type,sub)=>{handler.sub(type,sub)};
	data.unSub=(type,sub)=>{handler.unSub(type,sub)};
	data.toggleSub=(type,sub,toggle)=>{handler.toggleSub(type,sub,toggle)};
	data.add=(toAdd,index)=>{handler.add(toAdd,index)};
	data.remove=(index)=>{handler.remove(index)};
	data.removeItem=(index)=>{handler.removeItem(index)};
	//getting the update id can help avoid bounce-back when creating subscriptions
	data.getUpdateId=()=>{return handler.updateId};

	return new Proxy(data, handler);
}

var currentUpdateId=[0];
var currentUpdateLevel=0;
function getUpdateId(){
	let clone=[];
	for(let i=0;i<currentUpdateId.length;i++){
		clone.push(currentUpdateId[i]);
	}
	return clone;
}
function canUpdate(currId){
	for(let i=0;i<=currentUpdateLevel;i++){
		let toCompare;
		if(i<currId.length){
			toCompare=currId[i];
		}else{
			//if the current id is not defined to this depth assume it is the default of 0
			currId=0;
		}
		if(currId[i]>currentUpdateId[i]){
			return false;
		}else if(currId[i]<currentUpdateId[i]){
			return true;
		}
	}
	return false;
}
//called before a new update, usually trigged through user input
//this makes sure cyclic relationships do not end up in infinite loops
function newUpdate(){
	currentUpdateId[currentUpdateLevel]++;
	for(let i=currentUpdateId.length-1;i>currentUpdateLevel;i--){
		currentUpdateId.splice(i,1);
	}
}
function pushUpdate(){
	currentUpdateLevel++;
	if(currentUpdateId.length<=currentUpdateLevel){
		currentUpdateId.push(0);
	}
}
function popUpdate(){
	currentUpdateLevel--;
}

//sets up subscriptions to make sure that only one item in the list is selected at a time
//makes sure the index reflects the selected item
function setupPaging(boundList,boundIndex){
	for(let i=0;i<boundList.length;i++){
		let item=boundList[i];
		addIndexSub(item);
		addItemSub(item);
	}

	boundList.sub(bindType.ADD,(info)=>{
		let idx=info.index;
		let item=info.bound;
		addIndexSub(item);
		addItemSub(item);
	});

	boundList.sub(bindType.REMOVE,(info)=>{
		let item=info.removed;
		let unsubList=item.pagingSubs;
		pushUpdate();
		for(let i=unsubList.length-1;i>=0;i--){
			newUpdate();
			boundIndex.unSub(unsubList[i]);
			item.selected.unSub(unsubList[i]);
			unsubList.remove(i);
		}
		popUpdate();
	});

	function addIndexSub(item){
		//update the index when an item changes
		let toSub=()=>{
			if(item.selected.data){
				let idx=boundList.indexOf(item);
				boundIndex.data=idx;
			}
		};
		item.selected.sub(bindType.SET,toSub);
		item.pagingSubs=item.pagingSubs||bind([]);
		item.pagingSubs.add(toSub);
	}
	function addItemSub(item){
		//update an item when the index changes
		let toSub=()=>{
			let idx=boundList.indexOf(item);
			item.selected.data=boundIndex.data===idx;
		};
		boundIndex.sub(bindType.SET,toSub);
		item.pagingSubs=item.pagingSubs||bind([]);
		item.pagingSubs.add(toSub);
	}
}


//created an element
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
function appElm(toAdd,target){
	target.appendChild(toAdd);
}
function appElmAt(toAdd,index,target){
	if(index>=target.children.length){
		target.appendChild(toAdd);
	}else{
		target.insertBefore(toAdd,target.children[index])
	}
}
function addClass(classes,elm){
	let classSplit=classes.split(" ");
	for(let i=0;i<classSplit.length;i++){
		elm.classList.add(classSplit[i]);
	}
}
function getElm(selector,target){
	if(target!=null){
		return target.querySelector(selector);
	}
	return document.querySelector(selector);
}
function getElms(selector,target){
	if(target!=null){
		return target.querySelectorAll(selector);
	}
	return document.querySelectorAll(selector);
}
function clearElm(target){
	while(target.firstChild) {
		target.removeChild(target.lastChild);
	}
}
