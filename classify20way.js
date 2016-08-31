var task;
$(document).ready(function() {

	// Parameters
	var ntask = 10; // how many different tasks (alphabets) are there?
	var nway = 4; // n-way classification tasl
	var ntest = 15; // just a test variable to see how to make more trials

	// Selected demo images
	//latin_id = 2;
	zebra_id = 3;
	snake_id = 4;
	bird_id = 1;
	lizard_id = 2;
	seahorse_id = 4;

	var spec = {};
	spec.list_condition = ['a'];

	task = classification(spec);
	var condition = task.getCondition();

	var data = {};
	data.imglist_test = getlist_test(condition,ntask,nway);
	data.imglist_list_train = getlist_train(condition,ntask,nway);
	data.imglist_demo = getlist_test_demo(zebra_id,snake_id,bird_id,lizard_id,seahorse_id);
	data.imglist_list_demo = getlist_train_demo(nway);
	task.load_images(data);
	console.log("imglist_test:"+data.imglist_test);
	console.log("imglist_train:"+data.imglist_list_train);
});

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
var getlist_test_demo = function (zebra_id,snake_id,bird_id,lizard_id,seahorse_id) {
	var list = new Array();
	var dname = 'images_classif_demo/';
//  	list[0] = dname + 'latin_test' + latin_id + '.png';
	list[0] = dname + 'zebra_test' + zebra_id + '.png';
	list[1] = dname + 'snake_test' + snake_id + '.png';
	list[2] = dname + 'bird_test' + bird_id + '.png';
	list[3] = dname + 'lizard_test' + lizard_id + '.png';
	list[4] = dname + 'seahorse_test' + seahorse_id + '.png';
	return list;
};

// Get two lists of training images
var getlist_train_demo = function (nway) {
	var list = new Array();
	var dname = 'images_classif_demo/';
//

	list[0] = new Array();
	for (var c=1; c <= nway; c++ ) {
  		list[0][c-1] = dname + 'zebra_train' + c + '.png';
    }

	list[1] = new Array();
	for (var c=1; c <= nway; c++ ) {
	  	list[1][c-1] = dname + 'snake_train' + c + '.png';
	  }

	list[2] = new Array();
	for (var c=1; c <= nway; c++ ) {
	  	list[2][c-1] = dname + 'bird_train' + c + '.png';
	  }

	list[3] = new Array();
	for (var c=1; c <= nway; c++ ) {
	  	list[3][c-1] = dname + 'lizard_train' + c + '.png';
	  }

		list[4] = new Array();
		for (var c=1; c <= nway; c++ ) {
		  	list[4][c-1] = dname + 'seahorse_train' + c + '.png';
		  }

	return list;
};
