//Firebase setup ------------------------------------------------------
var config = {
    apiKey: "AIzaSyB2GdNM2sv4c3_biodPrXtZFxhRcEqNFqE",
    authDomain: "restaurant-roulette-dcc68.firebaseapp.com",
    databaseURL: "https://restaurant-roulette-dcc68.firebaseio.com",
    storageBucket: "restaurant-roulette-dcc68.appspot.com",
    messagingSenderId: "866118824428"
     };


  firebase.initializeApp(config);
   var database = firebase.database();
   var user = firebase.database().ref("user");

//Global objects -------------------------------------------------------
// Object that stores Ajax search parameter
var input = {};

// Object that stores email and password
var subscriber = {};

var coordinates = 
{
	lat: undefined,
	lng: undefined
};

//Global arrays --------------------------------------------------

// array to hold cusine selected by customer
var cuisineInp = [];

// array to house some of the cuisine options at yelp
var yelpCuisine = ["American New", "American Traditional", "barbeque", 
"Breakfast & Brunch", "Brazilian", "Buffet", "Burgers", "Cajun", "Creole", 
"Creperie", "Chicken Wings", "Chinese", "Delis", "Fast Food", 
"Diner", "French", "German", "Greek", "Indian", "Indonesian", 
"Irish", "Italian", "Japanese", "Korean", "Mexican", "Pizza", "Sandwiches",
"Latin American", "Portuguese", "Seafood", "Southern", "Spanish", 
"Steakhouse", "Sushi", "Thai"];

//Global variables -----------------------------------------------

// email that can be stored in Firebase
var encodedEmail;

// added holds bolean that tells if a customer was added to Firebase
var added = false;

// exist is a bolean that tells if a customer successfully logged in
var exist = false;
// zip that can be used for search after validation
var zip;
// object that holds result of Yelp Ajax
var results;
// temp var that stores zip for validation
var tempZip;

// bolean to designate addt'l Ajax call with same parameters
var newRandom = false

// functions ----------------------------------------------------

// executed when the submit button is pushed
$( document ).ajaxError(function( event, jqxhr, settings, thrownError ) {
 console.log(thrownError);
});

// initiates processing of search when submit clicked
function submitRequest(){
  console.log("submit request begin");
  zip = "";
  // returns a valid zip for search based on lng/lat or user input
  determineZip();
};

// executed after a successful zip code is found 
function processRequest(){
  console.log("back from determine zip" + zip);
  // determine a cuisine for the search
  // if the user enter a cuisine, pick a random cuisine
  if (cuisineInp.length !== 0){
      randomCuisine(cuisineInp);        
      }
  // if cuisine not input by user, pick one from a list of Yelp choices
  else  {
     
      //   // do not need if yelp can search without it
      randomCuisine(yelpCuisine);
  };

  // check if user clicked new random search
  // if they did not, this is a new search  
  if (!newRandom) {
  // read the rest of variables from the screen
  retrieveData();
  } 
  else {
    newRandom = false;
  };


  // if the customer logged in, store the search in Firebase
   if (exist) {
    storeSearch();
   };
  // call Yelp ajax
  ajaxCall();
};
     


// determine zip to be used for search 
function determineZip() {
  //grab zip from the page
  tempZip = $("#zipCode").val().trim();
  console.log("determine zip: tempzip: "+tempZip+" zip from page" + $("#zipCode").val().trim());
  //if a zip was grabbed from the page, use that 
  if (tempZip !== "") {
    console.log("zip code entered and being used");
    // validate the zip grabbed from the page
    validateZip();   
  }
  // if zip wan't grabbed from page, check if location retrieved from user device
  else if (coordinates.lat !== undefined || coordinates.lng !== undefined) {
    console.log("geocode zip begin");
    // translate the coordinates of the device into a zip
    var geocoder = new google.maps.Geocoder;
    var latlng = {lat: coordinates.lat, lng: coordinates.lng};
    geocoder.geocode({'location': latlng}, function(results, status) {
    // if google maps returns a responce, process it
      if (status === 'OK') {
        // if there are valid results in the data, retrieve zip
        if (results[0]) {
          zip = results[0].address_components[6].long_name;
          if (zip === "") {
            $(".modal-title").text("Zip code required:DetermineZip2");
            $(".modal-body").text("Could not determine current location.  Please enter zip.");
            //display modal
            $("#errorModal").modal("show");
          } else
          { console.log("geocode zip found");
            // verify zip code?
            processRequest();
          };
        }
        // if there is not a valid zip returned, show error and return to input page
        else {
          $(".modal-title").text("Zip code required:DetermineZip2");
          $(".modal-body").text("Could not determine current location.  Please enter zip.");
          //display modal
          $("#errorModal").modal("show");
        };
      }
      // if google maps did not respond, show error and return to input page
      else {
         $(".modal-title").text("Zip code required: determineZip3");
         $(".modal-body").text("Could not determine current location.  Please enter zip.");
         //display modal
         $("#errorModal").modal("show");
       };
    });
  }
  // neither zip or device coordinates were available so show error
  // and return to input page
    else {
      console.log("error: zip and coordinates are not defined");
      $(".modal-title").text("Location is required: determineZip");
      $(".modal-body").text("Please enter a zip code");
      // display modal
      $("#errorModal").modal();
    };
};


// determine if the user entered zip is valid
function validateZip() {
      // search zipwise API
      var key = "n7266066g0eudmth";
      var queryURL = "https://www.zipwise.com/webservices/zipinfo.php?key=" 
      + key + "&zip=" + tempZip + "&format=json";

      //TEMPORARY - disable zipCode verification since we passed allowed limit
      $.ajax({ 
          url: queryURL,
          method: "GET"
        })
        .done(function(response) {
        // when query returned, check object for error or valid data
          if (response.results.error){
            // if error return, display error and return to input page
            $(".modal-title").text(response.results.error);
            $(".modal-body").text("You must provide a zip code to complete request.");
           // display modal
            $("#errorModal").modal("show"); 

            console.log("error: "+response.results.error);
          }
          // if error not returned, 
          // valid address was returned and ok to use
          else {
            zip = tempZip;
            // once valid zip is retrieved, continue processing request
            processRequest();
         };
       });
};


// select a random cuisine from a list of cuisines
function randomCuisine(food){
  console.log("randomizing cuisine");
  var index = Math.floor(Math.random(food.length)*food.length);
   cuisine = food[index];
   console.log(cuisine + food[index]);
};

// Retrieve rest of data for search
function retrieveData(){

  // +++++++++++++++++++++++++NEED TO RETRIEVE CUISINE
  var radius = $("#radiusBtn").data("value");
  var rating = $("#ratingBtn").data("value");
  var price = $("#priceBtn").data("value");
  // if any of the optional variables were not input,
  // change setting for Firebase storage
  if (rating === undefined){
    rating = "1";
  };
  if (radius === undefined){
    radius = "32000";
  };
  if (price === undefined){
    price = "1";
  };
  // put all search parameters into object for use
  input = {
	cuisine: cuisine,
  zip: zip,
	radius: radius,
	rating: rating,
	price: price 
   };

//clear web selectors
// +++++++++++++++++++++++++++++++++++++++ADDCUISINE 
  $("#zipCode").val("");
  $("#radiusBtn").removeData(),
  $("#ratingBtn").removeData(),
  $("#priceBtn").removeData()
   console.log(input + " exist = " + exist);

};



// store search in firebase
function storeSearch() {
  // remove firebase invalid char from email
  encodeEmail(subscriber.email);
  console.log(encodedEmail);
     firebase.database().ref('user/' + encodedEmail + '/search').set(
    {
        cuisine: cuisineInp,
        zip: zip,
        radius: input.radius,
        rating: input.rating,
        price: input.price 
       });
    console.log("SEARCH STORED " + input);
};




// create a user in the database on sign up
function createUser(){
   console.log("createuser executing");
   console.log("1st: " + $("#signUpPass").val().trim() + "2nd: " + $("#signUpConfirmPass").val().trim() );
    // if password fields haven't been filled, show error 
    // and return to page
   if ($("#signUpPass").val() === '' && $("#signUpConfirmPass").val() === '')
   { 
    console.log("passwords blank");
     //switch content of modal to match error    
     $(".modal-title").text("Passwords Empty: CreateUser1");
     $(".modal-body").text("Password and Confirm Password cannot be left blank. Please try again.");
     //display modal
     $("#errorModal").modal("show"); 
     added = false;
   }
   //if password and confirmPassword don't match
   // show error and return to page
   else if ($("#signUpPass").val() !== $("#signUpConfirmPass").val())
   {
    console.log("passwords don't match");
     //switch content of modal to match error
     $(".modal-title").text("Password Mismatch: CreateUser2");
     $(".modal-body").text("Password and Confirm Password do not match. Please try again.");
     //display modal
     $("#errorModal").modal("show");
      added = false;
    }
   else
   { 
    console.log("passwords match");
    // passwords match so attempt firebase authorization sign up
 	  subscriber = {
      email: $("#signUpEmail").val(),
      password: $("#signUpPass").val().trim()
    };
     firebase.auth().createUserWithEmailAndPassword(subscriber.email, subscriber.password).catch(function(error) {
     console.log("createuser: password ok. checking firebase");
		  // Handle Errors here.
      // signup was not successful so change added to false
		   added = false;
		   console.log(added + " " + error);
       // display error and return to page
		   $(".modal-body").empty();
       $(".modal-body").html(error.message);
       $(".modal-title").html(error.code + " Firebase error - createUser");
       $("#errorModal").modal("show");
		  });
      // if user was added, wipe email from page
       $("#signUpEmail").val("");
   };
      //wipe values in password fields regardless if user added
     $("#signUpPass").val('');
     $("#signUpConfirmPass").val('');


   console.log("firebase auth executed.  added: " + added + "returning");
};
  


// firebase authorization sign in check
function checkUserExist() {
    //grab variables from the screen 
    subscriber = {
           email: $("#logInEmail").val().trim(),
        password: $("#logInPassword").val().trim() 
      };
      encodeEmail(subscriber.email);
     //wipe values in sign up fields
     $("#logInPassword").val("");
     $("#logInEmail").val("");
     // sign in to firebase. 
      firebase.auth().signInWithEmailAndPassword(subscriber.email, subscriber.password).catch(function(error) {
         // sign in was not successful so show error
         // and return to page
           exist = false;
           $(".modal-body").empty();
           // var tempDiv = $('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
           $(".modal-body").append(error.message);
           $(".modal-title").html(error.code + " :Firebase error - signin");
           $("#errorModal").modal("show");
           console.log(error.code + error.message);
       });

       console.log("firebase auth executed.  exist: " + exist + "returning");
};


function retrieveSearch() {
  console.log("retrieveSearch Encodedemal " +encodedEmail);
  var email = firebase.database().ref("user/" + encodedEmail);
  email.once("value")
      .then(function(snapshot) {
          if (snapshot.child("search").exists()){
            console.log("search param in database")
            var searchHist = snapshot.val().search;
           // Object {price: 2, radius: 10, rating: 4, zip: "07922"}
// searchHist.price
           }
           else {
            console.log("no search param present")
           };
        });
};


// when user signs up, add to firebase
function adduser() {
  encodeEmail(subscriber.email);
  console.log(encodedEmail);
	   firebase.database().ref('user/' + encodedEmail).set(
    {
        password: subscriber.password
       });
	  console.log("password " + subscriber.password);
};


// replace firebase invalid characters from email for storage
function encodeEmail(email) {
  // regex code to search for all "." and resplace with '%2E'
 encodedEmail = email.toLowerCase();
 encodedEmail =  encodedEmail.replace(/\./g, '%2E');

 console.log("encodeEmail: " + encodedEmail);
};

// return email to original format when retrieve from firebase
function decodeemail(email) {
   // regex code to search for all '%2E' and resplace with '.'
  return email.replace(/\%2E/g, '.');
};



// Call yelp ajax 
function ajaxCall() {
    $.ajax({
        url: 'https://floating-peak-76196.herokuapp.com/',
        type: 'GET',
        
        data: {
          term: input.cuisine,
          location: input.zip,
          radius: input.radius,
          price: input.price
        }


    }).done(function(response) {
      
        console.log(response);

        
       totalResults = response.businesses;
       
       results = response.businesses;


       results = results.filter(function(elem) {
           return elem.distance <= $("#radiusBtn").attr("data-value");
       })



       results = results.filter(function(elem) {
           return elem.rating >= input.rating;
       })



       for (var i = 0; i < results.length; i++) {
           console.log(results[i]);
       }

        //if returned array is empty return first object
       if (results.length == 0 ){
        console.log('not enough results to display');
        allResults();

       }else{
        console.log('populateResult was called')
        populateResult();

        //make result visible now that it's populated
          $("#results").animate(
            {
              opacity: 1,
            }, 1000);
      }
    });
    
};

//populate all results if nothing
function allResults(){
  console.log('allResults is being called');
  console.log(totalResults);
  if(totalResults.length == 0){
     $(".modal-title").text("No restaurants found");
     $(".modal-body").text("Search was too specific. Try changing your search criteria");
     //display modal
     $("#errorModal").modal("show");
  }else{
    //populate mobile result
    console.log("populating results");
     $("#port-img").attr("src", totalResults[0].image_url);
     $("#port-img").attr("alt", "restaurant photo");
     $("#port-name").text(totalResults[0].name);
     $("#port-address").text(totalResults[0].location.address1+" " + totalResults[0].location.city);
     $("#port-phone").text(totalResults[0].display_phone);//just check append afterwards
     $("#port-direc a").attr("href", totalResults[0].url);
     $("#port-direc a").text(totalResults[0].url);
     $("#port-rating").text(totalResults[0].rating + " STARS");
     $("#port-price").text(totalResults[0].price);
     $("#port-cat").text(totalResults[0].categories[0].title);

     //populate web result
      $("#port-img2").attr("src", totalResults[0].image_url);
      $("#port-img2").attr("alt", "restaurant photo");
      $("#port-name2").text(totalResults[0].name);
      $("#port-address2").text(totalResults[0].location.address1+" " + totalResults[0].location.city);
      $("#port-phone2").text(totalResults[0].display_phone);//just check append afterwards
      $("#port-direc2 a").attr("href", totalResults[0].url);
      $("#port-direc2 a").text("Get Directions");
      $("#port-rating2").text(totalResults[0].rating + " STARS");
      $("#port-price2").text(totalResults[0].price);
      $("#port-cat2").text(totalResults[0].categories[0].title);

      $('#photoWeb').html("<img src='"+totalResults[0].image_url+"'>");
  }
  
};

// populate Yelp data on page
function populateResult(){
 //for mobile result
 $("#port-img").attr("src", results[0].image_url);
 $("#port-img").attr("alt", "restaurant photo");

 $("#port-name").text(results[0].name);
 $("#port-address").text(results[0].location.address1+" " + results[0].location.city);


 $("#port-phone").text(results[0].display_phone);//just check append afterwards

 $("#port-direc a").attr("href", results[0].url);
 $("#port-direc a").text("Get Directions");

 $("#port-rating").text(results[0].rating + " STARS");
 $("#port-price").text(results[0].price);
 $("#port-cat").text(results[0].categories[0].title);

 //for web result
 $("#port-img2").attr("src", results[0].image_url);
 $("#port-img2").attr("alt", "restaurant photo");

 $("#port-name2").text(results[0].name);
 $("#port-address2").text(results[0].location.address1+" " + results[0].location.city);


 $("#port-phone2").text(results[0].display_phone);//just check append afterwards

 $("#port-direc2 a").attr("href", results[0].url);
 $("#port-direc2 a").text("Get Directions");

 $("#port-rating2").text(results[0].rating + " STARS");
 $("#port-price2").text(results[0].price);
 $("#port-cat2").text(results[0].categories[0].title);
};


function isNumberKey(evt)
  {
     var charCode = (evt.which) ? evt.which : event.keyCode
     if (charCode > 31 && (charCode < 48 || charCode > 57))
        return false;

     return true;
  };


// reset variables for a brand new search
function resetVar(){
  input = {};
  subscriber = {};
  cuisineInp = [];
  zip = "";
  results = undefined;
  tempZip = "";
  newRandom = false;
  };

  function SlideParameters()
  {
  		//slide parameters out if on a mobile device
        if(window.innerWidth <= 768) {
          $("#parameters").animate(
          {
              opacity: 0.3,
              right: "+=600",
          }, 1000);
        } else {
          $("#parameters").stop();
        }

        setTimeout( function(){
        	$("#parameters").css("display","none");
        }, 1000);
  }



//Run on page load ----------------------------------------------

//grab the users latitude and logitude if permitted
if (navigator.geolocation)
{
	navigator.geolocation.getCurrentPosition(function(position)
	{
		//store coordinates in object
		coordinates.lat = position.coords.latitude;
		coordinates.lng = position.coords.longitude;

		console.log(coordinates.lat);
		console.log(coordinates.lng);
	});
};




//jQuery interactivity -------------------------------------------
$(document).ready(function() {

  //slideshow function
  var slideshowArray = ["assets/images/stock1.jpg", "assets/images/stock2.jpg", "assets/images/stock3.jpg","assets/images/stock4.jpg", "assets/images/stock5.jpg"];
  var loop = 0;
  slideshow();

  function slideshow() {
      if (loop >= slideshowArray.length) {
        loop = 0;
      }
      $('#webHead').css('background-image','url("' + slideshowArray[loop++] + '")')
      .hide().fadeIn(1000);
      setTimeout(slideshow,5000);
  }

	//prevent default action for all <a> and <button> elements
	$("a, button").on("click", function(event)
	{
		event.preventDefault();
	});

	//remove parent element when "X" is clicked
	$(".close").on("click", function()
	{
		$(this).parent().slideUp(300);
	});

	//click function for radius selection
	$('#radiusDrop li').on('click', function() {
		$('#radiusBtn').html($(this).val() + " miles ");

    //convert miles into meters. yelp API requires radius in meters
    var inMeters;
    switch ($(this).val())
    {
        case 5:
          inMeters = 8047;
          break;
        case 10:
          inMeters = 16093;
          break;
        case 15:
          inMeters = 24140;
          break;
        case 20:
          inMeters = 32186;
          break;
        default:
          inMeters = 0; //shouldn't be able to reach here.
          break;
    }

		$('#radiusBtn').attr('data-value', inMeters);
	});

	//click function for rating selection
	$('#ratingDrop li').on('click', function() {
		$('#ratingBtn').html($(this).val() + " stars ");
		$('#ratingBtn').attr('data-value', $(this).val());
	});

	//click function for price selection
	$('#priceDrop li').on('click', function() {
		$('#priceBtn').html($(this).text());
		$('#priceBtn').attr('data-value', $(this).val());
	});

//--------------------------------------------------------------------------------------------------------
//function for appending the restaurant profile div to the DOM (function for mobile, function for web)
//functions are called upon clicking submit button (check line 649)
  // function mobileAppend() {
  //   //mobile appending
  //       var div1 = $('<div>')
  //       div1.addClass('col-xs-12 zeroPadSides').attr('id',"restaurant-port1")
  //       var loadGif1 = $('<img>')
  //       loadGif1.attr('src',"assets/images/loading.gif")
  //       .attr('alt',"alt")
  //       .attr('id',"loading1")
  //       .appendTo(div1)
  //       var results1 = $('<div>')
  //       results1.html(
  //       '<h3 id="port-name"></h3><p id="port-address"></p><p id="port-phone"></p><p id="port-hoo"></p><p id="port-direc"><a href="" target="_blank">Get Directions/Website</a></p><p id="port-rating"></p><p id="port-price"></p><p id="port-cat"></p>')
  //       div1.append(results1)
  //      $('.portdiv').append(div1)

  //      //loading gif animation
  //       $("#loading1").delay(800).animate(
  //       {
  //         opacity: 1
  //       }, 1000);
  // }
  //web appending
  function webAppend() {
    $('#rest-portWeb').empty(); 
    //web appending
      var div2 = $('<div>')
        div2.addClass('col-xs-12 zeroPadSides').attr('id',"restaurant-port2")
        // var loadGif2 = $('<img>')
        // loadGif2.attr('src',"assets/images/loading2.gif")
        // .attr('alt',"alt")
        // .attr('id',"loading2")
        // .appendTo(div2)
        var results2 = $('<div>')
        var image = $('<div>')
        image.html('<img id="port-img2" class="img-responsive img-rounded" src="">').appendTo(div2);
        results2.attr('id','rest-info').html(
        '<h3 id="port-name2"></h3><p id="port-address2"></p><p id="port-phone2"></p><p id="port-hoo2"></p><p id="port-direc2"><a href="" target="_blank"></a></p><p id="port-rating2"></p><p id="port-price2"></p><p id="port-cat2"></p>')
        div2.append(results2)
        $('#rest-portWeb').append(div2)

                $("#loading2").delay(800).css("z-index","4").animate(
        {
          opacity: 1

        }, 1000);
  }
//-------------------------------------------------------------------------------------------------
	// slide parameter section out, when submit button clicked
  $(document).on('click', '#submitBtn', function(event) {
      console.log("submit button clicked");
		  setTimeout(submitRequest, 1000);

		SlideParameters();

        //dynamically creates restaurant profile div
        // mobileAppend();
        webAppend();

        // animation for restaurant profile
        $("#restaurant-port2").animate(
        {
          opacity: 1,
          left: "0"
        }, 1000);

        //if on a mobile, display the results in mobile layout
        if (window.innerWidth < 768)
        	$("#results").css("display", "block")


        // setTimeout(function()
        // {
        //   $("#results").css("display", "block");
        // }, 1000);
        // $("#results").animate(
        // {
        // 	opacity: 1,
        // }, 1000);
        

        //animation for post result buttons
        $("#post-results").css("display","block").animate(
        {
          opacity: 1,
        }, 1000);

        //loading gif animation
        $("#loading").delay(800).animate(
        {
        	opacity: 1
        }, 1000);

    });


    //click function for New Search
    $(document).on('click', '#new-search' , function(event) {
    	event.preventDefault();
      resetVar();
    	
      //will fade restaurant prof back
      $("#results").animate(
        {
        opacity: 0
        }, 500);
      setTimeout(function()
      {
        $("#results").css("display", "none");
      },550);

    	//will shift params back to screen
    	$("#parameters").css("display","block").animate(
    	{
    		opacity: 1,
    		right: "0"
    	}, 1000);

      //will fade out post results
      $("#post-results").animate(
      {
        opacity: 0
      }, 500);
    });

    //click function for New Random
    $(document).on('click', '#new-random' , function(event) {
    	event.preventDefault();
      newRandom = true;
      processRequest();

    	//loading will take place
    	// var load = $('<img src="assets/images/loading.gif" alt="loading.gif" id="loading">')
    	// $('#restaurant-port').append(load)
    	
    	//will do AJAX call for new random
  //   	$.ajax({
		// 	url: queryURL,
		// 	method: "GET"
		// }).done(function(response) {
  //   	})
    });


  //show or hide signUpFields when "Sign Up" button clicked
  $("#signUpBtn").on("click", function()
  {
 		//check if log in button is active
 		if ($("#logInBtn").attr("is-active") === "true")
 		{
 			//set to inactive
 			$("#logInBtn").attr("is-active", "false");
 			//hide log in fields from display
 			$("#logInFields").css("display", "none");
 			//change class to show it's inactive
 			$("#logInBtn").removeClass("btn-primary");
 			$("#logInBtn").addClass("btn-default");
 		}
 		//check if sign up button is not active
 		if ($("#signUpBtn").attr("is-active") === "false")
 		{
 			//set to active
 			$("#signUpBtn").attr("is-active", "true");
 			//reveal the sign in fields
 			$("#signUpFields").slideDown(300);
 			//change class of button to show it's active
 			$("#signUpBtn").removeClass("btn-default");
 			$("#signUpBtn").addClass("btn-primary");
 		}
 		else //if it was active, deactivate it
 		{
 			$("#signUpBtn").attr("is-active", "false")
 			$("#signUpFields").slideUp(300);
 			//change class to show it's inactive
 			$("#signUpBtn").removeClass("btn-primary");
 			$("#signUpBtn").addClass("btn-default");
 		}
  });

  //show or hide logInFields when "Log In" button clicked
  $("#logInBtn").on("click", function()
  {
  		//check if sign in button is active
  		if ($("#signUpBtn").attr("is-active") === "true")
  		{
  			//set to inactive
  			$("#signUpBtn").attr("is-active", "false");
  			//hide sign up fields from display
  			$("#signUpFields").css("display", "none");
  			//change class to show it's inactive
 			$("#signUpBtn").removeClass("btn-primary");
 			$("#signUpBtn").addClass("btn-default");
  		}
  		//check if log in button is not active
  		if ($("#logInBtn").attr("is-active") === "false")
  		{
  			//set to active
  			$("#logInBtn").attr("is-active", "true");
  			//reveal the log in fields
  			$("#logInFields").slideDown(300);
  			//change class of button to show it's active
 			$("#logInBtn").removeClass("btn-default");
 			$("#logInBtn").addClass("btn-primary");
  		}
  		else //if it was active, deactivate it
 		{
 			$("#logInBtn").attr("is-active", "false")
 			$("#logInFields").slideUp(300);
 			//change class to show it's inactive
 			$("#logInBtn").removeClass("btn-primary");
 			$("#logInBtn").addClass("btn-default");
 		}
  });

  //click function for signup credentials
	$(document).on('click', '#signUpSubmit', function(event) {
	   added = true;
	   createUser();
	   console.log("added after checking firebase: " + added);
	    if (added) {
	    	console.log("user was added");
       $(".modal-title").text("Success!");
       $(".modal-body").text("Sign Up successful! Click the 'Log In' button to log in!");
       //display modal
       $("#errorModal").modal();
	    	adduser();
	    };		
	});


	//click function for grabbing login credentials
	$('#logInSubmit').on('click', function() {
    exist = true;
    checkUserExist();
      console.log("back from checkuser Encodedemal " +encodedEmail);
    if (exist) {
      $(".modal-title").text("Log In Successful");
      $(".modal-body").text("You've successfully logged in!");
      // display modal
      $("#errorModal").modal();
   console.log("going to retrieveSearch Encodedemal " +encodedEmail);
      retrieveSearch();
    }		
	});
	
});

//AJAX
// var queryURL;

// $.ajax({
// 	url: queryURL,
// 	method: "GET"
	
// 	}).done(function(response) {
// 		//once retrieved...
// 			//remove/hide loading gif (#loading)
// 			//populate to #results div the restaurant info

// 			//once populated, New Search and New Random buttons will appear
// 			$("#new-search").animate(
// 			{
// 				opacity: 1
// 			}, 500);
//         	$("new-random").animate(
//         	{
// 				opacity: 1
// 			}, 500);
// 	});










