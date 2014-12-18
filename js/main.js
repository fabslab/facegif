(function($) {

  var streamElement;
  var gifOptions;

  var placeholder = $('#placeholder');
  var streamActions = $('#stream-actions');
  var gifActions = $('#gif-actions');
  var actions = {
    create: $('#action-create'),
    reset: $('#action-reset'),
    download: $('#action-download'),
    share: $('#action-share')
  };

  var progressBar = new ProgressBar.Line('#actions', {
    color: '#2C9236',
    strokeWidth: 3,
    duration: 1,
    trailColor: "#ddd"
  });

  actions.download.on('click', saveGIF);

  if (navigator.getMedia) {
    GumHelper.startVideoStreaming(startStream);
  }

  function startStream(err, stream, videoElement, videoWidth, videoHeight) {
    if (err) {
      console.log('Error creating video stream', err);
      return;
    }

    streamElement = videoElement;

    var placeholderRect = placeholder[0].getBoundingClientRect();
    var gifWidth = placeholderRect.width;
    var gifHeight = placeholderRect.height;

    // match the video to the largest dimension of the GIF
    // then position in center and parent element will crop video
    var cropDimensions = getCropDimensions(videoWidth, videoHeight, gifWidth, gifHeight);
    $(streamElement).css({
      width: gifWidth + cropDimensions.width + 'px',
      height: gifHeight + cropDimensions.height + 'px',
      'margin-left': -Math.floor(cropDimensions.width / 2) + 'px',
      'margin-top': -Math.floor(cropDimensions.height / 2) + 'px'
    });

    gifOptions = {
      interval: 0.2,
      gifWidth: gifWidth,
      gifHeight: gifHeight,
      cameraStream: stream,
      keepCameraOn: true,
      progressCallback: progressBar.set.bind(progressBar)
    };

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
  }

  function takeGIF() {
    $(progressBar.svg).show();
    gifshot.createGIF(gifOptions, displayGIF);
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

  function saveGIF() {

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