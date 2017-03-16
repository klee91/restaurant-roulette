var config = {
    apiKey: "AIzaSyB2GdNM2sv4c3_biodPrXtZFxhRcEqNFqE",
    authDomain: "restaurant-roulette-dcc68.firebaseapp.com",
    databaseURL: "https://restaurant-roulette-dcc68.firebaseio.com",
    storageBucket: "restaurant-roulette-dcc68.appspot.com",
    messagingSenderId: "866118824428"
     };


  firebase.initializeApp(config);
   var database = firebase.database();
   var userRef = firebase.database().ref("user");
   var email = firebase.database().ref("user/email");
   

//objects -------------------------------------------------------
var input = {};
var subscriber = {};
var coordinates = 
{
	lat: undefined,
	lng: undefined
};

//Global variables ----------------------------------------------
var encodeEmail;
var added;


// functions ----------------------------------------------------
function submitRequest(data) {
	var zip = $("#zipCode").val().trim();
	// check to make sure a location is received
	if ( zip = "" & coordinates === undefined) {
  		console.log("error: zip and coordinates are not defines");
  	 } else {
  	 	retrieveData();
  	 	// placeholders
  	 	// function yelpAjax();
		// function couponAjax;
		// update restaurant on display
		// function updateRestDisplay();
		// function updateFirebase();
	};


};

function retrieveData(){
  input = {
	zip: $("#zipCode").val().trim(),
	radius: $("#radiusBtn").data("value"),
	rating: $("#ratingBtn").data("value"),
	price: $("#priceBtn").data("value")
   };
   console.log(input);
};

// create a user in the database on sign up
function createUser(){
   console.log("createuser executing");
   	retrieveUser();
   	console.log("createuser: back from executing retrieve signin");
   firebase.auth().createUserWithEmailAndPassword(subscriber.email, subscriber.password).catch(function(error) {
		  // Handle Errors here.
		   added = false;
		   console.log(added + " " + error);
		   $(".modal-body").empty();
           var tempDiv = $('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
           $(".modal-body").append(tempDiv);
           $(".modal-header").html(error.message);
           $("#myModal").modal("show");
           console.log(error);
		   added = false;
		   
  });
   console.log("firebase auth executed.  added: " + added + "returning");
};
  


function retrieveUser(){
	subscriber = {
		email: $("#email").val().trim(),
		password: $("#password").val().trim()
	};
	$("#email").empty();
	$("password").empty();
	console.log(subscriber);
};


function checkExist(exist){
    // userRef.once("value")
        // .then(function(snapshot) {
           // determine if email exists
           // console.log(snapshot.val());
           // {
           //    userArr =  {  
           //    user: user,
           //                 };
          // });
     return false;
};

function adduser() {
  encodeEmail = encodeEmail(subscriber.email);
  console.log(encodeEmail);
	  firebase.database().ref('userRef/' + encodeEmail).set(
	  {
        password: subscriber.password
       });
	  console.log("password " + subscriber.password);
};



function encodeEmail(uri) {
 var newEmail =  encodeURIComponent(uri).replace('.', '%2E');;
 console.log("encodeEmail: " + newEmail);
};

function FormatEmail(eAddress)
{
	var userEmail = $.trim(eAddress); //remove leading and trailing spaces
	return userEmail.replace(/ /g, ''); //remove spaces
}

function decodeemail(uri) {
	return decodeURIComponent(uri);
};
//Run on page load ----------------------------------------------

// grab the users latitude and logitude if permitted
if (navigator.geolocation)
{
	navigator.geolocation.getCurrentPosition(function(position)
	{
		//store coordinates in object
		coordinates.lat = position.coords.latitude;
		coordinates.lng = position.coords.longitude;

		//indicate zip code is now optional (assuming user wants to user current coordinates)
		$("#zipCode").attr("placeholder", "Zip Code (optional)");

		console.log(coordinates.lat);
		console.log(coordinates.lng);
	});
}

//jQuery interactivity -------------------------------------------
$(document).ready(function() {

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
		$('#radiusBtn').attr('data-value', $(this).val());
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

	//slide parameter section out, when submit button clicked
  $(document).on('click', '#submitBtn', function(event) {
		  submitRequest();
        //animation to remove the parameters
        $("#parameters").animate(
        {
            opacity: 0.3,
            right: "+=600",
        }, 1000);

        setTimeout( function(){
        	$("#parameters").css("display","none");
        }, 1000);

        //animation for results
        $("#results").animate(
        {
        	opacity: 1
        }, 1000);
        //ensure results div is involved in flow
     	$("#results").css("display", "block");

        //loading gif animation
        $("#loading").delay(800).animate(
        {
        	opacity: 1
        }, 1000);

        //reveal post results buttons 
        $("#post-results").css("display", "block");
        $("#post-results").animate(
        {
        	opacity: 1
        },1000);
    });

    //click function for New Search
    $(document).on('click', '#new-search' , function(event) {

    	//hide results div and remove from flow
    	$("#results").animate(
        {
   			opacity: 0
        }, 1000);
    	setTimeout(function()
    	{
    		$("#results").css("display", "none");
    	}, 1000);

    	//will shift params back to screen
    	$("#parameters").css("display","block").animate(
    	{
    		opacity: 1,
    		right: "0"
    	}, 1000);

    	// hide the "post-results" buttons
    	$("#post-results").animate(
    	{
    		opacity: 0
    	}, 1000);
    	setTimeout(function()
    	{
    		$("#post-results").css("display", "none");
    	}, 1100);
    });

    //click function for New Random
    $(document).on('click', '#new-random' , function(event) {

    	//loading will take place
    	var load = $('<img src="assets/images/loading.gif" alt="loading.gif" id="loading">')
    	$('#restaurant-port').append(load)
    	
    	//will do AJAX call for new random
    	$.ajax({
			url: queryURL,
			method: "GET"
		}).done(function(response) {
    	})
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

 			$("#logInBtn").removeClass("activeBtn");
 			// $("#logInBtn").removeClass("btn-primary");
 			// $("#logInBtn").addClass("btn-default");
 		}
 		//check if sign up button is not active
 		if ($("#signUpBtn").attr("is-active") === "false")
 		{
 			//set to active
 			$("#signUpBtn").attr("is-active", "true");
 			//reveal the sign in fields
 			$("#signUpFields").slideDown(300);
 			//change class of button to show it's active

 			// $("#signUpBtn").removeClass("btn-default");
 			$("#signUpBtn").addClass("activeBtn");
 		}
 		else //if it was active, deactivate it
 		{
 			$("#signUpBtn").attr("is-active", "false")
 			$("#signUpFields").slideUp(300);
 			//change class to show it's inactive

 			$("#signUpBtn").removeClass("activeBtn");
 			// $("#signUpBtn").addClass("btn-default");
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

 			$("#signUpBtn").removeClass("activeBtn");
 			// $("#signUpBtn").addClass("btn-default");
  		}
  		//check if log in button is not active
  		if ($("#logInBtn").attr("is-active") === "false")
  		{
  			//set to active
  			$("#logInBtn").attr("is-active", "true");
  			//reveal the log in fields
  			$("#logInFields").slideDown(300);
  			//change class of button to show it's active

 			// $("#logInBtn").removeClass("btn-default");
 			$("#logInBtn").addClass("activeBtn");
  		}
  		else //if it was active, deactivate it
 		{
 			$("#logInBtn").attr("is-active", "false")
 			$("#logInFields").slideUp(300);
 			//change class to show it's inactive

 			$("#logInBtn").removeClass("activeBtn");
 			// $("#logInBtn").addClass("btn-default");
 		}
  });

  	//logic for user signing up
//   	$("#signUpSubmit").on("click", function()
//   	{
//   		//properly format signUpEmail input
//   		var userEmail = FormatEmail($("#signUpEmail").val());
//   		$("#signUpEmail").val(userEmail);
//   		console.log(userEmail);

//   		//check for errors in fields
//   		if ($("#signUpEmail").val() !== '')
//   		{
// 	  		//if email !exist in database (WRITE THIS CONDITION)
// 	  		//{
// 	  			//if password fields haven't been filled
// 	  			if ($("#signUpPass").val() === '' && $("#signUpConfirmPass").val() === '')
// 	  			{
// 	  				//switch content of modal to match error
// 	  				$(".modal-title").text("Passwords Empty");
// 	  				$(".modal-body p").text("Password and Confirm Password cannot be left blank. Please try again.");
// 	  				//display modal
// 	  				$("#errorModal").modal();
// 	  			}
// 	  			//if password and confirmPassword don't match
// 	  			else if ($("#signUpPass").val() !== $("#signUpConfirmPass").val())
// 	  			{
// 	  				//switch content of modal to match error
// 	  				$(".modal-title").text("Password Mismatch");
// 	  				$(".modal-body p").text("Password and Confirm Password do not match. Please try again.");
// 	  				//display modal
// 	  				$("#errorModal").modal();

// 	  				//wipe values in password fields
// 	  				$("#signUpPass").val('');
// 	  				$("#signUpConfirmPass").val('');
// 	  			}
// 	  			else //email not taken, passwords match
// 	  			{
// 	  				//sign user up
// 	  				console.log("sign the user up.");

// 	  				//modal indicating successful sign up
// 	  				$(".modal-title").text("Success!");
// 	  				$(".modal-body p").text("Sign Up successful! Click the 'Log In' button to log in!");
// 	  				//display modal
// 	  				$("#errorModal").modal();

// 	  				//put email Address into logIn email address field
// 	  				$("#logInEmail").val($("#signUpEmail").val());

// 	  				//wipe signUp fields
// 	  				$("#signUpEmail").val('');
// 	  				$("#signUpPass").val('');
// 	  				$("#signUpConfirmPass").val('');
// 	  			}
// 	  		// }
// 	  		// else //email already exsits in database
// 	  		// {
// 	  				// //switch content of modal to match error
// 	  				// $(".modal-title").text("Email Already Exists");
// 	  				// $(".modal-body p").text("The provided email address is already registered. Please try a different email addresss.");
// 	  				// //display modal
// 	  				// $("#errorModal").modal();

// 	  				// //wipe values in email and password fields
// 	  				// $("#signUpEmail").val('');
// 	  				// $("#signUpPass").val('');
// 	  				// $("#signUpConfirmPass").val('');
// 	  		// }
// 	  	}
// 	  	else //email was left blank
// 	  	{
// 	  		//switch content of modal to match error
// 	  		$(".modal-title").text("Invalid email address");
// 	  		$(".modal-body p").text("Email Address cannot be left blank. Please try again.");
// 	  		//display modal
// 	  		$("#errorModal").modal();

// 	  		//wipe password values
// 	  		$("#signUpPass").val('');
// 	  		$("#signUpConfirmPass").val('');
// 	  	}
//   	});

  	//logic for user logging in
//   	$("#logInSubmit").on("click", function()
//   	{
//   		//properly format logInEmail input
//   		var userEmail = FormatEmail($("#logInEmail").val());
//   		$("#logInEmail").val(userEmail);
//   		console.log(userEmail);

//   		//check for errors in fields
//   		if ($("#logInEmail").val() !== '')
//   		{
//   			if ($("#logInPassword").val() !== '')
//   			{
//   				// //if email is registered in database (WRITE THIS CONDITION)
//   				// {
// 	  			// 	//if password matches password in database (WRITE THIS CONDITION)
// 	  			// 	{
// 	  			// 		//log the user in
// 	  			// 		//switch content of modal to match error
// 				  // 		$(".modal-title").text("Log In Successful");
// 				  // 		$(".modal-body p").text("You've successfully logged in!");
// 				  // 		//display modal
// 				  // 		$("#errorModal").modal();
// 				  // 	}
// 	  			// 	// else //password did not match
// 	  			// 	{
// 		  		// 		//switch content of modal to match error
// 					 //  	$(".modal-title").text("Incorrect Password");
// 					 //  	$(".modal-body p").text("Password did not match. Please try again.");
// 					 //  	//display modal
// 					 //  	$("#errorModal").modal();

// 					 //  	//wipe password field
// 					 //  	$("#logInPassword").val('');
// 	  			// 	}
//   				// }
//   				// else //email not registered in database
//   				// {
//   				// 	//switch content of modal to match error
// 			  	// 	$(".modal-title").text("Invalid email address");
// 			  	// 	$(".modal-body p").text("Provided email address is not registered. Click the 'Sign Up' button to register.");
// 			  	// 	//display modal
// 			  	// 	$("#errorModal").modal();

// 			  	// 	//wipe email and password values
// 			  	// 	$("#logInEmail").val('');
// 			  	// 	$("#logInPassword").val('');
//   				// }
//   			}
//   			else //password field was left blank
//   			{
//   				//switch content of modal to match error
// 		  		$(".modal-title").text("Invlaid Password");
// 		  		$(".modal-body p").text("Password cannot be left blank. Please try again.");
// 		  		//display modal
// 		  		$("#errorModal").modal();
//   			}
//   		}
//   		else //email address was left blank
//   		{
//   			//switch content of modal to match error
// 	  		$(".modal-title").text("Invalid email address");
// 	  		$(".modal-body p").text("Email Address cannot be left blank. Please try again.");
// 	  		//display modal
// 	  		$("#errorModal").modal();

// 	  		//wipe password value
// 	  		$("#logInPassword").val('');
//   		}
//   	});

    // click function for signup credentials
	// $(document).on('click', "#signUpSubmit", function(event) {
 //    createUser();
	// 	var userEmail = $('#email').val().trim();
	// 	var userPw = $('#password').val().trim();

    //click function for signup credentials
	$(document).on('click', '#signUpSubmit', function(event) {
	   var added = true;
	   createUser();
	   console.log("added after checking firebase: " + added);
	    if (added) {
	    	console.log("user was added");
	    	adduser();
	    };
		var userEmail = $('#email').val().trim();
		var userPw = $('#password').val().trim();
		
	});

	//click function for grabbing login credentials
	$('#logInSubmit').on('click', function() {
		var userEmail = $('#email').val().trim();
		var userPw = $('#password').val().trim();
		
	});
	
});

//AJAX
var queryURL;

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










