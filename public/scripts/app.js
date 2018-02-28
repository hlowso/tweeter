/*
 * Client-side JS logic goes here
 * jQuery is already loaded
 * Reminder: Use (and do all your DOM work in) jQuery's document ready function
 */

const data = [
  {
    "user": {
      "name": "Newton",
      "avatars": {
        "small":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_50.png",
        "regular": "https://vanillicon.com/788e533873e80d2002fa14e1412b4188.png",
        "large":   "https://vanillicon.com/788e533873e80d2002fa14e1412b4188_200.png"
      },
      "handle": "@SirIsaac"
    },
    "content": {
      "text": "If I have seen further it is by standing on the shoulders of giants"
    },
    "created_at": 1461116232227
  },
  {
    "user": {
      "name": "Descartes",
      "avatars": {
        "small":   "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_50.png",
        "regular": "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc.png",
        "large":   "https://vanillicon.com/7b89b0d8280b93e2ba68841436c0bebc_200.png"
      },
      "handle": "@rd" },
    "content": {
      "text": "Je pense , donc je suis"
    },
    "created_at": 1461113959088
  },
  {
    "user": {
      "name": "Johann von Goethe",
      "avatars": {
        "small":   "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_50.png",
        "regular": "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1.png",
        "large":   "https://vanillicon.com/d55cf8e18b47d4baaf60c006a0de39e1_200.png"
      },
      "handle": "@johann49"
    },
    "content": {
      "text": "Es ist nichts schrecklicher als eine tätige Unwissenheit."
    },
    "created_at": 1461113796368
  }
];

const FLAG_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9FQS0QN7/tweetflag.png';
const ARROWS_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9GP7N4K0/tweetretweet.png';
const HEART_IMG_URL = 'https://files.slack.com/files-pri/T2G8TE2E5-F9GP7MYTY/tweetlike.png';

  

// Some fake data for testing purposes...


$(document).ready(function() {
//   $('main').append(renderTweets(data));

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

  function createTweetElement(tweet_obj) {

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

    const $tweet = $('<article></article>')
      .append($header)
      .append($div)
      .append($footer);

    return $tweet;
  }

  function renderTweets(tweet_objs) {
    const $tweets = $('<section></section>');
    $tweets.attr('id', 'tweets');
    for(let tweet_obj of tweet_objs) {
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

  loadTweets();

  $('.new-tweet').find('form').on('submit', function(event) {
    event.preventDefault();
    
    const $this = $(this);
    const $textarea = $this.parent().find('textarea');
    const $text_counter = $this.parent().find('.counter');
    const text = $textarea.val();

    if(!text)
      alert('Text area empty!');
    else if(text.length > 140)
      alert('Text too long!');
    else {
      $.post(
        '/tweets', 
        $this.serialize(),
        function(response) {
          console.log(response);
        }
      );
      $textarea.val('');
      $text_counter.text('140');
    }
  });

});
