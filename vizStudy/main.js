// Timer
var time;
function pad(val) { return val > 9 ? val : "0" + val; }

function resetTime() {
    time = Date.now();
}

timer = setInterval(function () {
    setTimeout(function () {
        var timediff = Math.floor((Date.now() - time) / 1000);
        document.getElementById("seconds").innerHTML = pad(timediff % 60);
        document.getElementById("minutes").innerHTML = pad(parseInt(timediff / 60, 10));

    }, 0);
}, 1000);

// end Timer

// Global variables
var curr_exp = -1;
var item_answers = [];
var user_answer_list = [];
var data_val = {}  // store each example data in this array to be stored in csv

Shuffle = function (o) {
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

// Text input per example
var answers_file = 'text/answers.json';
var viz_file = 'text/viz.json';
var examples = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];

// Shuffled list of experiments
var textOrder = Shuffle(examples);

// Toggling submit button
function enableAnswer()
{
    var text = document.getElementById('reason').value;
    if(text.length >= 30){
        document.getElementById('answerBtn').setAttribute("disabled", false);
    } else {
        document.getElementById('answerBtn').setAttribute("disabled", true);
        alert(text.length);
    }
}

function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function loadData() {
    $('#startBtn').show();
    $('#nextBtn').hide();
    // Populate possible answers
    readTextFile(answers_file, function (data1) {
        var ans_list = JSON.parse(data1);
        for (var i = 0; i < ans_list.length; i++) {
            var individual_answers = [];
            for (var j = 0; j < 4; j++) {
                individual_answers.push('<option value="' + (j + 1) + '">' + ans_list[i][(j + 1).toString()] + '</option>');
            }

            user_answer_list.push(individual_answers);
        }
    });
}

function startExperiment() {
    $('#instructions').hide();
    $('#startBtn').hide();
    $('#timer').show();
    $('#exampleid').show();
    // Setting up the first experiment
    $("#showOptionsBtn").show();
    $('#nextBtn').show();

    data_val["example-order"] = examples;
    next();
    startTime = new Date();
}

function next() { // This function will figure out which tab to display
    // Defining array variables in order to vary the condition
    var arr_none = [1, 5, 9, 13];
    var arr_qa = [2, 4, 6, 8, 10, 12, 14, 16];
    var arr_viz = [3, 4, 7, 8, 11, 12, 15, 16];
    var curr_dictionary = {};
    resetTime();
    curr_dictionary["start_time"] = Date.now();

    // Resetting display
    $('#all-buttons').hide();
    $('#dropdown').hide();
    // Resetting answer buttons
    $('#showOptionsBtn').show();
    $('#user-input').hide();

    // To refresh buttons for the new example
    document.getElementById("visual-buttons").innerHTML = '';
   // document.getElementById('answerBtn').setAttribute("disabled", true);
    // To refresh answer field
    document.getElementById('answer').innerHTML = '';

    curr_exp = curr_exp + 1;
    var curr_id = examples[curr_exp];
    if (curr_exp > 0) {
        $("#conv_set" + examples[curr_exp - 1].toString()).hide();
        $("#img_set" + examples[curr_exp - 1].toString()).hide();
    }

    if (curr_exp === 16) {
        exit_to_survey();
    }
    else {
        document.getElementById('serialno').innerHTML = curr_exp.toString();
        document.getElementById('serialno').innerHTML += " " + curr_id.toString();

        $("#conv_set" + curr_id.toString()).show();
        $("#img_set" + curr_id.toString()).show();

        if (arr_none.indexOf(curr_id) == -1) {
            $('#all-buttons').show();
        }

        // Add condition to check if q&a needs to be shown
        if (arr_qa.indexOf(curr_id) != -1) {
            $('#dropdown').show();
            item_answers = [];
            $("#question-answer").innerHTML = '';
            curr_dictionary["questions"] = [];
            curr_dictionary["questions_time"] = [];

            // Reading json file to populate questions list
            file2 = 'text/' + curr_id.toString() + '.json';
            readTextFile(file2, function (text) {
                var items = [];
                var qna = JSON.parse(text);
                for (var i = 0; i < qna.length; i++) {
                    items.push('<option value="' + i + '">' + qna[i]["Question"] + '</option>');
                    item_answers.push(qna[i]["Answer"]);
                }

                $('#question-answer').html(items.join(' '));
            });
        }

        // Adding condition to check if visualization is part of it
        if (arr_viz.indexOf(curr_id) != -1) {
            $('#visual-buttons').show();
            curr_dictionary["viz"] = [];
            curr_dictionary["viz_time"] = [];

            // Reading json file to create visualization buttons
            readTextFile(viz_file, function (text1) {
                var items = [];
                var viz_options = JSON.parse(text1);
                var jobject = viz_options.find(item => item.id === curr_id);
                for (var x = 0; x < jobject.values.length; x++) {
                    var button1 = create_button(curr_id, jobject.values[x]);
                    document.getElementById("visual-buttons").appendChild(button1);
                }
            });
        }

        // Showing final answer options
        $('#user-input-options').show();

        // Populate example-level-answers
        $('#user-answer').html((user_answer_list[curr_id - 1]).join(' '));

        data_val[curr_id] = curr_dictionary;
    }
}

function create_button(curr_id, text_value) {
    var button1 = document.createElement("button");
    button1.setAttribute("class", "btn");
    button1.type = "button";
    var t = document.createTextNode(text_value);
    button1.addEventListener("click", function () {
        change_image(curr_id, text_value);
    });
    button1.appendChild(t);
    return button1;
}

function change_image(curr_id, textContent) {
    var src = "";
    switch (textContent) {
        case "Show annotations": src = "images/img_" + curr_id + "_annotations.png";
            break;
        case "Show original": src = "images/img_" + curr_id + ".png";
            break;
        case "Show clear": src = "images/img_" + curr_id + "_clear.png";
            break;
        case "Show free": src = "images/img_" + curr_id + "_free.png";
            break;
        case "Show matched": src = "images/img_" + curr_id + "_matched.png";
            break;
        case "Show occupied": src = "images/img_" + curr_id + "_occupied.png";
            break;

    }
    document.getElementById("img_set" + curr_id).setAttribute("src", src);    
    data_val[curr_id]["viz"].push(textContent);
    data_val[curr_id]["viz_time"].push(Date.now());
}

function printAnswer(option) {
    curr_id = examples[curr_exp];
    data_val[curr_id]["questions"].push($("#question-answer option:selected").text());
    data_val[curr_id]["questions_time"].push(Date.now());
    document.getElementById("answer").innerHTML = item_answers[document.getElementById("question-answer").value];
}

function readyToAnswer() {
    $('#showOptionsBtn').hide();
    $('#user-input').show();
    curr_id = examples[curr_exp];
    //var x = JSON.stringify(data_val["example-order"]);
    // var x = 'yt=test';
    // var request = new XMLHttpRequest();
    // var URL = "save_data.php?data=" + encodeURI(x);
    // request.open("POST", URL);
    // request.setRequestHeader("Content-Type",
    //                          "text/plain;charset=UTF-8");
    // request.send();
    // $.ajax({
    //     type: "GET",
    //     url: "/save_data.php",
    //     data: {Imgname:'16'},
    //     success: function(data){ //response param
    //         alert(data);
    //     }
    //     });
        // .done( function(data) {
        //     alert('This was sent back: ' + data);
        // }).fail(function() {
         
        //     // just in case posting your form failed
        //     alert( "Posting failed." );
             
        // });
    $.post('save_data.php',{imgname: 'preeti', imghell: "god i hate this"},
    function(data,status){
        var a = data;
    });

    return false;
}

function submitAnswer() {
    curr_id = examples[curr_exp];
    data_val[curr_id]["final_answer"] = $("#user-answer").val();
    data_val[curr_id]["final_time"] = Date.now();
    next();
}

function exit_to_survey() {
    window.location.href = "exitsurvey.html";
}