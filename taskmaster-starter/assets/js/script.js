var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  
    var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});


// i added this to be able to click on the text area
$(".list-group").on("click", "p", function() {
  var text = $(this)
    .text()
    .trim();
  console.log(text);

// this will allow it to become a text area
  var textInput = $("<textarea>")
  .addClass("form-control")
  .val(text);
// this turns it into a highlighted input box with 'focus'
  $(this).replaceWith(textInput);
  textInput.trigger("focus");

});

// blur event will trigger as soon as the user interacts with anything other than the <textarea> element
$(".list-group").on("blur", "textarea", function(){
  // get the teatareas current value/text
  var text = $(this)
    .val();
    //.trim();
//debugger; 
  // get the parent ul id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest("list-group-item")
    .index();

  tasks[status][index].text = text;
  saveTasks();

  //recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace text area with p element
  $(this).replaceWith(taskP);
});



//due date was clicked
$(".list-group").on("click", "span", function(){
  //get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  //swap out element
  $(this).replaceWith(dateInput);

  //enable jquery ui datepicker
  dateInput.datepicker({
    minDate: 1,
    onClose: function() {
      // when calendar is closed, force a "change" event on the `dateInput`
      $(this).trigger("change");
    }
  });

  //automatically focus on new element
  dateInput.trigger("focus");

  // value of due date was changed
  $(".list-group").on("change", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);

    // Pass task's <li> element into auditTask() to check new due date
    auditTask($(taskSpan).closest(".list-group-item"));
  });

});


// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});


// this is were the lists are made sortable
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  // activate: ".dropover",
  // deactivate: ".dropover",
  // over: ".dropover-active",
  // out: ".dropover-active",


  update: function(event) {
  // array to store the task data in
  var tempArr = [];

  // loop over current set of children in sortable list
  $(this).children().each(function() {
    var text = $(this)
      .find("p")
      .text()
      .trim();

    var date = $(this)
      .find("span")
      .text()
      .trim();

    // add task data to the temp array as an object
    tempArr.push({
      text: text,
      date: date
    });
  });
  console.log(tempArr);

  //trim down list's ID to match object property
  var arrName = $(this)
  .attr("id")
  .replace("list-", "");

  //update array on tasks object and save
  tasks[arrName] = tempArr;
  saveTasks();
}
});

// trash div that allows the groups it can delete
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) {
    ui.draggable.remove();
    console.log("drop");
  },
  over: function(event, ui) {
    console.log("over");
  },
  out: function(event, ui) {
    console.log("out");
  }
});

// date picker
$("#modalDueDate").datepicker({
  // this sets the last day you can pick
  minDate: 1  
});


var auditTask = function(taskE1) {
  // get date from task element
  var date = $(taskE1).find("span").text().trim();
  // ensure it works
  console.log(date);

  // convert to moment object at 5:00pm
  var time = moment(date, "L").set("hour", 17);
    // this should print out an object for the value of the date variable, but at 5:00pm of that date
    console.log(time);

  $(taskE1).removeClass("list-group-item-warning list-group-item-danger");

  //apply new class if task is near/over due date
  if (moment().isAfter(time)) {
    $(taskE1).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <=2) {
    $(taskE1).addClass("list-group-item-warning");
  }




};

  // this will save the page every 30 minutes
  setInterval(function() {
    $(".card .list-group-item").each(function(index, el) {
      auditTask(el);
    });
    
  }, (1000 * 60) * 30);

  


// load tasks for the first time
loadTasks();

