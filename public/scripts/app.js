// *--------------*
// | USEFUL ICONS |
// *--------------*

const FLAG_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9FQS0QN7/tweetflag.png';
const ARROWS_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9GP7N4K0/tweetretweet.png';
const HEART_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9GP7MYTY/tweetlike.png';


$(document).ready(function() {

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
      .append(`<img src="${HEART_IMG_URL}" class="like">`)
      .append(`<img src="${ARROWS_IMG_URL}">`)
      .append(`<img src="${FLAG_IMG_URL}">`);

    let class_equals_fresh = '';
    if(fresh)
      class_equals_fresh = ' class="fresh"';

    const $tweet = $(`<article${class_equals_fresh}></article>`)
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
  function loadTweets() {
    $.ajax({
      url: '/tweets',
      method: 'GET',
      success: function(json) {
        $('main').append(renderTweets(json));
      }
    });
  }

  function isLoggedIn(resolve) {
    $.ajax({
      url: '/',
      method: 'GET',
      success: function(res) {
        resolve(res);
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

  // function likeTweet() {
  //   $this = $(this);
  //   current_user = 
  // }

  // *------------*
  // | ON LOAD... |
  // *------------*


  loadTweets();
  $('#nav-bar').find('.compose').on('click', displayNewTweet);
  // $('#tweets').find('.like').on('click', likeTweet);

  

});
