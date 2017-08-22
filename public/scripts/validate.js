$("#image-search").on("input", function(){
  var imageSource = $(this).val();
  $(".form-group img").attr("src" , imageSource);

  $(".form-group img").on('load', function(e){
    $(".form-group p").html("")
  }).on('error', function(e) {
    $(".form-group img + p").html("Error: Please enter a valid image URL.");
    $("#form").on("submit", function(e){
      e.preventDefault();
      $(".form-group button + p").html("Please fix all errors before continuing.");
    });
  });
})
