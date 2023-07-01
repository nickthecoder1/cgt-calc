var inps = [document.getElementById('input'),document.getElementById('input2')];
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
		break;
	case("cool"):
		input = inps[0].value;
		output = coolOutput(inps[0].value);
		break;
	case("compare"):
		input = inps[0].value + " ? " + inps[1].value;
		output = compare(inps[0].value,inps[1].value);
		break;
	}
	out.value += "\n>> " + input;
	out.value += "\n" + output;
	for (id in inps){
		inps[id].value = "";
		setWidths[id]();
	}
	out.scrollTop = out.scrollHeight;
}

function doUp() {
	inps[currentlySelectedInput].value += "\u2191";
	inps[currentlySelectedInput].focus();
}

function doDown() {
	inps[currentlySelectedInput].value += "\u2193";
	inps[currentlySelectedInput].focus();
}


function operationChange() {
	var operation = getOperation();
	inbetweens = [document.getElementById('12')];
	for (var id in inbetweens){
		inbetweens[id].innerHTML = "";
	}
	inps[1].style.visibility = "hidden";
	switch (operation){
	case "calc":
		break;
	case "cool":
		break;
	case "compare":
		inps[1].style.visibility = "visible";
		inbetweens[0].innerHTML = "?";
		break;
	}
}
operationChange()


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

	inp.addEventListener('input', setWidths[id]);
	inp.addEventListener('click', setAsSelected(id));
}