var task;
$(document).ready(function() {

	// Parameters
	var ntask = 16; // how many different tasks (alphabets) are there?
	var nway = 4; // n-way classification tasl

	// Selected demo images
	//latin_id = 2;
	Plant_id = 1;
	Shell_id = 3;
	Tool_id = 2;
//	Frack_id = 4;
	Q1_id = 3;


	//took out line 18,19 added line 16, shit, turns out you need spec.list_condition 
	//var spec = {};
	var spec = {};
	spec.list_condition = ['a','a'];

	task = classification(spec);
	var condition = task.getCondition();

	var data = {};
	data.imglist_test = getlist_test(condition,ntask,nway);
	data.imglist_list_train = getlist_train(condition,ntask,nway);
	var inds = shuffle([0,1,2,3]);
	data.imglist_demo = getlist_test_demo(Plant_id,Shell_id,Tool_id,Q1_id,inds);
	data.imglist_list_demo = getlist_train_demo(nway,inds);
	task.load_images(data);
	console.log("imglist_test:"+data.imglist_test);
	console.log("imglist_train:"+data.imglist_list_train);
});

// shuffle I found on stack overflow
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

// randomly choose a "test" image for each trial
var getlist_test = function (type,ntask,nway) {
    var list = new Array();
    var dname = 'images_classif/';
  	var count = 0;
  	for (var i=1; i <= ntask; i++) {
  		var c = tu.randint(1,nway); // random choice of the image
  		list[count] = dname + 'task' + i + type + '_test' + c + '.png';
  		count++;
  	}
    return list;
};

// enumerate the image set which is the training images
var getlist_train = function (type,ntask,nway) {
    var list = new Array();
    var dname = 'images_classif/';
  	for (var i=1; i <= ntask; i++) {
  		list[i-1] = new Array();
  		for (var c=1; c <= nway; c++ ) {
  			list[i-1][c-1] = dname + 'task' + i + type + '_train' + c + '.png';
  		}
  	}
    return list;
};

// Get just the two test images for the demo
var getlist_test_demo = function (Plant_id,Shell_id,Tool_id,Q1_id,r) {
	var list = new Array();
	var dname = 'images_classif_demo/';
//  	list[0] = dname + 'latin_test' + latin_id + '.png';
	list[r[0]] = dname + 'Plant_test' + Plant_id + '.png';
	list[r[1]] = dname + 'Shell_test' + Shell_id + '.png';
	list[r[2]] = dname + 'Tool_test' + Tool_id + '.png';
//	list[r[3]] = dname + 'Frack_test' + Frack_id + '.png';
	list[r[3]] = dname + 'Q1_test' + Q1_id + '.png';
	return list;
};

// Get two lists of training images
var getlist_train_demo = function (nway,r) {
	var list = new Array();
	var dname = 'images_classif_demo/';
//

	list[r[0]] = new Array();
	for (var c=1; c <= nway; c++ ) {
  		list[r[0]][c-1] = dname + 'Plant_train' + c + '.png';
    }

	list[r[1]] = new Array();
	for (var c=1; c <= nway; c++ ) {
	  	list[r[1]][c-1] = dname + 'Shell_train' + c + '.png';
	  }

	list[r[2]] = new Array();
	for (var c=1; c <= nway; c++ ) {
	  	list[r[2]][c-1] = dname + 'Tool_train' + c + '.png';
	  }
	
	list[r[3]] = new Array();
	for (var c=1; c <= nway; c++ ) {
	  	list[r[3]][c-1] = dname + 'Q1_train' + c + '.png';
	  }

	return list;
};
