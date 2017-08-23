
var campgroundID = window.location.href.slice(34);

$(".starability-grow label").on("click", function() {
  var userRating = $(this).prev()[0].value;

  $.ajax({
    url: "/campgrounds/" + campgroundID + "/ratings",
    type: 'POST',
    data: {rating:userRating},
    timeout: 5000,
    success: function(data) {
      $(".starability-grow").fadeOut(600, "linear", function() {
        $.ajax({
          url: "/campgrounds/" + campgroundID,
          cache: false,
          success: function(rating){
            $("#average-rating").text("Average Rating: " + rating + " stars")
          }
        });
        $("#rating-message").text("Thank you for your feedback.");
      });
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log("Error, status = " + textStatus + ", " + "error thrown: " + errorThrown);
    }
  })
});

