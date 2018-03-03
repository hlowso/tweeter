// *--------------*
// | USEFUL ICONS |
// *--------------*

const FLAG_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9FQS0QN7/tweetflag.png';
const ARROWS_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9GP7N4K0/tweetretweet.png';
const HEART_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9GP7MYTY/tweetlike.png';


// *------------------*
// | USEFUL FUNCTIONS |
// *------------------*

// This function takes a date (time in miliseconds since the 1970s)
// and returns a string containing a phrase indicating the time that
// has elapsed since the date.
// EX: '5 seconds ago', '3 days ago', '10 weeks ago', etc.
function timeSinceTweet(date) {
  
  const mscds_elapsed = new Date().getTime() - date;
  // 'discs' stands for discritizations
  const discs = [1000, 60, 60, 24, 7];
  const units = ['second', 'minute', 'hour', 'day', 'week'];
  let elapsed = mscds_elapsed;

  for(let j = 0; j < discs.length; j ++) {
    elapsed /= discs[j];
  }

  for(let i = 0; i < discs.length; i ++){
    let rounded = Math.floor(elapsed);

    if(rounded === 1) {
      return `1 ${units[discs.length - i - 1]} ago`;
    }

    if(rounded > 1) {
      return `${rounded} ${units[discs.length - 1 - i]}s ago`;
    }

    elapsed *= discs[discs.length - 1 - i];
  }

  return 'just now';

}

// This function generates the html structure, in the form of a 
// jquery <article> object, of an individual tweet given the
// tweet in object form. If fresh is set to true, the function
// adds the class fresh to the article so that it can be picked out by 
// the css file /public/styles/tweet.css and made to slide down when it's
// added to the main page.
function createTweetElement(tweet_obj, fresh=false) {

  const $header = $('<header></header>')
    .append(`<img src="${tweet_obj.user.avatars.small}">`)
    .append(`<h2>${tweet_obj.user.name}</h2>`)
    .append(`<small>${tweet_obj.user.handle}</small>`);

  const $div = $('<div></div>')
    .append( `<p>${tweet_obj.content.text}</p>`);

  const $footer = $('<footer></footer>')
    .append(`<small>${timeSinceTweet(tweet_obj.created_at)}</small>`)
    .append(`<p>${tweet_obj.likes}</p>`)
    .append('<span class="like"><i class="fas fa-heart"></i></span>')
    .append(`<img src="${ARROWS_IMG_URL}">`)
    .append(`<img src="${FLAG_IMG_URL}">`);

  let class_equals_fresh = '';
  if(fresh)
    class_equals_fresh = ' class="fresh"';

  const $tweet = $(`<article${class_equals_fresh} data-id="${tweet_obj.id}"></article>`)
    .append($header)
    .append($div)
    .append($footer);

  return $tweet;
}

// This function generates the html structure, in the form of a 
// jquery <section> object, of all an array of tweet objects.
function renderTweets(tweet_objs) {
  const $tweets = $('<section></section>');
  $tweets.attr('id', 'tweets');
  for(let i = tweet_objs.length - 1; i > -1; i --) {
    const tweet_obj = tweet_objs[i];
    $tweets.append(createTweetElement(tweet_obj));
  }
  return $tweets;
}

// The ajax GET request used to obtain all the tweets in the database. 
function loadTweets(callback) {
  $.ajax({
    url: '/tweets',
    method: 'GET',
    success: function(json) {
      $('main').append(renderTweets(json));
      callback();
    }
  });
}

// A function for escaping dodgy, potentially dangerous characters 
// sent in by users.
function escape(str) {
  var div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// *------------------------*
// | LOGIN AND REGISTRATION |
// *------------------------*

function isLoggedIn(resolve) {
  $.ajax({
    url: '/verify',
    method: 'GET',
    success: function(res) {
      resolve(res);
    }
  });
}

function putRegistration(event) {
  
  event.preventDefault();
  const $form = $(this);

  const $textarea = $form.find('textarea');
  $textarea.val(escape($textarea.val()));
  const text = $textarea.val();

  if(!text) {
    alert('username field left empty');
  }
  else if(text.length > 10) {
    alert('username too long');
  }
  else {
    $.ajax({
      url: '/authentication', 
      method: 'PUT',
      data: $form.serialize(),
      success: function(res) {
        $('#register').slideUp();
        goHome(res.name);
      }
    });
  }   
}

function putLogout(event) {
  $.ajax({
    url: '/authentication/logout',
    method: 'PUT',
    success: () => window.location.href = '/' 
  });
}


// The ajax POST request used to add a single tweet to the database.
function postTweet(event) {
  event.preventDefault();
  const $this = $(this);
  const $textarea = $this.parent().find('textarea');
  $textarea.val(escape($textarea.val()));
  const $text_counter = $this.parent().find('.counter');
  const text = $textarea.val();

  if(!text) {
    alert('Text area empty!');
  }
  else if(text.length > 140) {
    alert('Text too long!');
  }
  else {
    $.post(
      '/tweets', 
      $this.serialize(),
      function(res) {

        const $new_tweet = createTweetElement(res, true);
        $('#tweets').prepend($new_tweet);
        $new_tweet.slideDown();
      }
    );
    $textarea.val('');
    $text_counter.text('140');
  }
}

// A handler for the compose button.
function displayNewTweet() {

  $new_tweet = $('.new-tweet');
  $form = $new_tweet.find('form');

  if($new_tweet.css('display') === 'none') {    
    $new_tweet.slideDown(400, function() {

      $textarea = $(this).find('textarea');
      $textarea.focus();

      $form.on('submit', postTweet);
      $(document).on('keypress', function(event) {
        if(event.which === 13) {
          event.preventDefault();
          $form.submit();
        }
      });

    });
  }
  else {
    $form.off('submit');
    $(document).off('keypress');
    $new_tweet.slideUp();
  }
}

function toggleLikeTweet() {
  const $this = $(this);
  const $tweet = $this.closest('article');
  const id = $tweet.data('id');

  $.ajax({
    url: `/tweets/${id}`,
    method: 'PUT',
    success: function(res) {
      const $likes = $tweet.find('footer').find('p');
      $likes.text(Number($likes.text()) + res.summand);
      const new_color = (res.summand < 0) ? '#00a087' : 'red';
      $this.css('color', new_color);
    }
  });
}

function goHome(username) {
  loadTweets(function() {
    const $hearts = $('#tweets').find('.like');
    $hearts.on('click', toggleLikeTweet); 
  });

  const $userdiv = $('#nav-bar').find('div');
  $userdiv.css('visibility', 'visible');

  const $compose = $userdiv.find('.compose');
  $compose.on('click', displayNewTweet);
  
  $userdiv.find('.username').text(username);
  $userdiv.find('.logout').on('click', putLogout);

}

function goRegister() {
  $register = $('#register');
  $register.slideDown();
  $register.find('form').on('submit', putRegistration);
}

  // *------------*
  // | ON LOAD... |
  // *------------*

$(document).ready(function() {

  $.ajax({
    url: '/authentication',
    method: 'GET',
    success: function(res) {
      if(res.is_logged_in) {
        goHome(res.username);
      }
      else {
        goRegister();
      }
    }
  });

});
