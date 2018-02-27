function handleTextChange() {
  let current_count = 140 - $(this).val().length;
  let $counter = $(this).siblings('.counter');
  if(current_count < 0) {
    $counter.css('color', 'red');
    $counter.text(current_count);
  }
  else {
    $counter.css('color', '');
    $counter.text(current_count);
  }
};

$(document).ready(function() {
  $('.new-tweet').find('textarea').on('keyup', handleTextChange);
});