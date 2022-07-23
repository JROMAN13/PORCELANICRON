console.log("carga custom")

$( document ).ready(function() {
////$(document).on('ready', function () {

        console.log("carga ready custom")
    // aca tus fnciones 

    getYear();


    $('.custom_slick_slider').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        dots: true,
        fade: true,
        adaptiveHeight: true,
        asNavFor: '.slick_slider_nav',
        responsive: [{
            breakpoint: 768,
            settings: {
                dots: false
            }
        }]
    })
    
    $('.slick_slider_nav').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        asNavFor: '.custom_slick_slider',
        centerMode: false,
        focusOnSelect: true,
        variableWidth: true
    });
    


});



// to get current year
function getYear() {
    var currentDate = new Date();
    var currentYear = currentDate.getFullYear();
    document.querySelector("#displayYear").innerHTML = currentYear;
}


/** google_map js **/

function myMap() {
    var mapProp = {
        center: new google.maps.LatLng(40.712775, -74.005973),
        zoom: 18,
    };
    var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
}