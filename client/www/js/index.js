(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady);
    function onDeviceReady() {
        var new_tbody = $("<tbody>");
        var counter = 0;    
        for (var r = 0; r < 4; r++) {
            var new_row = $("<tr>");
            for (var c = 0; c < 4; c++) {
                var new_cell = $("<td>");
                var myButton = $('<button>');
              
 		myButton.text((counter + 1).toString());
                myButton.attr('tabindex',counter);
		myButton.attr('class', 'buttonInTable');   		    
                myButton.appendTo(new_cell);
	            
                new_cell.appendTo(new_row);
                counter ++;
            }
            new_row.appendTo(new_tbody);
        }
        new_tbody.appendTo($("#myTable"));
    };

    $(document).on('click',  'button', function () {
	var currIndex = $(this).prop("tabindex");
//	var currText = $('.buttonInTable').get(currIndex).innerText;
	var currText = $('.buttonInTable')[currIndex].innerText;

	$('.buttonInTable')[currIndex].innerText = $('.buttonInTable')[0].innerText
	$('.buttonInTable')[0].innerText = currText;
    });

})();