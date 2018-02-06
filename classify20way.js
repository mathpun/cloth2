var task;
$(document).ready(function() {

	// Parameters
	var ntask = 6; // how many different tasks (alphabets) are there?
	var nway = 2; // n-way classification tasl

	// Selected demo images
	//latin_id = 2;
	Q1_id = 1;
	Q2_id = 2;
//	Q3_id = 1;
//	Q4_id = 3;
//	Q5_id = 3;
//	Q6_id = 2;
//	Q7_id = 1;
//	Q8_id = 3;
//	Q9_id = 1;
//	Q10_id = 3;
	//Q11_id = 2;
	//Q12_id = 4;
	//Q13_id = 2;
	//Q14_id = 2;
	//Q15_id = 3;


	//took out line 18,19 added line 16, shit, turns out you need spec.list_condition 
	//var spec = {};
	var spec = {};
	spec.list_condition = ['a','a'];

	task = classification(spec);
	var condition = task.getCondition();

	var data = {};
	var inds = shuffle([0,1]);
	data.imglist_demo = getlist_test_demo(Q1_id,Q2_id,inds);
	data.imglist_list_demo = getlist_train_demo(nway,inds);
	data.imglist_test = getlist_test(condition,ntask,nway);
	data.imglist_list_train = getlist_train(condition,ntask,nway);
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

// Get just the two test images for the demo
//var getlist_test_demo = function (Q1_id,Q2_id,Q3_id,Q4_id,Q5_id,Q6_id,Q7_id,Q8_id,Q9_id,Q10_id,Q11_id,Q12_id,Q13_id,Q14_id,Q15_id,r) {
var getlist_test_demo = function (Q1_id,Q2_id,r) {

	var list = new Array();
	var dname = 'images_classif_demo/';
//  	list[0] = dname + 'latin_test' + latin_id + '.png';
	list[r[0]] = dname + 'Q1_test' + Q1_id + '.png';
	list[r[1]] = dname + 'Q2_test' + Q2_id + '.png';
//	list[r[2]] = dname + 'Q3_test' + Q3_id + '.png';
//	list[r[3]] = dname + 'Q4_test' + Q4_id + '.png';
//	list[r[4]] = dname + 'Q5_test' + Q5_id + '.png';
//	list[r[6]] = dname + 'Q7_test' + Q7_id + '.png';
//	list[r[7]] = dname + 'Q8_test' + Q8_id + '.png';
//	list[r[8]] = dname + 'Q9_test' + Q9_id + '.png';
//	list[r[9]] = dname + 'Q10_test' + Q10_id + '.png';
//	list[r[10]] = dname + 'Q11_test' + Q11_id + '.png';
//	list[r[11]] = dname + 'Q12_test' + Q12_id + '.png';
//	list[r[12]] = dname + 'Q13_test' + Q13_id + '.png';
//	list[r[13]] = dname + 'Q14_test' + Q14_id + '.png';
//	list[r[14]] = dname + 'Q15_test' + Q15_id + '.png';
	return list;
};

// Get two lists of training images
var getlist_train_demo = function (nway,r) {
	var list = new Array();
	var dname = 'images_classif_demo/';
//

	list[r[0]] = new Array();
	for (var c=1; c <= nway; c++ ) {
  		list[r[0]][c-1] = dname + 'Q1_train' + c + '.png';
    }

	list[r[1]] = new Array();
	for (var c=1; c <= nway; c++ ) {
	  	list[r[1]][c-1] = dname + 'Q2_train' + c + '.png';
	  }

		
	return list;
};

// randomly choose a "test" image for each trial LOL ACTUALLY IT'S NOT RANDOM IT'S HARD-CODED 
var getlist_test = function (type,ntask,nway,oops) {
    var list = new Array();
    var dname = 'images_classif/';
  	var count = 0;
	// hard-code condition one 
	list[0] = dname + 'task' + 1 + type + '_test' + 1 + '.png';
	list[1] = dname + 'task' + 2 + type + '_test' + 1 + '.png';
	list[2] = dname + 'task' + 3 + type + '_test' + 1 + '.png';
	list[3] = dname + 'task' + 4 + type + '_test' + 1 + '.png';
	list[4] = dname + 'task' + 5 + type + '_test' + 1 + '.png';
	list[5] = dname + 'task' + 6 + type + '_test' + 1 + '.png';
//   	for (var i=1; i <= ntask; i++) {
//   		var c = tu.randint(1,nway); // random choice of the image
//   		list[count] = dname + 'task' + i + type + '_test' + c + '.png';
//   		count++;
//   	}
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


