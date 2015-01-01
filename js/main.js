(function($) {

  vex.defaultOptions.className = 'vex-theme-wireframe';

  var imageData;

  var streamElement;
  var gifOptions;

  var placeholder = $('#placeholder');
  var streamActions = $('#stream-actions');
  var gifActions = $('#gif-actions');
  var createAction = $('#action-create');
  var loader = $('.loader');
  var createIcon = createAction.find('img');
  var actions = {
    create: createAction,
    reset: $('#action-reset'),
    download: $('#action-download'),
    share: $('#action-share')
  };

  var progressColor = 'rgba(44,146,54,0.8)';
  var progressBar = new ProgressBar.Line('.progress-bar', {
    color: progressColor,
    strokeWidth: 3,
    duration: 1,
    trailColor: 'rgba(221,221,221,0.6)'
  });

  if (navigator.getMedia) {
    GumHelper.startVideoStreaming(startStream);
  } else {
    placeholder.text('Your browser does not support video capture.');
  }

  function startStream(err, stream, videoElement, videoWidth, videoHeight) {
    if (err) {
      placeholder.text('There was an error starting video, please refresh and try again.');
      return;
    }

    streamElement = videoElement;

    var placeholderRect = placeholder[0].getBoundingClientRect();

    // create a square camera view based on runtime width
    var gifDimension = placeholderRect.width;

    // match the video to the largest dimension of the GIF
    // then position in center and parent element will crop video
    var cropDimensions = getCropDimensions(videoWidth, videoHeight, gifDimension, gifDimension);
    $(streamElement).css({
      width: gifDimension + cropDimensions.width + 'px',
      height: gifDimension + cropDimensions.height + 'px',
      'margin-left': -Math.floor(cropDimensions.width / 2) + 'px',
      'margin-top': -Math.floor(cropDimensions.height / 2) + 'px'
    });

    gifOptions = {
      interval: 0.15,
      numFrames: 15,
      gifWidth: gifDimension,
      gifHeight: gifDimension,
      cameraStream: stream,
      keepCameraOn: true,
      progressCallback: displayProgress,
      text: 'faceGIF.com',
      fontFamily: 'Source Sans Pro',
      fontColor: 'rgba(255,255,255,0.8)',
      textXCoordinate: gifDimension - 50,
      textYCoordinate: gifDimension - 5
    };

    $('#actions').show();
    displayStream();
  }

  function displayStream() {
    placeholder.find('img').remove();
    placeholder.append(streamElement);
    streamElement.play();

    progressBar.set(0);
    gifActions.hide();
    streamActions.fadeIn();

    actions.create.one('click', takeGIF);
    $(window).on('keyup', function onKeyup(event) {
      // allow space to trigger taking GIF
      if (event.keyCode == 32) {
        $(window).off('keyup', onKeyup);
        takeGIF();
      }
    });
  }

  function takeGIF() {
    createIcon.addClass('rotating');
    progressBar.path.setAttribute('stroke', progressColor);
    $(progressBar.svg).show();
    gifshot.createGIF(gifOptions, displayGIF);
  }

  function displayProgress(progress) {
    if (progress === 1) {
      progressBar.path.setAttribute('stroke', 'rgba(44,146,54,0.2)');
      streamElement.pause();
      createIcon.removeClass('rotating');
      loader.fadeIn();
    }
    progressBar.set(progress);
  }

  function displayGIF(obj) {
    if (obj.error) {
      placeholder.html('There was an error creating your GIF. Please refresh and try again.');
      return;
    }

    loader.hide();
    $(progressBar.svg).hide();

    var image = obj.image;
    var animatedImage = document.createElement('img');
    animatedImage.src = image;
    placeholder.find('video').remove();
    placeholder.append(animatedImage);

    imageData = image;

    streamActions.hide();
    gifActions.fadeIn();
    actions.download.attr({
      href: image,
      download: 'facegif.gif'
    });
    actions.reset.one('click', displayStream);

    actions.share.off();
    actions.share.on('click', displayShareOptions);
  }

  function displayShareOptions() {
    vex.open({
      content: '<div class="dialog-title">Share</div>' +
        '<div class="share-items">' +
          '<a id="share-imgur" href="javascript:" title="Share on Imgur" style="overflow:hidden; width:100px; height:36px; background:url(img/imgur.png) top left no-repeat transparent;"></a>' +
        '</div>'
    });

    $('#share-imgur').off().on('click', shareToImgur);
  }

  function shareToImgur() {
    var image = imageData.replace(/^data:[^,]+,/, '');

    loader.fadeIn();

    $.ajax({
      url: 'https://api.imgur.com/3/image',
      method: 'POST',
      headers: {
        Authorization: 'Client-ID 1dd9c443be8f3fe',
        Accept: 'application/json'
      },
      data: {
        image: image,
        type: 'base64'
      }
    }).done(function(response) {
      var dialog = $('.share-items');

      loader.hide();

      if (!response.success) {
        dialog.append('<span>Please try again.</span>');
        return;
      }

      var imageUrl = 'https://imgur.com/gallery/' + response.data.id;
      var link = document.createElement('a');
      link.setAttribute('href', imageUrl);
      link.setAttribute('title', 'Your faceGIF on Imgur');
      link.innerHTML = imageUrl;

      dialog.append(link);
    });
  }

  function getCropDimensions(width, height, gifWidth, gifHeight) {
    var result = { width: 0, height: 0, scaledWidth: 0, scaledHeight: 0 };
    if (width > height) {
      result.width = Math.round(width * (gifHeight / height)) - gifWidth;
      result.scaledWidth = Math.round(result.width * (height / gifHeight));
    } else {
      result.height = Math.round(height * (gifWidth / width)) - gifHeight;
      result.scaledHeight = Math.round(result.height * (width / gifWidth));
    }

    return result;
  }


})(jQuery);
