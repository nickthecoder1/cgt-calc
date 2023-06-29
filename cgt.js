

// keep track of games by indices in the following list

games = []

silent = true;

function bare_le(g, h) {
	for(var i = 0; i < g.left.length; i++) {
		if(le(h,g.left[i]))
			return false;
	}
	for(var i = 0; i < h.right.length; i++) {
		if(le(h.right[i],g))
			return false;
	}
	return true;
}

ian_cache = {}
function isANumber(g){
	if (g.index){
		if (ian_cache[g.index]) return ian_cache[g.index];
		ian_cache[g.index] = bare_isANumber(g);
		return ian_cache[g.index];
	}
	return bare_isANumber(g);
}
function bare_isANumber(g){
	for(var i = 0; i < g.left.length; i++) {
		for(var j = 0; j < g.right.length; j++) {
			if (le(g.right[j], g.left[i]) || isCFW(g.right[j], g.left[i])) return false;
		}
	}
	return true;
}

bounds_cache = {}
function innerbounds(g){
	if (g.index){
		if (bounds_cache[g.index]) return bounds_cache[g.index];
		bounds_cache[g.index] = bare_innerbounds(g);
		return bounds_cache[g.index];
	}
	return bare_innerbounds(g);
}
function bare_innerbounds(g){
	if (isANumber(g)) return [g,g];
	var leftbounds = []
	for (var i = 0; i < g.left.length; i++)
		leftbounds.push(innerbounds(g.left[i])[1])
	var rightbounds = []
	for (var i = 0; i < g.right.length; i++)
		rightbounds.push(innerbounds(g.right[i])[0])
	return [min(leftbounds),max(rightbounds)];
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

comparison_cache = {}
function le(g,h) {
	if(g.index && h.index) {
		var d = 0;
		if(comparison_cache[g.index])
			d = comparison_cache[g.index][h.index];
		if(d)
			return d > 0;
		d = bare_le(g,h);
		if(!comparison_cache[g.index]) {
			comparison_cache[g.index] = {};
		}
		comparison_cache[g.index][h.index] = d;
		return d;
	}
	return bare_le(g,h);
}

function eq(g, h) {
	return le(g,h) && le(h,g);
}

function isCFW(g,h){ //is confused with
	return (!(le(g,h) || le(h,g)));
}

function get_game_index(left_indices, right_indices) {
	ell = [];
	arr = [];
	for(var i = 0; i < left_indices.length; i++) {
		ell.push(games[left_indices[i]]);
	}
	for(var i = 0; i < right_indices.length; i++) {
		arr.push(games[right_indices[i]]);
	}
	g = {left: ell, right: arr};
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

addition_cache = {}
function plus(g_index,h_index){
	if (g_index > h_index)
		[g_index, h_index] = [h_index, g_index];
	var retVal;
	if (addition_cache[g_index]){
		retVal = addition_cache[g_index][h_index];
	} else {
		addition_cache[g_index] = {}
	}
	if (!retVal){
		retVal = bare_plus(g_index,h_index);
		addition_cache[g_index][h_index] = retVal;
	}
	return retVal
}
function bare_plus(g_index,h_index) {
	// console.log("adding games " + g + " and " + h + " together.");
	g = games[g_index];
	h = games[h_index];
	//console.log(g);
	//console.log(h);
	var ell = [];
	var arr = [];
	for(var i = 0; i < g.left.length; i++) {
		//console.log("nbw that g.left[i].index is" + g.left[i].index);
		//console.log("and h.index is" + h.index);
		//console.log("coz h is ");
		//console.log(h);
		ell.push(plus(g.left[i].index,h.index));
	}
	for(var i = 0; i < h.left.length; i++)
		ell.push(plus(g.index,h.left[i].index));
	for(var i = 0; i < g.right.length; i++)
		arr.push(plus(g.right[i].index,h.index));
	for(var i = 0; i < h.right.length; i++)
		arr.push(plus(g.index,h.right[i].index));
	return get_game_index(ell,arr);
}



namesToValues = {};
valuesToNames = {};

function bind(name,value) {
	namesToValues[name] = value;
	valuesToNames[value] = name;
}




// takes the index of g
function display(g_index) {
	//console.log("trying to display " + g_index);
	if(g_index in valuesToNames) {
		return valuesToNames[g_index];
	}
	ng = neg(g_index);
	if(ng in valuesToNames) {
		return "-" + valuesToNames[ng];
	}
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


// console.log(games[plus(up,up)]);
// console.log(display(plus(up,up)));
