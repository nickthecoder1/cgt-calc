var inps = [document.getElementById('input'),document.getElementById('input2'),document.getElementById('input3'),document.getElementById('input4')];
var out = document.getElementById('output');
var currentlySelectedInput = 0;

out.value="Welcome!";
inps[0].value="";

function getOperation(){
	var selects = document.querySelectorAll("select");
	return selects[0].options[selects[0].selectedIndex].value;
}

function execute(){
	var operation = getOperation();
	var output;
	var input;
	switch (operation){
	case("calc"):
		input = inps[0].value;
		output = calculate(inps[0].value);
		inps[0].value = "";
		break;
	case("compare"):
		input = inps[0].value + " ? " + inps[1].value;
		output = compareOutput(inps[0].value,inps[1].value);
		inps[0].value = "";
		inps[1].value = "";
		break;
	case("cool"):
		input = inps[0].value + (inps[1].value !== "" ? " cooled by "+inps[1].value : " cooled all the way");
		output = coolOutput(inps[0].value,inps[1].value);
		inps[0].value = "";
		break;
	case("heat"):
		input = heatInput(inps[2].value,inps[1].value,inps[0].value,inps[3].value);
		output = heatOutput(inps[2].value,inps[1].value,inps[0].value,inps[3].value);
		inps[2].value = "";
		break;
	case ("uppitiness"):
		input = inps[0].value;
		output = uppityOutput(inps[0].value);
		inps[0].value = "";
		break;
	}
	out.value += "\n>> " + input;
	out.value += "\n" + output;
	for (id in inps){
		setWidths[id]();
	}
	out.scrollTop = out.scrollHeight;
}

function doUp() {
	inps[currentlySelectedInput].value += "\u2191";
	inps[currentlySelectedInput].focus();
	inps[currentlySelectedInput].oninput();
}

function doDown() {
	inps[currentlySelectedInput].value += "\u2193";
	inps[currentlySelectedInput].focus();
	inps[currentlySelectedInput].oninput();
}


function operationChange() {
	var operation = getOperation();
	inbetweens = [document.getElementById('12'),document.getElementById('23')];
	for (var id in inbetweens){
		inbetweens[id].innerHTML = "";
		inbetweens[id].style.fontSizeAdjust = "initial"
	}
	for (var id in inps){
		inps[id].onkeypress = function(event){clickPress(event);}
		inps[id].style.visibility = "hidden";
		inps[id].value = "";
		//console.log(id)
		inps[id].oninput = setWidths[id]
		inps[id].style.top = 0;
		inps[id].style.left = 0;
	}
	inps[0].style.visibility = "visible";
	switch (operation){
	case "calc":
		break;
	case "uppitiness":
		break;
	case "cool":
		inps[0].onkeypress= function(event){if (event.key == "Enter") {inps[1].focus();currentlySelectedInput = 1;}}
		inps[1].onkeypress= function(event){if (event.key == "Enter") {clickPress(event);inps[0].focus();currentlySelectedInput = 0;}}
		inps[1].style.visibility = "visible";
		inbetweens[0].innerHTML = "cooled by";
		inbetweens[1].innerHTML = "(leave blank to cool all the way)";
		break;
	case "compare":
		inps[0].onkeypress= function(event){if (event.key == "Enter") {inps[1].focus();currentlySelectedInput = 1;}}
		inps[1].onkeypress= function(event){if (event.key == "Enter") {clickPress(event);inps[0].focus();currentlySelectedInput = 0;}}
		inps[1].style.visibility = "visible";
		inbetweens[0].innerHTML = "?";
		break;
	case "heat":
		inbetweens[0].innerHTML = "∫"
		inbetweens[0].style.fontSizeAdjust = "2"
		inps[1].style.visibility = "visible";
		inps[2].style.visibility = "visible";
		inps[3].style.visibility = "visible";
		inps[0].style.top = "-45px"
		inps[1].style.top = "-45px"
		inps[2].style.top = "-15px"
		inps[3].style.top = "-25px"
		inps[3].style.left = (Number(inps[0].style.width.split("px")[0])+20).toString()+"px";
		inps[0].oninput = function () {
			setWidths[0]();
			inps[3].style.left = (Number(inps[0].style.width.split("px")[0])+20).toString()+"px";
		}
		break;
	}
}


function clickPress(event) {
    if (event.key == "Enter") {
        execute();
    }
}

document.getElementById('operation').addEventListener('wheel', function(e) {
    if (this.hasFocus) {
        return;
    }
    if (e.deltaY < 0) {
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
    }
    if (e.deltaY > 0) {
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.length - 1);
    }
    operationChange();
});

//dynamic textbox changes
var fakeEles = [];
function genSetWidth(inp){ //Generate setWidth function
	// Create a div element
	var fakeEle = document.createElement('div');

	// Hide it completely
	fakeEle.style.position = 'absolute';
	fakeEle.style.top = '0';
	fakeEle.style.left = '-9999px';
	fakeEle.style.overflow = 'hidden';
	fakeEle.style.visibility = 'hidden';
	fakeEle.style.whiteSpace = 'nowrap';
	fakeEle.style.height = '0';

	// Get the styles
	var styles = window.getComputedStyle(inp);

	// Copy font styles from the textbox
	fakeEle.style.fontFamily = styles.fontFamily;
	fakeEle.style.fontSize = styles.fontSize;
	fakeEle.style.fontStyle = styles.fontStyle;
	fakeEle.style.fontWeight = styles.fontWeight;
	fakeEle.style.letterSpacing = styles.letterSpacing;
	fakeEle.style.textTransform = styles.textTransform;

	fakeEle.style.borderLeftWidth = styles.borderLeftWidth;
	fakeEle.style.borderRightWidth = styles.borderRightWidth;
	fakeEle.style.paddingLeft = styles.paddingLeft;
	fakeEle.style.paddingRight = styles.paddingRight;

	// Append the fake element to `body`
	document.body.appendChild(fakeEle);
	var inputID = fakeEles.length;
	fakeEles.push(fakeEle);
	return function () {
		var fakeElement = fakeEles[inputID];
		const string = inp.value || inp.getAttribute('placeholder') || '';
		fakeElement.innerHTML = string.replace(/\s/g, '&' + 'nbsp;');

		const fakeEleStyles = window.getComputedStyle(fakeElement);
		if (fakeEleStyles){
			var k = fakeEleStyles.width.split("px");
			k[0] = Math.max(Number(k[0])+10,50).toString();
			inp.style.width = k.join("px");
		}
	}
}
function setAsSelected(num){
	return function(){currentlySelectedInput = num;}
}
var setWidths = [];
for (var id in inps){
	var inp = inps[id];
	setWidths[id] = genSetWidth(inp);
	setWidths[id]();
	inp.addEventListener('click', setAsSelected(id));
}


operationChange()