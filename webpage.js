$(function () {
    $('#moreButton').click(function () {
        $('#newsList li:hidden').slice(0, 5).show();
        if ($('#newsList li').length == $('#newsList li:visible').length) {
            $('#moreButton ').hide();
        }
    });
});