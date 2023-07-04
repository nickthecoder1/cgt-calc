
function atom(str) {
	return {type:'atom', value:str};
}

function parser_plus(first, second) {
	return {type:'plus', first:first, second:second};
}
function parser_times(first, second) {
	return {type:'times', first:first, second:second};
}

function unary_minus(x) {
	return {type:'neg', value:x};
}

function minus(first,second) {
	return parser_plus(first,unary_minus(second));
}

function unary_plus(x) {
	return x;
}

function brackets(first,second) {
	return {type:'brackets', first:first, second:second};
}

function comparison(first, operator, second) {
	return {type:'comparison', operator:operator, first:first, second:second};
}


function recursivePrint(entity) {
	// takes in an entity
	// an entity is a game represented as a variable like "*", an expression like 1+1, or brackets like {0|*}
	// returns a string representing that entity ("*","1+1","{0|*}")
	// adds parenthesis and plus signs to make expressions unambiguous
	// disambiguates impartial game notation as well ({0}, {-1,1}, etc)
	if(entity.type == "atom")
		return entity.value;
	if(entity.type == "plus")
		return recursivePrint(entity.first) + "+" + recursivePrint(entity.second);
	if(entity.type == "times")
		return recursivePrint(entity.first) + "." + recursivePrint(entity.second);
	if(entity.type == "comparison")
		return recursivePrint(entity.first) + entity.operator + recursivePrint(entity.second)
	if(entity.type == "neg")
		return "-(" + recursivePrint(entity.value) + ")";
	if(entity.type == "brackets") {
		var first = "";
		var second = "";
		if(entity.first.length > 0) {
			for(var i = 0; i < entity.first.length; i++) {
			if(i > 0)
				first += ",";
			first += recursivePrint(entity.first[i]);
			}
		}
		if(entity.second.length > 0) {
			for(var i = 0; i < entity.second.length; i++) {
			if(i > 0)
				second += ",";
			second += recursivePrint(entity.second[i]);
			}
		}
		return "{" + first + "|" + second + "}";
	}
	return "error";
}


// return a list of pairs [token,loc]
// where loc is the location of the first character of token
function lex(str) {
	function get_type(c) {
		if(c == ' ')
			return ' ';
		if(c == '|')
			return '|';
		if("{}(),=?+-.".indexOf(c) > -1)
			return '!';
		return 'x';
	}
	// console.log("str is: " + str);
	var types = "";
	for(i = 0; i < str.length; i++) {
		types += get_type(str[i]);
	}
	// console.log("types is: " + types);
	var retval = []
	var start = 0;
	while(start < str.length) {
		var current = str[start];
		var end = start+1;
		while(end < str.length && types[end] == types[start]
			  && types[end] != '!')
			current += str[end++];
		if(types[start] != ' ')
			retval.push([current,start]);
		start = end;
	}
	return retval;
		
}


function parse(lexdata) {
	var tokens = [];
	var types = [];
	var locs = [];
	for(var i = 0; i < lexdata.length; i++) {
		tokens.push(lexdata[i][0]);
		locs.push(lexdata[i][1]);
		c = lexdata[i][0][0];
		if("?|{},=()+.".indexOf(c) > -1)
			types.push(c);
		else if(c == "-")
			types.push("+");
		else
			types.push("x");
	}

	var where = 0;
	var failure = false;

	function fail(s) {
		if(failure)
			return;
		failure = s;
	}

	function peekType() {
		if(where >= tokens.length)
			return "$";
		return types[where];
	}

	function pullValue(type) {
		if(peekType() == '$') {
			unexpectedFail();
			return "error";
		}
		if(peekType() != type) {
			fail("At " + locs[where] + ", expected " + type
			 + ", but got " + peekType());
			return "error";
		}
		return tokens[where++];
	}

	function unexpectedFail() {
		if(where >= tokens.length)
			fail("Unexpected end of input!");
		else
			fail("Unexpected token " + tokens[where]
			 + " at location " + locs[where]);
	}

	

	
	

	function readTerm() {
		switch(peekType()) {
			case '+':
				var c = pullValue('+');
				if(c == '+')
					return unary_plus(readTerm());
				else
					return unary_minus(readTerm());
			case '(':
				pullValue('(');
				ret = readExpression();
				pullValue(')');
				return ret;
			case 'x':
				return atom(pullValue('x'));
			case '{':
				pullValue('{');
				ret = readBarList();
				pullValue('}');
				return ret;
			default:
				unexpectedFail();
				return "error";
		}
	}

	function readExpression() {
		var running = readTerm();
		while(!failure && peekType() == '+') {
			if (peekType() == '+'){
				var op = pullValue('+');
				var second = readTerm();
				while (!failure && peekType() == '.'){
					var op = pullValue('.');
					var third = readTerm();
					second = parser_times(second,third);
				}
				if(op == '+')
					running = parser_plus(running,second);
				else
					running = minus(running,second);
			}
		}
		if (peekType() == '.'){
			var op = pullValue('.');
			var second = readTerm();
			running = parser_times(running,second);
		}
		return running;
	}

	function readCommaList() {
		var retval = [];
		if(peekType() == '|' || peekType() == '}') {
			return retval;
		}
		while(!failure) {
			retval.push(readExpression());
			if(peekType() == '|' || peekType() == '}') {
				return retval;
			}
			pullValue(',');
		}
	}

	

	function readCommand() {
		var e1 = readExpression();
		if(peekType() == '$') {
			return e1;
		}
		if(peekType() == '?' || peekType() == '=') {
			var op = pullValue(peekType());
			var e2 = readExpression();
			if(peekType() != '$') {
				unexpectedFail();
				return "error";
			}
			return comparison(e1,op,e2);
		}
		unexpectedFail();
		return "error";
	}


	function readBarList() {
		var commaLists = [];
		var bars = [];
		var barLocs = [];
		commaLists.push(readCommaList());
		while(!failure && peekType() == '|') {
			barLocs.push(where);
			bars.push(pullValue('|'));
			commaLists.push(readCommaList());
		}
		
		// now things get tricky
		
		if(bars.length == 0) {
			// special syntax for games where both
			// players have the same options...
			// commaLists = [x], and we want brackets(x,x)
			return brackets(commaLists[0],commaLists[0]);
		}
		return handleBrackets(commaLists,bars,barLocs);
	}

	function handleBrackets(commaLists,bars,barLocs) {
		if(bars.length == 1)
			return brackets(commaLists[0],commaLists[1]);
		
		var biggest = -1;
		var first, last;
		for(var i = 0; i < bars.length; i++) {
			var val = bars[i].length;
			if(val > biggest) {
				biggest = val;
				first = last = i;
			}
			else if(val == biggest)
				last = i;
			
		}
		if(last > first) {
			lastLoc = barLocs[last];
			firstLoc = barLocs[first];
			sep = tokens[first];
			fail("Ambiguous parse between " + sep +
			 " at " + firstLoc + " and " + lastLoc);
			return "error";
		}
		var cL1 = commaLists.slice(0,first+1);
		var cL2 = commaLists.slice(first+1,commaLists.length);
		var sep1 = bars.slice(0,first);
		var sep2 = bars.slice(first+1,bars.length);
		var debug1 = barLocs.slice(0,first);
		var debug2 = barLocs.slice(first+1,bars.length);
		var g1, g2;
		if(cL1.length == 1)
			g1 = cL1[0];
		else
			g1 = [handleBrackets(cL1,sep1,debug1)];
		if(cL2.length == 1)
			g2= cL2[0];
		else
			g2 = [handleBrackets(cL2,sep2,debug2)];
		return brackets(g1,g2);
	}

	var final_retval = readCommand();
	if(failure)
		return [false,failure];
	return [true,final_retval];
}



// exports.process_input = function(input) {
//     return parse(lex(input));
// }

// exports.recursivePrint = recursivePrint;
		

// console.log(parse(lex("a = {b|c+d,e}")));


// console.log(lexer("a bc|<||   diax? =} {"));


function attemptAddNumberAtom(str){
	// attempts to add any diatic fraction to the list of games
	// return false; //uncomment this line to disable this feature
	for (var i = 0; i<str.length; i++){
		if ("0123456789_/".indexOf(str[i]) == -1) return false;
	}
	if (str.split("_").length == 1 && str.split("/").length == 1){ //whole number
		var num = Number(str);
		var tmpNum = num
		while (!(tmpNum.toString() in namesToValues)) tmpNum -= 1;
		while (tmpNum < num){
			tmpNum += 1;
			calculate(tmpNum.toString()+" = {"+(tmpNum-1).toString()+"|}");
		}
		return true;
	}
	if (str.split("_").length > 2 || str.split("/").length > 2 || (str.split("_").length > 1 && str.split("/").length == 1)) return false;
	var wholeNumber = "";
	if (str.split("_").length == 2){
		wholeNumber = str.split("_")[0]
		str = str.split("_")[1]
	}
	var fraction = str.split("/");
	var numerator = fraction[0];
	var denominator = fraction[1];
	if ((denominator/2)%1 != 0) return false; //if it's not diatic
	if (numerator%2 == 0) return false; //if it's not reduced
	var left = (Number(numerator)-1);
	var right = (Number(numerator)+1);
	var gcd = get_gcd(left,denominator);
	left = (left/gcd).toString()+(denominator/gcd > 1 ? "/"+(denominator/gcd).toString() : "");
	gcd = get_gcd(right,denominator);
	right = (right/gcd).toString()+(denominator/gcd > 1 ? "/"+(denominator/gcd).toString() : "");
	if (wholeNumber){
		if (left === "0") left = wholeNumber;
		else left = wholeNumber+"_"+left
		if (right === "1") right = (Number(wholeNumber)+1).toString();
		else right = wholeNumber+"_"+right
	}
	calculate((wholeNumber ? wholeNumber+"_" : "") +str+" = {"+left+"|"+right+"}");
	return true;
}


function toGame(entity) {
	switch(entity.type) {
		case "plus":
			return add(toGame(entity.first),toGame(entity.second));
		case "times":
			return multiply(games[toGame(entity.first)],games[toGame(entity.second)]).index;
		case "neg":
			return neg(toGame(entity.value));
		case "atom":
			if(entity.value in namesToValues) {
				return namesToValues[entity.value];
			}
			if (attemptAddNumberAtom(entity.value)) return namesToValues[entity.value];
			throw new Error('unrecognized variable '+entity.value);
		case "brackets":
			var lefts = [];
			var rights = [];
			for(var i = 0; i < entity.first.length; i++)
				lefts.push(toGame(entity.first[i]));
			for(var i = 0; i < entity.second.length; i++)
				rights.push(toGame(entity.second[i]));
			return get_game_index(lefts,rights);
	}
}

function coolOutput(input, temp){
	var gameIndex, tempIndex;
	try{
		gameIndex = data2gameIndex(parse(lex(input)));
		if (temp !== "") tempIndex = data2gameIndex(parse(lex(temp)));
	} catch (e) {return e;}
	var cooledValue,t;
	if (temp !== "")
		[cooledValue,t] = cool(games[gameIndex], games[tempIndex]);
	else
		[cooledValue,t] = fullCool(games[gameIndex]);
	meanValue = innerbounds(cooledValue)[0]
	return display(gameIndex)+" cooled by "+display(t.index)+" is "+display(cooledValue.index)+" and has a mean value of "+display(meanValue.index);
}

function data2gameIndex(data){
	if(!data[0]) {
		// parse error
		throw new Error("Parse error: " + data[1]);
	}
	data = data[1];
	if(data.type == "comparison") {
		var first = data.first;
		var second = data.second;
		var op = data.operator;
		if(op == "?") {
			throw new Error("That functionality is no longer supported. Please use compare from the drop down");
		}
		if(op == "=") {
			if(first.type != "atom")
				throw new Error("Error: can't assign to non-variable " + recursivePrint(first));
			first = first.value;
			second = toGame(second);
			bind(first,second);
			return second;
		}
	}
	if(data.type == "atom") {
		data = data.value;
		if(data in namesToValues)
			return namesToValues[data];
		if (attemptAddNumberAtom(data)) return namesToValues[data];
		throw new Error("Error: unrecognized variable " + data);
	}
	if(data.type == "neg" && data.value.type == "atom") {
		data = data.value.value;
		if(data in namesToValues)
			return neg(namesToValues[data]);
		if (attemptAddNumberAtom(data)) return neg(namesToValues[data]);
		throw new Error("Error: unrecognized variable " + data);
	}
	data = toGame(data);
	return data;
}
function compareOutput(input1,input2){
	var data1 = parse(lex(input1));
	var data2 = parse(lex(input2));
	var first_index = data2gameIndex(data1);
	var second_index = data2gameIndex(data2);
	first = games[first_index];
	second = games[second_index];
	var fs = le(first,second);
	var sf = le(second,first);
	first = recursivePrint(data1[1]);
	second = recursivePrint(data2[1]);
	if(fs && sf)
		return first + " = " + second;
	if(fs && !sf)
		return first + " < " + second;
	if(sf && !fs)
		return first + " > " + second;
	return first + " || " + second;
}
function calculate(input) {
	var data = parse(lex(input));
	var gameIndex;
	try{
		gameIndex = data2gameIndex(data);
	} catch (e) {return e;}
	data = data[1];
	if (data.type == "comparison" && data.operator == "=") return display(gameIndex) + " = " + forceDisplay(gameIndex);
	if (data.type == "atom" || (data.type == "neg" && data.value.type == "atom")) return forceDisplay(gameIndex)
	return display(gameIndex)
}
function getHeatGames(input, temp, leftTemp, overheatTemp){
	var gameIndex;
	var tempgameIndex;
	var leftTempGameIndex;
	var overheatgameIndex;
	try{
		gameIndex = data2gameIndex(parse(lex(input)));
		tempgameIndex = data2gameIndex(parse(lex(temp)));
		if (leftTemp !== "")
			leftTempGameIndex = data2gameIndex(parse(lex(leftTemp)));
		else
			leftTempGameIndex = -1
		if (overheatTemp !== "")
			overheatgameIndex = data2gameIndex(parse(lex(overheatTemp)));
		else
			overheatgameIndex = -1
	} catch (e) {return e;}
	if (leftTempGameIndex == -1)
		leftTempGame = null;
	else
		leftTempGame = games[leftTempGameIndex]
	if (overheatgameIndex == -1)
		overheatgame = null;
	else
		overheatgame = games[overheatgameIndex]
	return [games[gameIndex],games[tempgameIndex],leftTempGame,overheatgame]
}
function heatInput(input, temp, leftTemp, overheatTemp){
	var result = leftTemp + "/" + temp + "\n>> "
	for (var i=0; i<leftTemp.length; i++)
		result += " "
	result += "|"
	for (var i=0; i<Math.max(temp.length, overheatTemp.length); i++)
		result += " "
	result += "(" + input + ")\n>> ";
	for (var i=0; i<leftTemp.length; i++)
		result += " "
	result += "/" + overheatTemp;
	return result;
}

function heatOutput(input, temp, leftTemp, overheatTemp){
	if (input === "") return "Error: No number given to heat (far right box)!";
	if (temp === "") return "Error: No temperature given (top middle box)!";
	var [inputGame, tGame, ltGame, otGame] = getHeatGames(input, temp, leftTemp, overheatTemp);
	[input, temp, leftTemp, overheatTemp] = [display(inputGame.index),display(tGame.index),ltGame ? display(ltGame.index) : "",otGame ? display(otGame.index) : ""];
	var result = leftTemp + "/" + temp + "\n"
	for (var i=0; i<leftTemp.length; i++)
		result += " "
	result += "|"
	for (var i=0; i<Math.max(temp.length, overheatTemp.length); i++)
		result += " "
	result += "(" + input + ") = " + display(heat(inputGame, tGame, ltGame, otGame).index) + "\n";
	for (var i=0; i<leftTemp.length; i++)
		result += " "
	result += "/" + overheatTemp;

	return result;
}

function uppityOutput(input){
	var gameIndex;
	try{
		gameIndex = data2gameIndex(parse(lex(input)));
	} catch (e) {return e;}
	try{
		var uppitiness = get_uppitiness(games[gameIndex]);
	} catch (e) {
		return display(gameIndex)+" cannot have atomic weight, because it, or one of its components, is too far from zero"
	}
	return display(gameIndex)+" has atomic weight "+display(uppitiness.index);
}

// to test things in the console:
/*
function str2game(s){return games[toGame(parse(lex(s))[1])];}
f = function(g,i){return innerbounds(g)[i]};
function test(s,i){console.log(display(f(str2game(s),i).index));}

*/

calculate("0 = {|}");
calculate("1 = {0|}");
calculate("* = {0}");
calculate("1* = {1}");
calculate("2* = {2}");
calculate("3* = {3}");
calculate("*2 = {0,*}");
calculate("*3 = {0,*,*2}");
calculate("*4 = {0,*,*2,*3}");
calculate("*5 = {0,*,*2,*3,*4}");
calculate("1/2 = {0|1}");
calculate("\u2191 = {0|*}");				// up definition
calculate("\u2191\u2191 = \u2191+\u2191");	// double up definition
calculate("\u2193 = -\u2191");				// down definition
calculate("\u2193\u2193 = \u2193+\u2193");	// double down definition
calculate("\u2191* = \u2191+*");			// up* definition
calculate("\u2193* = \u2193+*");			// down* definition
zero = games[get_game_index([], [])];
one = games[get_game_index([zero.index], [])];


