$('#campground-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "search=all"
  }
  $("#campground-grid").fadeOut(400, function(){
    $.get('/campgrounds?' + search, function(data) {
      $('#campground-grid').html('');
      $("#search-message").css("visibility", "hidden");
        if(data.length < 1){
          $('#search-message').css("visibility", "visible");
        } else {
          $("#campground-grid").fadeIn(400);
        }
        data.forEach(function(campground) {
          $('#campground-grid').append(`
            <div class="col-md-4 col-sm-6 campground-card">
              <div class="img-thumbnail">
                <img class="img-fluid" src="${ campground.image }">
                <div class="caption">
                  <h5>${ campground.name }</h5>
                </div>
                <p>
                  <a href="/campgrounds/${ campground._id }" class="btn btn-sm btn-primary"><i class="fa fa-info-circle" aria-hidden="true"></i> More Info</a>
                </p>
              </div>
            </div>
          `);
        });
    });
  });
});

$('#campground-search').submit(function(event) {
  event.preventDefault();
});
