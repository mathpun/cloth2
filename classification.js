//
// Simple 20-way classificiation task
//
// Special HTML parameters:
//   randomize: (true/false), do we want to randomize the order of the training choices on each particular trial?
//   feedback: (true/false), default is true (feedback is always provided for the practice trials)
//   ntrials: (int) number of trials (12 or less)
//   use_exclude: (true/false) use the exclude list?
//
// HTML parameters accepted:
//   exclude: (string) aaa,bbb,ccc,...   a list if comma-separated strings of workerIds to exclude as subjects
//   workerId: (string) workedId (as supplied by turk)
//   condition: (string) manually set condition of experiment (otherwise random)
//   debug: (true/false) if true, print data to the browser rather than to turk
//   skip_quiz: (true/false) if true, skip the quiz of the instructions
//   skip_survey: (true/false) if true, skip the survey at the end
//
// Input must include:
//   spec.list_condition: must be an array of strings naming the possible conditions
//
var classification = function (spec,my) {

	// PRIVATE VARIABLES
	my = my || {};

	// INHERIT FROM THE BASIC TASK
	var that = super_task(spec,my);
	var super_start_main_exp = my.superior('start_main_exp');
	var super_check_survey = my.superior('check_survey');

	// PARAMETERS
	my.feedback_on = true; // display feedback after each trial?
	my.random_choices = false; // randomize order of training image choices?
	my.size_img  = 200; // size of the images


	my.trial_num = 0;  // current trial number
    my.trial_type = new Array(); // ground truth type of each trial
    my.trial_resp = new Array(); // subject's guess about the trial type
    my.trial_correct = new Array(); // was the response correct?
    my.trial_show = new Array(); // what "test image" was shown as the example?

    my.trial_practice = new Array();
    my.acc = 0; // accuracy during the experiment
    my.num_trials; // total number of trials
    my.ntrials_override;
    my.ndemo; // how many of those trials are practice trials

	my.list_imgs_train = new Array(); // list of list of 20 training images
	my.imgs_test = new Array(); // list of test images
	my.selected_id = -1; // which image is currently selected?

	my.div_stimulus = 'stimulus';
	my.div_pload = 'pload';
	my.div_train = 'itrain';
	my.div_test = 'itest';
	my.class_ntrials = 'ntrials';
	my.class_nopts = 'nopts';
	my.pre = 'pre';
	my.div_button_to_quiz = 'to_quiz';
	my.div_button_accept = 'accept_button';
	my.div_button_next = 'next_button';
	my.div_message = 'message';
	my.div_header = 'header';

	// messages
	my.msg_correct = '<font size="5"><font color="#FF1493">You got it!</font>';
	my.msg_incorrect = '<font size="5"><font color="#FF1493">Sorry! The right answer is shown in </font><font size="5" color="blue">blue</font>';

	// css classes
	my.css_cell_type = 'bordered_cell';
	my.css_normal_border = 'image_thick_border'; // normal image option
	my.css_select_border = 'image_highlight'; // the selected answer
	my.css_correction_border = 'image_correct'; // the right answer

	// constructor
	(function () {

		// randomize the order of the training choices?
		my.check_bin_param(my.url.param('randomize'));
		if (my.url.param('randomize') !== undefined) {
			my.random_choices = (my.url.param('randomize') === "true");
		}
		// process URL parameters
		if (my.url.param('ntrials') !== undefined) {
   			my.ntrials_override = parseInt(my.url.param('ntrials')); // override for how many trials
		}
		my.check_bin_param(my.url.param('feedback'));
		if (my.url.param('feedback') !== undefined) {
			my.feedback_on = (my.url.param('feedback') === "true"); // should we give feedback?
		}
		if (!my.feedback_on) {
		 $("#feedback_insturct").text('Feedback is provided for just the first few responses.');
		}

	})();

	// start experiment
    my.start_main_exp = function () {

        // load and protect images
        var grandimgs = my.preloader.get_images();
        var glen = grandimgs.length;
        my.imgs_test = grandimgs[glen-1];
        my.list_imgs_train = grandimgs.slice(0,glen-1);
        my.imgs_test = my.resize_and_protect(my.imgs_test,my.size_img);
        for (var i=0; i<my.list_imgs_train.length; i++) {
            my.list_imgs_train[i] = my.resize_and_protect(my.list_imgs_train[i],my.size_img);
        }

    	super_start_main_exp();
    	my.advance_trial();
    };

    // advance the trial to the next one
    my.advance_trial = function () {
    	my.trial_num++;
    	if (my.trial_num > my.num_trials) {
    		my.experiment_done();
    		return;
    	}
    	my.selected_id = -1;
    	$('#'+my.div_button_accept).attr('style','display:none;');
    	$('#'+my.div_button_next).attr('style','display:none;');
    	$('#'+my.div_message).text('');
    	my.display_trial();
    };

    my.compute_accuracy = function () {
    	for (var i=1; i<= my.num_trials; i++) {
    		indx_trial = i-1;
    		my.acc += my.trial_correct[indx_trial];
    	}
    	my.acc = my.acc / my.num_trials * 100;
    };

    // experiemnt is done, so we should load the survey
    my.experiment_done = function () {
        my.compute_accuracy();
        $('#acc').text(Math.round(my.acc));
        that.load_survey();
    };

    // wrap a training image DOM object in a new table cell
    var new_cell = function (obj,id) {
    	var td = $('<td/>').attr('class','bordered_cell').attr('id','cell'+id);
    	return $(td).append( $(obj).attr('id','train'+id).attr('onclick', 'task.select_image("train' + id + '");') );
    };

    // is this unicode value a number or not?
    var is_number = function (unicode) {
    	return ((unicode >= 48) && (unicode <=57));
    };

    // extract the "class number" from a file name
   	var extract_num = function (str) {
   		var indx = str.search('.png')-1;
   		var num = str.charAt(indx);
   		indx--;
   		while (is_number(str.charCodeAt(indx))) {
   			var c = str.charAt(indx);
   			num = c.concat(num);
   			indx--;
   		}
   		return num;
   	};

    // from two file names (or image objets),
    // are the images from the same class?
    // this relies on naming convensions "train5" vs. "test5"
    var is_same_class = function (obj1,obj2) {
    	if (typeof obj1 !== 'string') {
    		var fn1 = $(obj1).attr('src');
	    	var fn2 = $(obj2).attr('src');
    	}
    	else {
    		var fn1 = obj1;
    		var fn2 = obj2;
    	}
    	var iseq = extract_num(fn1) === extract_num(fn2);
    	return iseq;
    };

    // display a trial
    my.display_trial = function () {

    	var indx_trial = my.trial_num-1;

    	$('#'+my.div_header).text('Trial ' + my.trial_num + ' of ' + my.num_trials);

    	// display the TEST image
    	var testcell = $('<td/>').attr('class','bordered_cell');
    	var itest = my.imgs_test[indx_trial];
    	$('#' + my.div_test).html($(testcell).append(itest));

    	// display the K TRAINING images
    	var imgs_train = my.list_imgs_train[indx_trial];
    	var n = imgs_train.length; // number of images
    	var ncol = Math.ceil(Math.sqrt(n));

    	// build table to display the images
    	var table = $('<table/>').attr('class','nospace');
    	var row = $('<tr/>');
    	var row_count = 1;
    	my.trial_type[indx_trial] = '';
    	my.trial_show[indx_trial] = $(itest).attr('src');
    	my.trial_practice[indx_trial] = (my.trial_num <= my.ndemo); // is this a practice trial?

    	for (var i=0; i<imgs_train.length; i++) {
    		var itrain = imgs_train[i];
    		row = $(row).append(new_cell(itrain,i+1));
    		row_count++;
    		if (i === imgs_train.length-1 || row_count > ncol) { // if last trial or row is complete
    			table = $(table).append(row);
    			row = $('<tr/>');
    			row_count = 1;
    		}

    		// mark what the correct answer is
    		if (is_same_class(itrain,itest)) {
    			 if (my.trial_type[indx_trial] === '') {
    			 	 // file name of the training image that we want them to select
    				 my.trial_type[indx_trial] = $(itrain).attr('src');
    			 }
    			 else {
    			  	 throw new Error('there should only be one match per trial');
    			 }
    		}

    	}
    	$('#' + my.div_train).html(table);
    };

    // for all of the training images, make sure they are no longer clickable
    my.clear_onclick = function () {
    	var indx_trial = my.trial_num-1;
    	var imgs_train = my.list_imgs_train[indx_trial];
    	for (var i=1; i<=imgs_train.length; i++) {
    		$('#train'+i).attr('onclick','');
    	}
    };

    // display feedback about the right answer
    my.display_feedback = function () {
    	my.clear_onclick();
    	var indx_trial = my.trial_num-1;
    	var fn1 = my.trial_type[indx_trial];
    	var fn2 = my.trial_resp[indx_trial];
    	is_correct = is_same_class(fn1,fn2);
    	if (is_correct) {
    		$('#'+my.div_message).html(my.msg_correct);
    	}
    	else {
    		$('#'+my.div_message).html(my.msg_incorrect);
    		var itest = my.imgs_test[indx_trial];
    		var imgs_train = my.list_imgs_train[indx_trial];
    		for (var i=0; i<imgs_train.length; i++) {
    			var itrain = imgs_train[i];
    			if (is_same_class(itest,itrain)) {
    				$(itrain).attr('onclick','');
    				$(itrain).attr('class',my.css_correction_border);
    			}
    		}
    		// var iright = extract_num(fn1);
    	}
    	$('#'+my.div_button_accept).attr('style','display:none;');
    	$('#'+my.div_button_next).attr('style','');
    };

	my.resize_and_protect = function (image_objects,size_img) {
		image_objects = tu.protectImages(image_objects);
		$(image_objects).attr('width',size_img).attr('height',size_img);
		$(image_objects).attr('class',my.css_normal_border);
		return image_objects;
	};

    // display the percent of images loaded
	my.display_perc_loaded = function (perc) {
		$('#'+my.div_pload).html(perc);
	};

	// display failure in loading
	my.display_load_error = function () {
		var str = 'I am very sorry, there was an error loading the images. Please email <b>brenden@mit.edu</b> to report this problem.';
		$('#'+my.pre).html(str);
		tu.changeDisplay('',my.div_class);
		throw new Error('failure loading image');
	};

    // print all the trial by trial data
    my.print_trial_data = function () {
    	my.txt = my.txt + "s.acc = " + my.acc + "; ";
    	my.txt = my.txt + "s.var_feedback = " + my.feedback_on + "; ";
        for (var i = 0; i < my.num_trials; i++) {
           	my.print_single_trial(i);
        }
    };

    // print the response of a single trial in matlab format
    my.print_single_trial = function (jsi) {
    	var mati = jsi+1;
    	my.txt = my.txt + 's.stimulus{' + mati + "} = '" + my.trial_show[jsi] + "';";
    	my.txt = my.txt + 's.type{' + mati + "} = '" + my.trial_type[jsi] + "';";
        my.txt = my.txt + 's.resp{' + mati + "} = '"+ my.trial_resp[jsi] + "';";
        my.txt = my.txt + 's.correct(' + mati + ') = ' + my.trial_correct[jsi]+ ';';
        my.txt = my.txt + 's.practice(' + mati + ') = ' + my.trial_practice[jsi]+ ';';
    };

    // public method
    //
    //  data should contain:
    //    .imglist_test
    //	  .imglist_list_train
    //
    that.select_image = function (train_img_id) {
    	 var indx_trial = my.trial_num-1;
    	 $('#'+my.selected_id).attr('class',my.css_normal_border);
    	 my.selected_id = train_img_id;
    	 $('#'+my.selected_id).attr('class',my.css_select_border);
    	 my.trial_resp[indx_trial] = $('#'+my.selected_id).attr('src');
    	 my.trial_correct[indx_trial] = is_same_class(my.trial_resp[indx_trial],my.trial_type[indx_trial]);
    	 $('#'+my.div_button_accept).attr('style','');
    };

    // triggered when participant confirms their selected categorization choice
    that.accept_choice = function () {
    	var indx_trial = my.trial_num-1;
    	var is_practice = my.trial_practice[indx_trial];
    	if (is_practice || my.feedback_on) {
    		my.display_feedback();
    	}
    	else {
    		my.advance_trial();
    	}
    };

    // triggered when participant is done seeing feedback, and wants to move to the next trial
    that.next_trial = function () {
    	my.advance_trial();
    };

	that.load_images = function (data) {

		var len = data.imglist_test.length;
		my.ndemo = data.imglist_demo.length;
		my.num_trials = len + my.ndemo;
		if (my.ntrials_override > 0) {
			if (my.ntrials_override > my.num_trials) {
    			var str = 'URL parameter ntrials: the maximum number of trials is ' + my.num_trials;
    			my.throw_error(str);
    		}
    		my.num_trials = my.ntrials_override;
    	}

		$('.'+my.class_ntrials).text(my.num_trials);
		$('.'+my.class_nopts).text(data.imglist_list_train[0].length);

		// apply permutation
		var perm = tu.randperm(0,len-1);
		data.imglist_test = tu.apply_perm(data.imglist_test,perm);
		data.imglist_list_train = tu.apply_perm(data.imglist_list_train,perm);

		// add the demo ontop of things
		data.imglist_test = data.imglist_demo.concat(data.imglist_test);;
		data.imglist_list_train = data.imglist_list_demo.concat(data.imglist_list_train);

		// select subset of trials
		if (my.ntrials_override > 0) {
			data.imglist_test = data.imglist_test.slice(0,my.num_trials);
			data.imglist_list_train = data.imglist_list_train.slice(0,my.num_trials);
		}

		// for each trial, randomize the order of the training images
		if (my.random_choices) {
			for (var i=0; i<data.imglist_list_train.length; i++) {
				data.imglist_list_train[i] = tu.shuffle(data.imglist_list_train[i]);
			}
		}

		var grandlist = data.imglist_list_train;
		grandlist.push(data.imglist_test);
		my.preloader = image_preloader(grandlist,my.start_main_exp,my.display_load_error,my.display_perc_loaded);
	};

	return that;
};

//Prevent screen from being scrollable - kids scroll too much
$('body').bind('touchmove', function(e){
  e.preventDefault();
});
