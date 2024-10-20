function displayStories() {
  $.ajax({
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "GET",
    dataType: "json",
    success: handleResponse,
    error: function (error) {
      console.error("Error fetching stories:", error);
    },
  });
}

function handleResponse(data) {
  var storiesList = $("#storiesList");
  storiesList.empty();

  $.each(data, function (index, story) {
    storiesList.append(
      `<div class="mb-3">
            <h3>${story.title}</h3>
            <div>${story.body}</div>  <!-- 'body' instead of 'content' -->
            <div>
                <button class="btn btn-info btn-sm mr-2 btn-edit" data-id="${story.id}">Edit</button>
                <button class="btn btn-danger btn-sm mr-2 btn-del" data-id="${story.id}">Delete</button>
            </div>
        </div>
        <hr />`
    );
  });
}

function deleteStory() {
  let storyId = $(this).attr("data-id");
  $.ajax({
    url: "https://jsonplaceholder.typicode.com/posts/" + storyId,
    method: "DELETE",
    success: function () {
      // Remove the story from the list immediately after deletion
      $(`[data-id='${storyId}']`).closest('.mb-3').remove();
    },
    error: function (error) {
      console.error("Error deleting story:", error);
    },
  });
}

function handleFormSubmission(event) {
  event.preventDefault();
  let storyId = $("#createBtn").attr("data-id");
  var title = $("#createTitle").val();
  var content = $("#createContent").val();

  if (storyId) {
    // Update the story
    $.ajax({
      url: "https://jsonplaceholder.typicode.com/posts/" + storyId,
      method: "PUT",
      data: { title, body: content },  
      success: function () {
        // Update the story in the list
        $(`#storiesList [data-id='${storyId}']`).closest('.mb-3').replaceWith(
          `<div class="mb-3">
              <h3>${title}</h3>
              <div>${content}</div>
              <div>
                  <button class="btn btn-info btn-sm mr-2 btn-edit" data-id="${storyId}">Edit</button>
                  <button class="btn btn-danger btn-sm mr-2 btn-del" data-id="${storyId}">Delete</button>
              </div>
          </div>
          <hr />`
        );
        clearForm(); // Clear the form after update
      },
      error: function (error) {
        console.error("Error updating story:", error);
      },
    });
  } else {
    // Create a new story
    $.ajax({
      url: "https://jsonplaceholder.typicode.com/posts",
      method: "POST",
      data: { title, body: content },  
      success: function (data) {
        // Add the new story to the list
        $("#storiesList").prepend(
          `<div class="mb-3">
              <h3>${title}</h3>
              <div>${content}</div>
              <div>
                  <button class="btn btn-info btn-sm mr-2 btn-edit" data-id="${data.id}">Edit</button>
                  <button class="btn btn-danger btn-sm mr-2 btn-del" data-id="${data.id}">Delete</button>
              </div>
          </div>
          <hr />`
        );
        clearForm(); // Clear the form after creation
      },
      error: function (error) {
        console.error("Error creating story:", error);
      },
    });
  }
}

function editBtnClicked(event) {
  event.preventDefault();
  let storyId = $(this).attr("data-id");
  $.ajax({
    url: "https://jsonplaceholder.typicode.com/posts/" + storyId,
    method: "GET",
    success: function (data) {
      console.log(data);
      $("#clearBtn").show();
      $("#createTitle").val(data.title);
      $("#createContent").val(data.body); 
      $("#createBtn").html("Update");
      $("#createBtn").attr("data-id", data.id);
    },
    error: function (error) {
      console.error("Error fetching story:", error);  
    },
  });
}

// Clear the form and reset buttons
function clearForm() {
  $("#clearBtn").hide();
  $("#createBtn").removeAttr("data-id");
  $("#createBtn").html("Create");
  $("#createTitle").val("");
  $("#createContent").val("");
}

$(document).ready(function () {
  displayStories();

  $(document).on("click", ".btn-del", deleteStory);
  $(document).on("click", ".btn-edit", editBtnClicked);

  // Create Form Submission
  $("#createForm").submit(handleFormSubmission);

  // Clear form button
  $("#clearBtn").on("click", function (e) {
    e.preventDefault();
    clearForm();
  });
});
