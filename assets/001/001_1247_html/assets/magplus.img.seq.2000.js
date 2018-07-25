Number.prototype.mod = function(n) {
	return ((this%n)+n)%n;
}


$.fn.imgseq = function(options){
	var defaults = {
		stickyness:10,
		play_direction_forward: true,  // true = 1- 10, false 10 - 1
		swipe_direction: true, // true = left to right, false = right to left for next image
		autoplay:false,		
		show_frames: 0,
		images_per_second: 25,
		swipe_horizontal: true,
		use_acceleration: true,
		loop: true
	}; 
	var options = $.extend({}, defaults, options);
	
		
	return this.each(function() {
		var $this = $(this);
		
		var start_image = 0;
		var current_image = 0;
		var current_pos = 0;
		var activity = false;
		var nr_loaded_images = 0;
		var nr_all_images = options.images.length;
		var shown_frames = 1;
		var loaded_complete = false;
		
		var move_vars = {
			timer:0,
			last:0,
			now:0,
			offset:0,
			accel:0
		}
		
		
		$(document).bind('touchstart', function(e){
			e.preventDefault();
			if (!loaded_complete) return;
			activity = true;
			options.autoplay = false;
			start_pos = options.swipe_horizontal ? event.targetTouches[0].clientX : event.targetTouches[0].clientY;
			start_image = current_image;			
			move_vars.now = start_pos;
			
		}).bind('touchmove', function(e){
			e.preventDefault();
			if (!loaded_complete) return;
			if (event.targetTouches.length != 1) return;
			if (!activity) return;

			current_pos = options.swipe_horizontal ? event.targetTouches[0].clientX : event.targetTouches[0].clientY;
			var diff_delta = options.swipe_direction ? current_pos - start_pos : start_pos - current_pos;
			var _image_player = (diff_delta) / options.stickyness;		
			var _next_image = Math.ceil(_image_player);

			_update_move_vars(current_pos);	

			var n_i = options.play_direction_forward ? _next_image + start_image : start_image - _next_image;
			
			if (!options.loop) {
				if (n_i <= 0) {
					n_i = 0;
				}
				if (n_i >= nr_all_images) {
					n_i = nr_all_images - 1;
				}
			}
			
			var next_image = (n_i).mod(nr_all_images);
			if (next_image != current_image) {
				current_image = next_image;				
				$this.attr('src',options.path+options.images[current_image]);			
			}
			
		}).bind('touchend', function(e){
			if (!loaded_complete) return;			
			start_image = current_image;
			start_pos = current_pos;
			activity = false;			
		})
		
		$(document).bind('mousedown', function(e){
			e.preventDefault();
			if (!loaded_complete) return;
			activity = true;
			options.autoplay = false;
			start_pos = options.swipe_horizontal ? e.pageX : e.pageY;
			start_image = current_image;			

			move_vars.now = start_pos;
		}).bind('mousemove', function(e){
			e.preventDefault();
			if (!loaded_complete) return;		
			if (!activity) return;
			

			current_pos = options.swipe_horizontal ? e.pageX : e.pageY;
			var diff_delta = options.swipe_direction ? current_pos - start_pos : start_pos - current_pos;
			var _image_player = (diff_delta) / options.stickyness;		
			var _next_image = Math.ceil(_image_player);

			_update_move_vars(current_pos);	

			var n_i = options.play_direction_forward ? _next_image + start_image : start_image - _next_image;
			
			if (!options.loop) {
				if (n_i <= 0) {
					n_i = 0;
				}
				if (n_i >= nr_all_images) {
					n_i = nr_all_images - 1;
				}
			}
						
			var next_image = (n_i).mod(nr_all_images);
			if (next_image != current_image) {
				current_image = next_image;				
				$this.attr('src',options.path+options.images[current_image]);			
			}
			
		}).bind('mouseup', function(e){
			e.preventDefault();
			if (!loaded_complete) return;
						
			start_image = current_image;
			start_pos = current_pos;
			activity = false;

		});

		$this.next_image = function(){
			shown_frames++;
			
			start_image = options.play_direction_forward ? start_image + 1 : start_image -1 ;
			current_image = (start_image).mod(options.images.length);
			
			$this.attr('src',options.path+options.images[current_image]);

			if (options.show_frames != 0 && options.autoplay) {
				options.autoplay = shown_frames < options.show_frames;
			}

			if (options.autoplay) {
				setTimeout($this.next_image, 1000 / options.images_per_second);				
			}
		}

		$this.start_autoplay = function(){
			options.autoplay = options.autoplay || options.show_frames != 0;
			if (options.autoplay) {
				setTimeout($this.next_image, 1000 / options.images_per_second);				
			}
		}
		
		var _global_accel = {
			accel:0,
			velocity:0,
			accu: 0
		};
		
		var _update_move_vars = function(pos){
			move_vars.timer++;
			move_vars.last = move_vars.now;
			move_vars.now = pos;
			move_vars.offset = move_vars.now - move_vars.last;
			move_vars.accel = move_vars.offset / move_vars.timer;
		}
		var _reset_move_vars = function(){
			move_vars.timer = 0;
			move_vars.offset = 0;
			move_vars.accel = 0;				
		}
		var _reset_global_accel = function(){
			_global_accel.accel = 0;
	        _global_accel.velocity = 0;
			_global_accel.accu = 0;
		}


		var current_velo = 0;
		
		
		var _move_timer = setInterval(function(){
			_global_accel.accel = move_vars.accel;
	        _global_accel.velocity = (_global_accel.velocity + (_global_accel.accel / 4)) * 0.96;

			current_velo = Math.round(_global_accel.velocity);
			
			if (!activity && current_velo != 0 && options.use_acceleration) {
				current_pos = current_pos + current_velo;
				
				var diff_delta = options.swipe_direction ? current_pos - start_pos : start_pos - current_pos;
				var _image_player = (diff_delta) / options.stickyness;
				
				var _next_image = Math.ceil(_image_player);					
				var n_i = options.play_direction_forward ? _next_image + start_image : start_image - _next_image;
				
				if (!options.loop) {
					if (n_i < 0) {
						n_i = 0;
					}
					if (n_i > nr_all_images) {
						n_i = nr_all_images - 1;
					}
				}
												
				var next_image = (n_i).mod(nr_all_images);
				if (next_image != current_image) {
					current_image = next_image;				
					$this.attr('src',options.path+options.images[current_image]);			
				}					
		
			}
			_reset_move_vars();
		}, 20)

		
		var _image_loaded = function(){
			nr_loaded_images++;
			if (nr_all_images == nr_loaded_images) {
				loaded_complete = true;
				$this.start_autoplay();
			}
		}
		
		var _load_images = function(){
			var nr_images = options.images.length;
			for( i=0;i<nr_images;i++) {
				var e = new Image();
				e.onload = function(){
					_image_loaded();
				}
				e.onerror = function(){
					_image_loaded();
				}
				e.src = options.path+options.images[i];
			}
		}
		
		_load_images();



		
	});
};