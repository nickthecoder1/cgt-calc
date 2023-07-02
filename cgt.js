

// keep track of games by indices in the following list

games = []

silent = true;

cached_function_count = 0
the_cache = {}
function cache(f, ordered=true){
	the_cache[cached_function_count] = {};
	cached_function_count += 1;
	var function_cache = the_cache[cached_function_count-1];
	return function(){
		var x = arguments[0];
		var y = arguments[1];
		if ((isNaN(x) && !x.index) || (y && isNaN(y) && !y.index)) return f(x,y);
		var xIndex = x;
		var yIndex = y;
		var f_cache = function_cache;
		if (isNaN(x)) xIndex = x.index;
		if (arguments.length == 2){
			if (isNaN(y)) yIndex = y.index;
			if (!ordered && xIndex < yIndex) [x,y,xIndex,yIndex] = [y,x,yIndex,xIndex];
			if (!function_cache[yIndex]) function_cache[yIndex] = {};
			f_cache = function_cache[yIndex];
		} else if (arguments.length > 2) {
			throw new Error('Can\'t call cached functions using more than 2 arguments!');
		}
		if (f_cache[xIndex]) return f_cache[xIndex];
		f_cache[xIndex] = f(x,y);
		return f_cache[xIndex];
	}
}

function le(g, h) {
	for(var i = 0; i < g.left.length; i++) {
		if(le(h,g.left[i]))
			return false;
	}
	for(var i = 0; i < h.right.length; i++) {
		if(le(h.right[i],g))
			return false;
	}
	return true;
} le = cache(le);

function eq(g, h) {
	return le(g,h) && le(h,g);
}

function isCFW(g,h){ //is confused with
	return (!(le(g,h) || le(h,g)));
}

function min(g_list){
	if (g_list.length == 0) throw new Error('min takes in a list of length greater than 0!');
	var retVal = g_list[0];
	for (var i=1; i<g_list.length; i++){
		if (le(g_list[i],retVal)) retVal = g_list[i];
	}
	return retVal;
}
function max(g_list){
	if (g_list.length == 0) throw new Error('max takes in a list of length greater than 0!');
	var retVal = g_list[0];
	for (var i=1; i<g_list.length; i++){
		if (le(retVal,g_list[i])) retVal = g_list[i];
	}
	return retVal;
}

function get_game_index(left_indices, right_indices) {
	var ell = [];
	var arr = [];
	for(var i = 0; i < left_indices.length; i++) {
		ell.push(games[left_indices[i]]);
	}
	for(var i = 0; i < right_indices.length; i++) {
		arr.push(games[right_indices[i]]);
	}
	var g = {left: ell, right: arr};
	for(var i = 0; i < games.length; i++) {
		if(eq(g,games[i])) {
			//console.log('duplicate game' + i);
			//console.log(g);
			return i;
		}
	}
	games.push(g);
	g.index = games.length - 1;
	//console.log(g.index + ", " + games[g.index].index);
	// canonicalize,
	// sigh, this is always a pain
	while(remove_reversibles(g)); // [sic]
	remove_dominated_options(g);
	return g.index;
}

function remove_dominated_options(g){
	var retained = [];
	for(var i = 0; i < g.left.length; i++)
		retained[i] = true;
	for(var i = 0; i < g.left.length; i++) {
		for(var j = 0; j < g.left.length && retained[i]; j++) {
			if(j == i || !retained[j])
				continue;
			if(le(g.left[i],g.left[j])) {
				// ith option is dominated, so don't retain it
				retained[i] = false;
			}
		}
	}
	var newleft = []
	for(var i = 0; i < g.left.length; i++) {
		if(retained[i]) {
			newleft.push(g.left[i]);
		}
	}
	g.left = newleft;

	retained = [];
	for(var i = 0; i < g.right.length; i++)
		retained[i] = true;
	for(var i = 0; i < g.right.length; i++) {
		for(var j = 0; j < g.right.length && retained[j]; j++) {
			if(j == i || !retained[j])
				continue;
			if(le(g.right[j],g.right[i])) {
				retained[i] = false;
			}
		}
	}
	var newright = []
	for(var i = 0; i < g.right.length; i++) {
		if(retained[i]) {
			newright.push(g.right[i]);
		}
	}
	g.right = newright;
}

function remove_reversibles(g) {
	for(var i = 0; i < g.left.length; i++) {
		gl = g.left[i];
		for(var j = 0; j < gl.right.length; j++) {
			glr = gl.right[j];
			if(le(glr,g)) {
				// TODO: do anything with lists in javascript
				for(var k = i+1; k < g.left.length; k++) {
					g.left[k-1] = g.left[k];
				}
				g.left.pop()
				for(var k = 0; k < glr.left.length; k++) {
					g.left.push(glr.left[k]);
				}
				return true;
			}
		}
	}
	for(var i = 0; i < g.right.length; i++) {
		gr = g.right[i];
		for(var j = 0; j < gr.left.length; j++) {
			grl = gr.left[j];
			if(le(g,grl)) {
				for(var k = i+1; k < g.right.length; k++) {
					g.right[k-1] = g.right[k];
				}
				g.right.pop()
				for(var k = 0; k < grl.right.length; k++) {
					g.right.push(grl.right[k]);
				}
				return true;
			}
		}
	}
	return false;
}


function isANumber(g){
	for(var i = 0; i < g.left.length; i++) {
		if (!(isANumber(g.left[i]))) return false;
		for(var j = 0; j < g.right.length; j++) {
			if (le(g.right[j], g.left[i]) || isCFW(g.right[j], g.left[i])) return false;
		}
	}
	for(var j = 0; j < g.right.length; j++)
		if (!(isANumber(g.right[j]))) return false;
	return true;
} isANumber = cache(isANumber);


function isPositiveInteger(g){
	if (g.right.length > 0) return false;
	if (g.left.length != 1) return false;
	if (g.left[0].left.length == 0 && g.left[0].right.length == 0) return true;
	return isPositiveInteger(g.left[0]);
} isPositiveInteger = cache(isPositiveInteger);


function innerbounds(g){
	if (isANumber(g)) return [g,g];
	var leftbounds = []
	for (var i = 0; i < g.left.length; i++)
		leftbounds.push(innerbounds(g.left[i])[1])
	var rightbounds = []
	for (var i = 0; i < g.right.length; i++)
		rightbounds.push(innerbounds(g.right[i])[0])
	return [min(leftbounds),max(rightbounds)];
} innerbounds = cache(innerbounds);


function heat(g,t,tL,overheat_at){
	var zero = games[get_game_index([], [])];
	if (isANumber(g)){
		if (!overheat_at) return g;
		if (isPositiveInteger(g)){
			var sum = zero;
			while (g.left.length != 0){
				sum = games[add(sum.index,overheat_at.index)];
				g = g.left[0];
			}
			return sum;
		}
	}
	if (!tL) tL = t;
	var ell = [];
	for (var i=0; i<g.left.length; i++)
		ell.push(add(heat(g.left[i],t,tL,overheat_at).index,t.index))
	var arr = [];
	for (var i=0; i<g.right.length; i++)
		arr.push(sub(heat(g.right[i],t,tL,overheat_at).index,tL.index))
	return games[get_game_index(ell, arr)];
}

function cool(g,t, doDraw=false){//returns [cooled_g, t-g_t>0 ? t-g_t : 0, dt]
	//cool a game by temperature t
	if (!isANumber(t)) throw new Error('cool takes in a number for t, but t was not a number!');
	var zero = games[get_game_index([], [])];
	if (le(t,zero)) throw new Error('cool takes in a positive number for t, but t was not positive!');
	var dt=get_game_index([zero.index],[]);
	var dt = games[dt]; //the number 1
	if (isANumber(g)) return [g,t,dt];
	var bounds = innerbounds(g);
	if (eq(bounds[0],bounds[1])) return [bounds[0],t,dt];
	heatDecrement:
	while (!eq(zero,t)){
		var ell = [];
		var arr = [];
		var trash;
		while (!le(dt,t)) dt=games[get_game_index([zero.index],[dt.index])];
		//left array
		for (var i = 0; i < g.left.length; i++){
			var newGl;
			var newdt;
			//console.log(i)
			[newGl, trash, newdt] = cool(g.left[i], dt);
			if (!le(dt,newdt)){
				dt = newdt;
				continue heatDecrement;
			}
			ell.push(sub(newGl.index,dt.index))
		}
		//right array
		for (var i = 0; i < g.right.length; i++){
			var newGr;
			var newdt;
			[newGr, trash, newdt] = cool(g.right[i], dt);
			if (!le(dt,newdt)){
				dt = newdt;
				continue heatDecrement
			}
			arr.push(add(newGr.index,dt.index))
		}
		var newG = games[get_game_index(ell,arr)];
		if (isANumber(newG)){
			dt=games[get_game_index([zero.index],[dt.index])];
			continue heatDecrement;
		}
		t = games[sub(t.index,dt.index)];
		g = newG;
		var bounds = innerbounds(g);
		if (eq(bounds[0],bounds[1])) return [g,t,dt];
		if (doDraw){/*TODO*/}
	}
	return [g,zero,dt];
}

function fullCool(g){//returns [cooled g, g_t]
	var zero_index = get_game_index([], [])
	var one_index = get_game_index([zero_index], [])
	var t = zero_index;
	var bounds = innerbounds(g);
	var trash;
	while (!eq(bounds[0],bounds[1])){
		var dt;
		[g,dt,trash] = cool(g, games[one_index], true);
		t = sub(add(t,one_index),dt.index);
		bounds = innerbounds(g);
	}
	return [g,games[t]];
}

//returns index
function sub(g_index,h_index){
	return add(g_index,neg(h_index))
}

//returns index
function neg(index) {
	var g = games[index];
	var ell = [];
	var arr = [];
	for(var i = 0; i < g.left.length; i++)
		arr.push(neg(g.left[i].index));
	for(var i = 0; i < g.right.length; i++)
		ell.push(neg(g.right[i].index));
	// console.log(ell);
	// console.log(arr);
	return get_game_index(ell,arr);
}

//returns index
function add(g_index,h_index) {
	// console.log("adding games " + g + " and " + h + " together.");
	var g = games[g_index];
	var h = games[h_index];
	//console.log(g);
	//console.log(h);
	var ell = [];
	var arr = [];
	for(var i = 0; i < g.left.length; i++) {
		//console.log("nbw that g.left[i].index is" + g.left[i].index);
		//console.log("and h.index is" + h.index);
		//console.log("coz h is ");
		//console.log(h);
		ell.push(add(g.left[i].index,h.index));
	}
	for(var i = 0; i < h.left.length; i++)
		ell.push(add(g.index,h.left[i].index));
	for(var i = 0; i < g.right.length; i++)
		arr.push(add(g.right[i].index,h.index));
	for(var i = 0; i < h.right.length; i++)
		arr.push(add(g.index,h.right[i].index));
	return get_game_index(ell,arr);
} add = cache(add,false)



namesToValues = {};
valuesToNames = {};

function bind(name,value) {
	namesToValues[name] = value;
	valuesToNames[value] = name;
}

function get_gcd(x, y) {
	x = Math.abs(x);
	y = Math.abs(y);
	while(y) [x,y] = [y,x%y];
	return x;
}

function attemptAddDiaticFractions(g_index){
	//return false; //uncomment this to disable this feature
	if (!isANumber(games[g_index])) return false;
	var zero = games[get_game_index([], [])];
	if (le(games[g_index],zero)) return false;
	if (isPositiveInteger(games[g_index])){
		var n = Number(display(games[g_index].left[0].index))+1
		calculate(n.toString()+" = {"+(n-1).toString()+"|}")
	} else {
		var left = display(games[g_index].left[0].index);
		var right = display(games[g_index].right[0].index);
		var leftNumer, leftDenom, rightNumer, rightDenom;
		if (left.indexOf("_")!=-1){
			var leftList=left.split("/")
			leftDenom = Number(leftList[1]);
			leftList = leftList[0].split("_")
			leftNumer = Number(leftList[1])+Number(leftList[0])*leftDenom
		} else if (left.indexOf("/")!=-1) {
			var leftList=left.split("/")
			leftDenom = Number(leftList[1]);
			leftNumer = Number(leftList[0]);
		} else {
			[leftNumer, leftDenom] = [Number(left),1]
		}
		if (right.indexOf("_")!=-1){
			var rightList=right.split("/")
			rightDenom = Number(rightList[1]);
			rightList = rightList[0].split("_")
			rightNumer = Number(rightList[1])+Number(rightList[0])*rightDenom
		} else if (right.indexOf("/")!=-1) {
			var rightList=right.split("/")
			rightDenom = Number(rightList[1]);
			rightNumer = Number(rightList[0]);
		} else {
			[rightNumer, rightDenom] = [Number(right),1]
		}
		console.log(left)
		var newFrac = [(leftDenom*rightNumer+rightDenom*leftNumer),leftDenom*rightDenom*2]
		console.log(newFrac)
		var gcd = get_gcd(newFrac[0],newFrac[1])
		newFrac = [newFrac[0]/gcd,newFrac[1]/gcd];
		var wholePart = (newFrac[0]-newFrac[0]%newFrac[1])/newFrac[1]
		newFrac = [newFrac[0]%newFrac[1],newFrac[1]];
		var calcStr = "";
		if (wholePart != 0) calcStr += wholePart.toString();
		if (calcStr) calcStr += "_";
		if(newFrac[0]) calcStr += newFrac[0]+"/"+newFrac[1];
		calcStr += " = {" +left+ "|"+right+"}"
		calculate(calcStr);
	}
	return true;
}

// takes the index of g
function display(g_index) {
	//console.log("trying to display " + g_index);
	if(g_index in valuesToNames || attemptAddDiaticFractions(g_index)) {
		return valuesToNames[g_index];
	}
	ng = neg(g_index);
	if(ng in valuesToNames || attemptAddDiaticFractions(ng)) {
		return "-" + valuesToNames[ng];
	}
	var g = games[g_index];
	var s = "{";
	if(g.left.length > 0) {
		for(var i = 0; i < g.left.length; i++) {
			if(i > 0)
				s += ", ";
			s += display(g.left[i].index);
		}
	}
	s += "|";
	if(g.right.length > 0) {
		for(var i = 0; i < g.right.length; i++) {
			if(i > 0)
				s += ", ";
			s += display(g.right[i].index);
		}
	}
	s += "}";
	return s;
}

function forceDisplay(g_index) {
	g = games[g_index];
	var s = "{";
	if(g.left.length > 0) {
		for(var i = 0; i < g.left.length; i++) {
			if(i > 0)
				s += ", ";
			s += display(g.left[i].index);
		}
	}
	s += "|";
	if(g.right.length > 0) {
		for(var i = 0; i < g.right.length; i++) {
			if(i > 0)
				s += ", ";
			s += display(g.right[i].index);
		}
	}
	s += "}";
	return s;
}


// console.log(games[add(up,up)]);
// console.log(display(add(up,up)));
