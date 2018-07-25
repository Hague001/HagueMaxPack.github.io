(function() {
  var Dragger, FadeTransition, NoneTransition, Panner, SlideTransition, Slideshow, Vertical, WebView, changeDeckLayer, childVideo, closeOpenModalPopups, copyPopupToVertical, find, findAncestor, handlePopup, hide, hidePopup, hideRadioGroupPopups, iframe, img, isAboveBreakpoint, isModal, isModalPopupShown, isWithinRange, j, jumplink, k, l, len, len1, len2, len3, len4, len5, link, m, modalPopupIsShown, n, o, pauseOnClose, pauseSlideshowFor, pauseTriggerMedia, playTriggerMedia, ref, ref1, ref2, ref3, ref4, ref5, resumeSlideshowFor, scaleHtmlContent, scrollTop, scrollTopTo, setChildControls, setUpClosePopupButton, setupPopups, setupTriggerMedia, show, showPopup, smoothScrollTo, togglePopup, toggleTriggerMedia, transitionTable, triggerMedia, webview,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Vertical = (function() {
    function Vertical(element1) {
      this.element = element1;
      this.updateKnockbackColor = bind(this.updateKnockbackColor, this);
      this.snapScrollStop = bind(this.snapScrollStop, this);
      this.snapScrollListener = bind(this.snapScrollListener, this);
      this.transitionScrollListener = bind(this.transitionScrollListener, this);
      this.id = this.element.id;
      this.transitions = null;
      this.slideshows = this.extractSlideshows();
    }

    Vertical.prototype.setActive = function(scalingFactor) {
      var j, len, ref, results, slide;
      this.currentScalingFactor = scalingFactor;
      this.transitionState = [];
      this.scrollStopTimer = null;
      this.element.classList.add('active');
      this.element.classList.add('active-layer-visible');
      if (this.element.classList.contains('knockback')) {
        this.updateKnockbackColor();
        window.addEventListener('scroll', this.updateKnockbackColor);
      }
      if (this.containsTransitions()) {
        window.addEventListener('scroll', this.transitionScrollListener);
      }
      if (this.containsSnapBlocks()) {
        window.addEventListener('scroll', this.snapScrollListener);
      }
      this.openAutoplayPopupVideos();
      ref = this.slideshows;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        slide = ref[j];
        results.push(slide.visible());
      }
      return results;
    };

    Vertical.prototype.removeActive = function() {
      var child, j, k, len, len1, ref, ref1, results, slide;
      this.element.classList.remove('active');
      this.element.classList.remove('active-layer-visible');
      window.removeEventListener('scroll', this.updateKnockbackColor);
      window.removeEventListener('scroll', this.transitionScrollListener);
      window.removeEventListener('scroll', this.snapScrollListener);
      ref = this.element.children;
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        if (child.className === 'deck-layer') {
          child.style.top = 0;
        }
      }
      ref1 = this.slideshows;
      results = [];
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        slide = ref1[k];
        results.push(slide.hidden());
      }
      return results;
    };

    Vertical.prototype.extractSlideshows = function() {
      var elm, j, len, ref, results;
      ref = this.element.querySelectorAll('.slideshow');
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        elm = ref[j];
        results.push(new Slideshow(elm));
      }
      return results;
    };

    Vertical.prototype.transitionScrollListener = function() {
      var transitionTags, transitionTagsAboveBreakpoint;
      transitionTags = Array.prototype.slice.call(this.allTransitions(), 0);
      transitionTagsAboveBreakpoint = transitionTags.filter(isAboveBreakpoint);
      document.body.scrollLeft = document.documentElement.scrollLeft = 0;
      document.body.scrollRight = document.documentElement.scrollRight = 0;
      if (this.transitionState.length !== transitionTagsAboveBreakpoint.length) {
        this.transitionState = transitionTagsAboveBreakpoint;
        return changeDeckLayer(transitionTagsAboveBreakpoint[transitionTagsAboveBreakpoint.length - 1]);
      }
    };

    Vertical.prototype.openAutoplayPopupVideos = function() {
      var id, j, len, ref, results, videoContainer, videoElem, videoLink;
      ref = this.element.getElementsByClassName('link-to-media');
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        videoLink = ref[j];
        id = videoLink.dataset.video;
        videoElem = this.element.querySelector("#" + id + "-video");
        if (videoElem && videoElem.dataset.autoplay) {
          videoContainer = show(find(id));
          results.push(videoContainer.querySelector('video').play());
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    Vertical.prototype.snapScrollListener = function() {
      if (this.scrollStopTimer !== null) {
        clearTimeout(this.scrollStopTimer);
      }
      return this.scrollStopTimer = setTimeout(this.snapScrollStop, 200);
    };

    Vertical.prototype.snapScrollStop = function() {
      var snapBlock, snapBlocks, snapBlocksWithinRange;
      snapBlocks = Array.prototype.slice.call(this.allSnapBlocks(), 0);
      snapBlocksWithinRange = snapBlocks.filter(isWithinRange);
      if (snapBlocksWithinRange.length > 0) {
        window.removeEventListener('scrollstop', this.snapScrollListener);
        snapBlock = snapBlocksWithinRange[snapBlocksWithinRange.length - 1];
        return smoothScrollTo(this.snapOffsetTop(snapBlock) * this.currentScalingFactor, 400);
      }
    };

    Vertical.prototype.snapOffsetTop = function(snapBlock) {
      if (snapBlock.parentNode.classList.contains('hang-container')) {
        return snapBlock.parentNode.offsetTop + snapBlock.offsetTop;
      } else {
        return snapBlock.offsetTop;
      }
    };

    Vertical.prototype.updateKnockbackColor = function() {
      var block, currentOpacity, j, knockbackAlphaRegExp, len, maxOpacity, ref, results, scrollTop, slide, slideBackground, specifiedKnockbackAlpha, specifiedKnockbackColor;
      knockbackAlphaRegExp = new RegExp(",([\\d\\.]+)\\)");
      specifiedKnockbackColor = this.element.dataset.knockbackColor;
      specifiedKnockbackAlpha = specifiedKnockbackColor.match(knockbackAlphaRegExp)[1];
      maxOpacity = 1 - specifiedKnockbackAlpha;
      scrollTop = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
      currentOpacity = 1 - scrollTop / window.innerHeight;
      slideBackground = specifiedKnockbackColor.replace(knockbackAlphaRegExp, ",1)");
      ref = this.element.querySelectorAll('.deck-layer .slide');
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        slide = ref[j];
        slide.style.background = slideBackground;
        results.push((function() {
          var k, len1, ref1, results1;
          ref1 = slide.querySelectorAll('.block');
          results1 = [];
          for (k = 0, len1 = ref1.length; k < len1; k++) {
            block = ref1[k];
            results1.push(block.style.opacity = Math.max(maxOpacity, currentOpacity));
          }
          return results1;
        })());
      }
      return results;
    };

    Vertical.prototype.allTransitions = function() {
      return this.transitions != null ? this.transitions : this.transitions = this.element.querySelectorAll('.transition');
    };

    Vertical.prototype.allSnapBlocks = function() {
      return this.snapBlocks != null ? this.snapBlocks : this.snapBlocks = this.element.querySelectorAll('.active-layer .snap');
    };

    Vertical.prototype.containsTransitions = function() {
      return this.allTransitions().length > 0;
    };

    Vertical.prototype.containsSnapBlocks = function() {
      return this.allSnapBlocks().length > 0;
    };

    return Vertical;

  })();

  this.Vertical = Vertical;

  WebView = (function() {
    function WebView(element1) {
      var elem, j, len, ref;
      this.element = element1;
      this.moveToPrevious = bind(this.moveToPrevious, this);
      this.moveToNext = bind(this.moveToNext, this);
      if (!this.element) {
        return;
      }
      this.verticals = [];
      ref = this.element.querySelectorAll('.vertical');
      for (j = 0, len = ref.length; j < len; j++) {
        elem = ref[j];
        this.verticals.push(new Vertical(elem));
      }
      this.nextButton = this.element.querySelector('#next-button');
      this.backButton = this.element.querySelector('#back-button');
      if (location.hash === '') {
        this.setActiveVertical(this.verticals[0]);
      } else {
        this.moveToVerticalOrElementWithId(location.hash.split('#')[1], false);
      }
    }

    WebView.prototype.setActiveVertical = function(vertical, updateHash) {
      var elem, j, len, ref;
      if (updateHash == null) {
        updateHash = true;
      }
      closeOpenModalPopups();
      if (this.activeVertical) {
        this.pause_all_playing_media();
        this.activeVertical.removeActive();
      }
      ref = vertical.element.querySelectorAll('img, video, iframe, audio');
      for (j = 0, len = ref.length; j < len; j++) {
        elem = ref[j];
        elem.src = elem.dataset.src;
      }
      vertical.setActive(this.scalingFactor());
      this.activeVertical = vertical;
      if (updateHash) {
        window.location.hash = vertical.id;
      }
      this.adjustNavigationButtonsVisibility();
      this.updatePageBackground();
      return this.scale();
    };

    WebView.prototype.pause_all_playing_media = function() {
      var j, len, media, ref, results;
      ref = this.activeVertical.element.querySelectorAll('video, audio');
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        media = ref[j];
        if (media.pause) {
          results.push(media.pause());
        }
      }
      return results;
    };

    WebView.prototype.adjustNavigationButtonsVisibility = function() {
      var currentVertical;
      currentVertical = this.activeVertical;
      if (currentVertical === this.verticals[0]) {
        if (this.backButton) {
          this.backButton.classList.add('hidden');
        }
      } else {
        if (this.backButton) {
          this.backButton.classList.remove('hidden');
        }
      }
      if (currentVertical === this.verticals[this.verticals.length - 1]) {
        if (this.nextButton) {
          return this.nextButton.classList.add('hidden');
        }
      } else {
        if (this.nextButton) {
          return this.nextButton.classList.remove('hidden');
        }
      }
    };

    WebView.prototype.updatePageBackground = function() {
      var html, slide, vertical;
      vertical = this.activeVertical;
      slide = vertical.element.querySelector('.slide');
      if (slide) {
        html = document.getElementsByTagName('html')[0];
        return html.style.background = slide.style.background;
      }
    };

    WebView.prototype.moveToNext = function() {
      var currentPosition, next;
      currentPosition = this.verticals.indexOf(this.activeVertical);
      next = this.verticals[++currentPosition];
      if (next) {
        return this.setActiveVertical(next);
      }
    };

    WebView.prototype.moveToPrevious = function() {
      var currentPosition, previous;
      currentPosition = this.verticals.indexOf(this.activeVertical);
      previous = this.verticals[--currentPosition];
      if (previous) {
        return this.setActiveVertical(previous);
      }
    };

    WebView.prototype.verticalFor = function(element) {
      var j, len, ref, vert, vertical;
      if (!element.classList.contains('vertical')) {
        while (!element.classList.contains('vertical' || !element)) {
          element = element.parentNode;
        }
      }
      ref = this.verticals;
      for (j = 0, len = ref.length; j < len; j++) {
        vert = ref[j];
        if (vert.id === element.id) {
          vertical = vert;
        }
      }
      return vertical;
    };

    WebView.prototype.moveToVerticalOrElementWithId = function(id, updateHash) {
      var element;
      if (updateHash == null) {
        updateHash = true;
      }
      element = find(id);
      if (!element) {
        console.info("Unable to find " + id);
        return;
      }
      this.setActiveVertical(this.verticalFor(element), false);
      if (updateHash) {
        return window.location.hash = id;
      }
    };

    WebView.prototype.scalingFactor = function() {
      return window.innerHeight / Number(document.body.dataset.deviceLargestSide);
    };

    WebView.prototype.leftOffset = function(element) {
      var hasActiveLayer, siblings;
      siblings = element.parentNode.childNodes;
      hasActiveLayer = Array.prototype.some.call(siblings, function(element) {
        return element.className === 'active-layer';
      });
      if (hasActiveLayer || this.scalingFactor() < 1) {
        return "0px";
      } else {
        return "50%";
      }
    };

    WebView.prototype.topOffset = function(element) {
      var margin, top, vertical;
      vertical = this.verticalFor(element);
      margin = -parseInt(element.style.marginTop) * this.scalingFactor();
      top = element.getBoundingClientRect().top - vertical.element.getBoundingClientRect().top;
      return top + margin;
    };

    WebView.prototype.applyScaling = function(element, origin) {
      if (origin == null) {
        origin = (this.leftOffset(element)) + " 0px 0px";
      }
      element.style.transform = "scale(" + (this.scalingFactor()) + ")";
      element.style.webkitTransform = "scale(" + (this.scalingFactor()) + ")";
      element.style.webkitTransformOrigin = origin;
      return element.style.transformOrigin = origin;
    };

    WebView.prototype.scale = function() {
      var j, len, newWidth, ref, section, width;
      ref = document.querySelectorAll('.active .active-layer, .active .deck-layer');
      for (j = 0, len = ref.length; j < len; j++) {
        section = ref[j];
        this.applyScaling(section);
      }
      width = document.body.dataset.deviceLargestSide;
      newWidth = Number(width) * this.scalingFactor();
      return this.activeVertical.element.style.width = newWidth + "px";
    };

    return WebView;

  })();

  this.WebView = WebView;

  Panner = (function() {
    function Panner(element1) {
      this.element = element1;
      this.perform = bind(this.perform, this);
      this.clear = bind(this.clear, this);
      this.start = bind(this.start, this);
      this.dragDown = false;
      this.startX = null;
      this.startY = null;
      this.element.addEventListener("mousedown", this.start);
      document.addEventListener("mouseup", this.clear);
      document.addEventListener("mousemove", this.perform);
    }

    Panner.prototype.start = function(e) {
      e.preventDefault();
      this.dragDown = true;
      this.startX = e.pageX;
      return this.startY = e.pageY;
    };

    Panner.prototype.clear = function() {
      return this.dragDown = false;
    };

    Panner.prototype.perform = function(e) {
      if (this.dragDown) {
        e.preventDefault();
        this.element.scrollLeft = this.element.scrollLeft + (this.startX - e.pageX);
        this.element.scrollTop = this.element.scrollTop + (this.startY - e.pageY);
        this.startX = e.pageX;
        return this.startY = e.pageY;
      }
    };

    return Panner;

  })();

  this.Panner = Panner;

  ref = document.querySelectorAll('.block.pan');
  for (j = 0, len = ref.length; j < len; j++) {
    img = ref[j];
    new Panner(img);
  }

  Dragger = (function() {
    function Dragger(element1, callback, callbackRight) {
      this.element = element1;
      this.callback = callback;
      this.callbackRight = callbackRight;
      this.perform = bind(this.perform, this);
      this.clear = bind(this.clear, this);
      this.start = bind(this.start, this);
      this.dragDown = false;
      this.dragWidth = 50;
      this.startX = null;
      this.element.addEventListener("mousedown", this.start);
      document.addEventListener("mouseup", this.clear);
      this.element.addEventListener("mousemove", this.perform);
    }

    Dragger.prototype.start = function(e) {
      this.dragDown = true;
      return this.startX = e.pageX;
    };

    Dragger.prototype.clear = function() {
      return this.dragDown = false;
    };

    Dragger.prototype.perform = function(e) {
      if (this.dragDown) {
        if (this.startX - e.pageX > this.dragWidth) {
          this.callback();
          this.clear();
        }
        if (e.pageX - this.startX > this.dragWidth) {
          this.callbackRight();
          return this.clear();
        }
      }
    };

    return Dragger;

  })();

  SlideTransition = (function() {
    function SlideTransition() {}

    SlideTransition.prototype.duration = 0.5;

    SlideTransition.prototype.show = function(element) {
      return element.style.left = "0";
    };

    SlideTransition.prototype["in"] = function(element) {
      element.style.transition = "left " + this.duration + "s 0s linear";
      return this.show(element);
    };

    SlideTransition.prototype.out = function(element) {
      element.style.transition = "left " + this.duration + "s 0s linear";
      return element.style.left = "-100%";
    };

    SlideTransition.prototype.prepare = function(element) {
      return element.style.left = "100%";
    };

    SlideTransition.prototype.reset = function(element) {
      return element.style.left = "-100%";
    };

    SlideTransition.prototype.inRight = function(element) {
      return this["in"](element);
    };

    SlideTransition.prototype.outRight = function(element) {
      element.style.transition = "left " + this.duration + "s 0s linear";
      return element.style.left = "100%";
    };

    return SlideTransition;

  })();

  FadeTransition = (function() {
    function FadeTransition() {}

    FadeTransition.prototype.duration = 2;

    FadeTransition.prototype.show = function(element) {
      return element.style.opacity = "1";
    };

    FadeTransition.prototype["in"] = function(element) {
      element.style.transition = "opacity " + this.duration + "s 0s ease-in-out";
      return this.show(element);
    };

    FadeTransition.prototype.out = function(element) {
      element.style.transition = "opacity " + this.duration + "s 0s ease-in-out";
      return element.style.opacity = "0";
    };

    FadeTransition.prototype.prepare = function(element) {
      return element.style.opacity = "0";
    };

    FadeTransition.prototype.reset = function(element) {
      return element.style.opacity = "0";
    };

    FadeTransition.prototype.inRight = function(element) {
      return this["in"](element);
    };

    FadeTransition.prototype.outRight = function(element) {
      return this.out(element);
    };

    return FadeTransition;

  })();

  NoneTransition = (function() {
    function NoneTransition() {}

    NoneTransition.prototype.duration = 0;

    NoneTransition.prototype.show = function(element) {
      return element.style.opacity = "1";
    };

    NoneTransition.prototype["in"] = function(element) {
      return this.show(element);
    };

    NoneTransition.prototype.out = function(element) {
      return element.style.opacity = "0";
    };

    NoneTransition.prototype.prepare = function(element) {
      return element.style.opacity = "0";
    };

    NoneTransition.prototype.reset = function(element) {
      return element.style.opacity = "0";
    };

    NoneTransition.prototype.inRight = function(element) {
      return this["in"](element);
    };

    NoneTransition.prototype.outRight = function(element) {
      return this.out(element);
    };

    return NoneTransition;

  })();

  transitionTable = {
    slide: SlideTransition,
    fade: FadeTransition,
    fadein: FadeTransition,
    none: NoneTransition
  };

  Slideshow = (function() {
    function Slideshow(element1) {
      this.element = element1;
      this.reverseTransitionComplete = bind(this.reverseTransitionComplete, this);
      this.transitionComplete = bind(this.transitionComplete, this);
      this.continousPlay = bind(this.continousPlay, this);
      this.dragRight = bind(this.dragRight, this);
      this.dragLeft = bind(this.dragLeft, this);
      this.id = this.element.id;
      this.transitionType = this.element.dataset.transition || 'slide';
      this.autoplay = JSON.parse(this.element.dataset.autoplay || "false");
      this.autoplayInterval = this.element.dataset.autoplayInterval;
      this.userScrollable = JSON.parse(this.element.dataset.userScrollable || "false");
      this.showPageIndicator = JSON.parse(this.element.dataset.showPageIndicator || "false");
      this.looping = JSON.parse(this.element.dataset.looping || "false");
      this.transitionHandler = new transitionTable[this.transitionType]();
      this.element.slideshow = this;
      this.init();
      if (this.userScrollable) {
        new Dragger(this.element, this.dragLeft, this.dragRight);
      }
    }

    Slideshow.prototype.init = function() {
      var current, j, len, ref, slide, v;
      ref = this.slides();
      for (j = 0, len = ref.length; j < len; j++) {
        slide = ref[j];
        this.reset(slide);
        if (v = this.inlineVideo(slide)) {
          v.pause();
        }
      }
      this.goto(0);
      current = this.current();
      if (current) {
        this.show(current);
        this.reset(this.previous());
        return this.prepare(this.next());
      }
    };

    Slideshow.prototype.dragLeft = function() {
      this.pause();
      this.transition();
      return this.resume();
    };

    Slideshow.prototype.dragRight = function() {
      this.pause();
      this.reverseTransition();
      return this.resume();
    };

    Slideshow.prototype.visible = function() {
      this.init();
      this.contentIn(this.current());
      return this.resume();
    };

    Slideshow.prototype.hidden = function() {
      this.pause();
      return this.contentOut(this.current());
    };

    Slideshow.prototype.slides = function() {
      return this.element.children;
    };

    Slideshow.prototype.at = function(i) {
      return this.slides()[i];
    };

    Slideshow.prototype.current = function() {
      return this.at(this.currentId);
    };

    Slideshow.prototype.nextId = function() {
      if (this.last()) {
        if (this.looping) {
          return 0;
        }
      } else {
        return this.currentId + 1;
      }
    };

    Slideshow.prototype.previousId = function() {
      if (this.first()) {
        if (this.looping) {
          return this.slides().length - 1;
        }
      } else {
        return this.currentId - 1;
      }
    };

    Slideshow.prototype.next = function() {
      if (this.nextId() != null) {
        return this.at(this.nextId());
      }
    };

    Slideshow.prototype.previous = function() {
      if (this.previousId() != null) {
        return this.at(this.previousId());
      }
    };

    Slideshow.prototype.goto = function(i) {
      return this.currentId = i;
    };

    Slideshow.prototype.continousPlay = function() {
      if (this.nextId() != null) {
        this.transition();
        return this.timer = setTimeout(this.continousPlay, this.autoplayInterval * 1000);
      }
    };

    Slideshow.prototype.resume = function() {
      if (this.autoplay) {
        return this.play();
      }
    };

    Slideshow.prototype.play = function() {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      return this.timer = setTimeout(this.continousPlay, this.autoplayInterval * 1000);
    };

    Slideshow.prototype.pause = function() {
      if (this.timer != null) {
        return clearTimeout(this.timer);
      }
    };

    Slideshow.prototype.first = function() {
      return this.currentId === 0;
    };

    Slideshow.prototype.last = function() {
      return this.currentId + 1 === this.slides().length;
    };

    Slideshow.prototype.reset = function(element) {
      if (element) {
        element.style.transition = "";
        return this.transitionHandler.reset(element);
      }
    };

    Slideshow.prototype.prepare = function(element) {
      if (element) {
        element.style.transition = "";
        return this.transitionHandler.prepare(element);
      }
    };

    Slideshow.prototype.show = function(element) {
      element.style.transition = "";
      return this.transitionHandler.show(element);
    };

    Slideshow.prototype.tick = function() {
      return this.transitionHandler.duration * 1000 + 1;
    };

    Slideshow.prototype.contentIn = function(element) {
      var j, k, len, len1, ref, ref1, results, trigger, v;
      if (element) {
        if ((v = this.inlineVideo(element)) && v.autoplay) {
          v.play();
        }
        ref = element.getElementsByClassName('trigger-visible link-to-media');
        for (j = 0, len = ref.length; j < len; j++) {
          trigger = ref[j];
          triggerMedia(trigger);
        }
        ref1 = element.getElementsByClassName('trigger-visible link-to-popup');
        results = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          trigger = ref1[k];
          results.push(handlePopup(trigger));
        }
        return results;
      }
    };

    Slideshow.prototype.contentOut = function(element) {
      var j, k, len, len1, ref, ref1, results, trigger, v;
      if (element) {
        if ((v = this.inlineVideo(element))) {
          v.pause();
        }
        ref = element.getElementsByClassName('trigger-hidden link-to-media');
        for (j = 0, len = ref.length; j < len; j++) {
          trigger = ref[j];
          triggerMedia(trigger);
        }
        ref1 = element.getElementsByClassName('trigger-hidden link-to-popup');
        results = [];
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          trigger = ref1[k];
          results.push(handlePopup(trigger));
        }
        return results;
      }
    };

    Slideshow.prototype.inlineVideo = function(element) {
      var inline, j, len, ref;
      ref = element.getElementsByClassName('inline media');
      for (j = 0, len = ref.length; j < len; j++) {
        inline = ref[j];
        return childVideo(inline);
      }
    };

    Slideshow.prototype.transition = function() {
      this.transitionHandler.out(this.current());
      this.transitionHandler["in"](this.next());
      this.contentIn(this.next());
      return setTimeout(this.transitionComplete, this.tick());
    };

    Slideshow.prototype.transitionComplete = function() {
      this.contentOut(this.current());
      this.goto(this.nextId());
      this.reset(this.previous());
      return this.prepare(this.next());
    };

    Slideshow.prototype.reverseTransition = function() {
      this.transitionHandler.outRight(this.current());
      this.transitionHandler.inRight(this.previous());
      this.contentIn(this.previous());
      return setTimeout(this.reverseTransitionComplete, this.tick());
    };

    Slideshow.prototype.reverseTransitionComplete = function() {
      this.contentOut(this.current());
      this.goto(this.previousId());
      this.reset(this.previous());
      return this.prepare(this.next());
    };

    return Slideshow;

  })();

  this.Slideshow = Slideshow;

  resumeSlideshowFor = function(element) {
    var slideshow;
    slideshow = findAncestor(element, "slideshow");
    if (slideshow) {
      return slideshow.slideshow.resume();
    }
  };

  pauseSlideshowFor = function(element) {
    var slideshow;
    slideshow = findAncestor(element, "slideshow");
    if (slideshow) {
      return slideshow.slideshow.pause();
    }
  };

  find = function(id) {
    var error;
    try {
      return document.getElementById(id);
    } catch (_error) {
      error = _error;
      console.log(error);
      return null;
    }
  };

  findAncestor = function(el, sel) {
    el = el.parentElement;
    while (el && !el.classList.contains(sel)) {
      el = el.parentElement;
    }
    return el;
  };

  modalPopupIsShown = function(isIt) {
    var root;
    root = document.getElementsByTagName('html')[0];
    if (root) {
      return root.dataset.isPopupShown = isIt;
    }
  };

  isModalPopupShown = function() {
    var root;
    root = document.getElementsByTagName('html')[0];
    if (root) {
      return root.dataset.isPopupShown === "true";
    } else {
      return false;
    }
  };

  setChildControls = function(element, value) {
    var child, j, len, ref, results;
    if (element.tagName === "VIDEO") {
      return element.controls = value;
    } else {
      ref = element.children;
      results = [];
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        results.push(setChildControls(child, value));
      }
      return results;
    }
  };

  isModal = function(element) {
    return element.classList.contains('modal-popup');
  };

  hide = function(element) {
    var parent, slideshow, sourceId;
    if (isModal(element)) {
      if (element.id.slice(-'_clone'.length) === '_clone') {
        sourceId = element.id.slice(0, -'_clone'.length);
        parent = find(sourceId);
        resumeSlideshowFor(parent);
        if (slideshow = element.querySelector('.slideshow')) {
          slideshow.slideshow.hidden();
        }
      } else {
        element = find(element.id + '_clone');
      }
    }
    if (element) {
      element.classList.add('hidden');
      element.classList.remove('shown');
      return setChildControls(element, false);
    }
  };

  show = function(element) {
    var slideshow;
    if (isModal(element)) {
      pauseSlideshowFor(element);
      element = copyPopupToVertical(element);
      if (slideshow = element.querySelector('.slideshow')) {
        slideshow.slideshow.visible();
      }
    }
    element.classList.remove('hidden');
    element.classList.add('shown');
    setChildControls(element, true);
    return element;
  };

  copyPopupToVertical = function(element) {
    var closeButton, foundNode, iframe, j, len, newNode, popupSlideshow, ref, v;
    document.body.addEventListener('click', closeOpenModalPopups);
    newNode = element.cloneNode(true);
    if (newNode.id.slice(-'_clone'.length) === '_clone') {
      return element;
    }
    newNode.id = newNode.id + '_clone';
    if (foundNode = find(newNode.id)) {
      return foundNode;
    }
    ref = newNode.getElementsByTagName('iframe');
    for (j = 0, len = ref.length; j < len; j++) {
      iframe = ref[j];
      scaleHtmlContent(iframe);
    }
    if (!element.dataset.noscale) {
      webview.applyScaling(newNode.firstElementChild, "0px 0px");
    }
    newNode.firstElementChild.style.transform += " translate(-50%, -50%)";
    if (newNode.firstElementChild.style.webkitTransform !== void 0) {
      if (newNode.firstElementChild.style.webkitTransform.indexOf("translate") < 0) {
        newNode.firstElementChild.style.webkitTransform += " translate(-50%, -50%)";
      }
    }
    document.body.appendChild(newNode);
    closeButton = setUpClosePopupButton(newNode);
    if (v = childVideo(newNode)) {
      closeButton.addEventListener('click', function() {
        return v.pause();
      });
    }
    if (popupSlideshow = newNode.querySelector('.slideshow')) {
      new Slideshow(popupSlideshow);
    }
    return newNode;
  };

  closeOpenModalPopups = function() {
    var element, j, len, ref, v;
    ref = document.getElementsByClassName('modal-popup shown');
    for (j = 0, len = ref.length; j < len; j++) {
      element = ref[j];
      if (element.id.slice(-'_clone'.length) === '_clone') {
        hidePopup(element);
        if (v = childVideo(element)) {
          v.pause();
        }
      }
    }
    return document.body.removeEventListener('click', closeOpenModalPopups);
  };

  childVideo = function(elem) {
    var child, j, len, ref, v;
    if (elem.tagName === "VIDEO") {
      return elem;
    } else {
      ref = elem.children;
      for (j = 0, len = ref.length; j < len; j++) {
        child = ref[j];
        if (v = childVideo(child)) {
          return v;
        }
      }
    }
    return null;
  };

  setUpClosePopupButton = function(modal) {
    var closeButton;
    closeButton = modal.querySelector('button');
    if (closeButton) {
      closeButton.addEventListener('click', function(e) {
        return hidePopup(modal);
      });
    }
    return closeButton;
  };

  jumplink = function(link) {
    return link.addEventListener('click', function(e) {
      var element, location, targetVertical;
      location = e.target.href.split('#')[1];
      element = find(location);
      targetVertical = webview.verticalFor(element);
      if (webview.activeVertical.id !== targetVertical.id) {
        window.location.hash = location;
      }
      if (e.target.classList.contains('link-to-bottom')) {
        window.scrollTo(0, window.innerHeight);
      } else if (e.target.classList.contains('link-to-top')) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo(0, webview.topOffset(element));
      }
      return e.preventDefault();
    });
  };

  ref = document.querySelectorAll('.link-to-vertical,.link-to-bottom');
  for (j = 0, len = ref.length; j < len; j++) {
    link = ref[j];
    jumplink(link);
  }

  isAboveBreakpoint = function(element) {
    var elementTop, transitionPoint;
    elementTop = element.getBoundingClientRect().top;
    transitionPoint = parseInt(document.body.dataset.deviceLargestSide * webview.activeVertical.currentScalingFactor) / 2;
    return elementTop < transitionPoint;
  };

  isWithinRange = function(element) {
    return isAboveBreakpoint(element) && element.getBoundingClientRect().top > -150;
  };

  changeDeckLayer = function(transition) {
    var deck, slide;
    deck = document.querySelector('.active .deck-layer');
    if (transition) {
      slide = find(transition.dataset.slideId);
      return deck.style.top = '-' + parseInt(slide.offsetTop * webview.activeVertical.currentScalingFactor) + 'px';
    } else {
      return deck.style.top = 0;
    }
  };

  pauseOnClose = function(closeLink) {
    return closeLink.addEventListener('click', function() {
      find(this.id + "-video").pause();
      return hide(this);
    });
  };

  ref1 = document.getElementsByClassName('video-popup');
  for (k = 0, len1 = ref1.length; k < len1; k++) {
    link = ref1[k];
    pauseOnClose(link);
  }

  setupTriggerMedia = function(mediaLink) {
    return mediaLink.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      return triggerMedia(mediaLink);
    });
  };

  triggerMedia = function(mediaLink) {
    var action, container, id, media;
    id = mediaLink.dataset.video;
    if (find(id)) {
      container = show(find(id));
    }
    action = mediaLink.dataset.action;
    media = (container || document).querySelector("#" + (id + '-video') + ",#" + (id + "-audio"));
    if (!media) {
      console.log("Unable to find media element for " + id);
      return;
    }
    switch (action) {
      case 'play':
        return playTriggerMedia(container, media);
      case 'pause':
        return pauseTriggerMedia(container, media);
      case 'open':
        return playTriggerMedia(container, media);
      case 'close':
        pauseTriggerMedia(container, media);
        if (container) {
          return hide(container);
        }
        break;
      default:
        return toggleTriggerMedia(container, media);
    }
  };

  this.triggerMedia = triggerMedia;

  playTriggerMedia = function(container, media) {
    if (media.paused) {
      webview.pause_all_playing_media();
      media.play();
      if (container) {
        return show(container);
      }
    }
  };

  pauseTriggerMedia = function(container, media) {
    if (!media.paused) {
      return media.pause();
    }
  };

  toggleTriggerMedia = function(container, media) {
    if (media.paused) {
      return playTriggerMedia(container, media);
    } else {
      return pauseTriggerMedia(container, media);
    }
  };

  ref2 = document.getElementsByClassName('link-to-media');
  for (l = 0, len2 = ref2.length; l < len2; l++) {
    link = ref2[l];
    setupTriggerMedia(link);
  }

  hideRadioGroupPopups = function(groupName) {
    var len3, m, member, radioGroup, results;
    radioGroup = document.querySelectorAll("[data-group='" + groupName + "']");
    results = [];
    for (m = 0, len3 = radioGroup.length; m < len3; m++) {
      member = radioGroup[m];
      results.push(hide(member));
    }
    return results;
  };

  showPopup = function(popupDest, popupLink) {
    if (isModal(popupDest)) {
      modalPopupIsShown(true);
    }
    if (popupLink && popupLink.classList.contains('trigger-tap')) {
      pauseSlideshowFor(popupLink);
    }
    hideRadioGroupPopups(popupDest.dataset.group);
    return show(popupDest);
  };

  hidePopup = function(popupDest, popupLink) {
    if (isModal(popupDest)) {
      modalPopupIsShown(false);
    }
    if (popupLink && popupLink.classList.contains('trigger-tap')) {
      resumeSlideshowFor(popupLink);
    }
    return hide(popupDest);
  };

  togglePopup = function(popupDest, popupLink) {
    if (isModal(popupDest)) {
      if (isModalPopupShown()) {
        return hidePopup(popupDest, popupLink);
      } else {
        return showPopup(popupDest, popupLink);
      }
    } else {
      if (popupDest.classList.contains('shown')) {
        return hidePopup(popupDest, popupLink);
      } else {
        return showPopup(popupDest, popupLink);
      }
    }
  };

  setupPopups = function(popupLink) {
    return popupLink.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      return handlePopup(this);
    });
  };

  handlePopup = function(popupLink) {
    var popupAction, popupDest, popupDestId, ref3;
    ref3 = popupLink.dataset.popup.split('/'), popupDestId = ref3[0], popupAction = ref3[1];
    popupDest = find(popupDestId);
    if (!popupDest) {
      console.log("unable to find " + popupDestId);
      return;
    }
    switch (popupAction) {
      case 'open':
        return showPopup(popupDest, popupLink);
      case 'close':
        return hidePopup(popupDest, popupLink);
      default:
        return togglePopup(popupDest, popupLink);
    }
  };

  ref3 = document.getElementsByClassName('link-to-popup');
  for (m = 0, len3 = ref3.length; m < len3; m++) {
    link = ref3[m];
    setupPopups(link);
  }

  scaleHtmlContent = function(container) {
    return container.addEventListener('load', function(e) {
      var applyHtmlScaling, error, noScript, scaling, viewport, viewportWidth, viewportWidthRegExp;
      noScript = function(element) {
        return element.nodeName.toUpperCase() !== 'SCRIPT';
      };
      applyHtmlScaling = function(scaling) {
        container.contentDocument.body.style.margin = "0";
        if (Array.prototype.slice.call(container.contentDocument.body.children, 0).filter(noScript).length === 1) {
          container.contentDocument.body.firstElementChild.style.margin = "0";
        }
        container.contentDocument.body.style.transform = "scale(" + scaling + ")";
        container.contentDocument.body.style.webkitTransform = "scale(" + scaling + ")";
        container.contentDocument.body.style.transformOrigin = "0px 0px";
        return container.contentDocument.body.style.webkitTransformOrigin = "0px 0px";
      };
      try {
        if (container.dataset.scale === '1' && this.contentDocument.querySelectorAll("[name=viewport]")) {
          applyHtmlScaling(2.0);
        } else if (this.contentDocument.querySelector("[name=viewport]")) {
          viewport = this.contentDocument.querySelector("[name=viewport]").getAttribute('content');
          viewportWidthRegExp = new RegExp(".*width=(\\d+)");
          viewportWidth = viewport.match(viewportWidthRegExp)[1];
          scaling = container.dataset.scalingFactor || Number(container.style.width.replace('px', '')) / Number(viewportWidth);
          applyHtmlScaling(scaling);
        } else {
          scaling = container.dataset.scalingFactor || Number(container.style.width.replace('px', '')) / this.contentDocument.body.offsetWidth;
          applyHtmlScaling(scaling);
        }
        container.dataset.scalingFactor = scaling;
        if (this.contentWindow.onViewEnteredInside) {
          return this.contentWindow.onViewEnteredInside();
        }
      } catch (_error) {
        error = _error;
      }
    });
  };

  ref4 = document.getElementsByTagName('iframe');
  for (n = 0, len4 = ref4.length; n < len4; n++) {
    iframe = ref4[n];
    scaleHtmlContent(iframe);
  }

  scrollTop = function() {
    return Math.max(document.body.scrollTop, document.documentElement.scrollTop);
  };

  scrollTopTo = function(newScrollTop) {
    document.body.scrollLeft = document.documentElement.scrollLeft = 0;
    document.body.scrollRight = document.documentElement.scrollRight = 0;
    return document.body.scrollTop = document.documentElement.scrollTop = newScrollTop;
  };

  smoothScrollTo = function(target, duration) {
    var distance, endTime, smoothStep, startTime, startTop;
    startTime = Date.now();
    endTime = startTime + Math.round(duration);
    startTop = scrollTop();
    distance = Math.round(target) - startTop;
    smoothStep = function(start, end, point) {
      var x;
      if (point <= start) {
        return 0;
      }
      if (point >= end) {
        return 1;
      }
      x = (point - start) / (end - start);
      return x * x * (3 - (2 * x));
    };
    return new Promise(function(resolve, reject) {
      var scrollFrame;
      scrollFrame = function() {
        var frameTop, now, point;
        now = Date.now();
        point = smoothStep(startTime, endTime, now);
        frameTop = Math.round(startTop + distance * point);
        scrollTopTo(frameTop);
        if (now >= endTime) {
          resolve();
          window.addEventListener('scroll', webview.activeVertical.snapScrollListener);
          return;
        }
        return setTimeout(scrollFrame, 0);
      };
      return setTimeout(scrollFrame, 0);
    });
  };

  webview = new WebView(find('webview'));

  if (webview.backButton) {
    webview.backButton.addEventListener('click', webview.moveToPrevious);
  }

  if (webview.nextButton) {
    webview.nextButton.addEventListener('click', webview.moveToNext);
  }

  document.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
      case 37:
        webview.moveToPrevious();
        return e.preventDefault();
      case 39:
        webview.moveToNext();
        return e.preventDefault();
    }
  });

  window.addEventListener('popstate', function() {
    return webview.moveToVerticalOrElementWithId(location.href.split('#')[1], false);
  });

}).call(this);
