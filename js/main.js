(function($) {

  var streamElement;
  var gifOptions;

  var placeholder = $('#placeholder');
  var streamActions = $('#stream-actions');
  var gifActions = $('#gif-actions');
  var createAction = $('#action-create');
  var createIcon = createAction.find('img');
  var actions = {
    create: createAction,
    reset: $('#action-reset'),
    download: $('#action-download'),
    share: $('#action-share')
  };

  var progressColor = 'rgba(44,146,54,0.8)';
  var progressBar = new ProgressBar.Line('#actions', {
    color: progressColor,
    strokeWidth: 3,
    duration: 1,
    trailColor: 'rgba(221,221,221,0.6)'
  });

  if (navigator.getMedia) {
    GumHelper.startVideoStreaming(startStream);
  } else {
    placeholder.text("Your browser does not support video capture.");
  }

  function startStream(err, stream, videoElement, videoWidth, videoHeight) {
    if (err) {
      console.log('Error creating video stream', err);
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
    placeholder.empty();
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
      createIcon.removeClass('rotating');
    }
    progressBar.set(progress);
  }

  function displayGIF(obj) {
    if (obj.error) {
      console.log('Error creating GIF', obj.error);
      return;
    }

    $(progressBar.svg).hide();

    var image = obj.image;
    var animatedImage = document.createElement('img');
    animatedImage.src = image;
    placeholder.empty();
    placeholder.append(animatedImage);

    streamActions.hide();
    gifActions.fadeIn();
    actions.download.attr({
      href: image,
      download: 'facegif.gif'
    });
    actions.reset.one('click', displayStream);
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