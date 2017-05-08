$(document).ready(function() {

    // Init imageAlpha
    $("img").imgAlpha();

//    // Init imageAlpha with options
//    $("#img2").imgAlpha({
//        imgColor: 'zzzzzzzz',
//        imgAlpha: 'aaaa',
//        bgColor: [10, 50, 200]
//    });
//
    // jQuery UI - Make images draggable to see transparency in this example
    $("img" ).draggable({
        stack: "img",
        distance: 0
    });



});
