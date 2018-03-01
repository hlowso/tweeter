/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

const FLAG_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9FQS0QN7/tweetflag.png';
const ARROWS_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9GP7N4K0/tweetretweet.png';
const HEART_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9GP7MYTY/tweetlike.png';


$(document).ready(function() {

  // *------------------*
  // | USEFUL FUNCTIONS |
  // *------------------*

  function timeSinceTweet(date) {
    const mscds_elapsed = new Date().getTime() - date;
    const discs = [1000, 60, 60, 24, 7];
    const units = ['second', 'minute', 'hour', 'day', 'week'];

    for(let i = 0; i < discs.length; i ++){
      let elapsed = mscds_elapsed;
      for(let j = 0; j < discs.length - i; j ++) {
        elapsed /= discs[j];
      }
      elapsed = Math.floor(elapsed);
      if(elapsed === 1)
        return `1 ${units[discs.length - i]} ago`;
      if(elapsed > 1)
        return `${elapsed} ${units[discs.length - 1 - i]}s ago`;
    }
    return 'just now';

  }

  function createTweetElement(tweet_obj, fresh=false) {

    const $header = $('<header></header>')
      .append(`<img src="${tweet_obj.user.avatars.small}">`)
      .append(`<h2>${tweet_obj.user.name}</h2>`)
      .append(`<small>${tweet_obj.user.handle}</small>`);

    const $div = $('<div></div>')
      .append( `<p>${tweet_obj.content.text}</p>`);

    const $footer = $('<footer></footer>')
      .append(`<small>${timeSinceTweet(tweet_obj.created_at)}</small>`)
      .append(`<img src="${HEART_IMG_URL}">`)
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

  function renderTweets(tweet_objs) {
    const $tweets = $('<section></section>');
    $tweets.attr('id', 'tweets');
    for(let i = tweet_objs.length - 1; i > -1; i --) {
      const tweet_obj = tweet_objs[i];
      $tweets.append(createTweetElement(tweet_obj));
    }
    return $tweets;
  }

  function loadTweets() {
    $.ajax({
      url: '/tweets',
      method: 'GET',
      success: function(json) {
        $('main').append(renderTweets(json));
      }
    });
  }

  function escape(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

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

  function composeClickHandler() {
    $new_tweet = $('.new-tweet');
    $new_tweet.slideToggle(400, function() {
      $textarea = $(this).find('textarea');
      $textarea.focus();
    });
  }

  // *------------*
  // | ON LOAD... |
  // *------------*

  loadTweets();
  $('.new-tweet').find('form').on('submit', postTweet);
  $('#nav-bar').find('.compose').on('click', composeClickHandler);

});
