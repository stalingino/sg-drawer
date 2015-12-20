angular.module('sgDrawerPlugin', [])
.directive('sgDrawer', function($log, $compile){
	$log.info('sg-drawer is on the move');
	return {
		restrict: "E",
		replace: false,
		scope: {
			side: '=',
			fixed: '=',
			panel: '=',
			duration: '=',
			padding: '=',
			zIndex: '=',
			open: '='
		},
		templateUrl: function(elem, attr){
			return attr.templateUrl;
		},
		link: function(scope, elem, attrs, ctrl) {
			ctrl.init(elem);
		},
		controller: "sgDrawerController"
	};
})
.controller('sgDrawerController', function($scope, $attrs, $log, $animate){
	var self = this;
	self.oppositeSide = {'left': 'right', 'right': 'left'};
	self.winHeight = $(window).height();
	self.id = $scope.side + '-sg-drawer';
	self.handleId = self.id + '-handle';

	$scope.open = false;

	$scope.duration = $scope.duration || 300;
	$scope.padding = $scope.padding || 256;
	$scope.side = $scope.side || 'left';
	$scope.zIndex = $scope.zIndex || '99999';

	self.css = {
		'z-index': Number($scope.zIndex) + 1,
		'width': $scope.padding,
		'height': self.winHeight
	};
	self.css[$scope.side] = $scope.fixed ? '0' : '-' + $scope.padding + 'px';

	self.handleCss = {
		'height': self.winHeight + 'px',
		'z-index': $scope.zIndex
	};
	self.handleCss[$scope.side] = '0px';

	self.init = function(elem){
		self.$element = elem;
		self.$element.css(self.css).attr({'id': self.id}).addClass('animate drawer drawer-' + $scope.side);
		var wrapper = $('<div class="sg-drawer-wrapper">').append(self.$element.html());
		self.$element.empty();
		wrapper.appendTo(self.$element);
		self.$element.find('a[href^="#/"]').click(function(){
			setTimeout(function() {
				$scope.$apply(function(){
					$scope.open = false;
				});
			});
		});

		self.$mask = $('#sg-drawer-mask');
		if (!(self.$mask.length)) {
			$(document.body).append($('<div>').css(self.handleCss).attr({'id': 'sg-drawer-mask'}));
			self.$mask = $('#sg-drawer-mask').hide();
		}
		$(document.body).append($('<div>').css(self.handleCss).attr({'id': self.handleId}));
		self.$handle = $('#'+self.handleId);
		self.$handle.addClass('drawer-handle');

		self.$handle.on('touchstart', self.startDrawer);
		self.$handle.on('touchmove', self.moveDrawer);
		self.$handle.on('touchend', self.endDrawer);

		self.$element.on('touchstart', self.startCloseDrawer);
		self.$element.on('touchmove', self.moveCloseDrawer);
		self.$element.on('touchend', self.endCloseDrawer);

		self.$mask.on('mousedown touchstart', self.closeDrawer);
	}

	var sliding = startClientX = startPixelOffset = pixelOffset = 0;

	self.startDrawer = function(event){
		event.preventDefault();
		if (event.originalEvent.touches)
			event = event.originalEvent.touches[0];
		if (sliding == 0) {
			sliding = 1;
			startClientX = event.clientX;
			$(document.body).css({'overflow': 'hidden'});
			self.$element.css('transform', 'translate3d(15px,0,0)');
		}
	};

	self.moveDrawer = function(event){
		event.preventDefault();
		if (event.originalEvent.touches)
			event = event.originalEvent.touches[0];
		var deltaSlide = event.clientX - startClientX;

		if (sliding == 1 && deltaSlide != 0) {
			sliding = 2;
			startPixelOffset = 15;
		}

		if (sliding == 2) {
			var touchPixelRatio = 1;
			$log.info('Device Pixel Ratio: ' + window.devicePixelRatio);
			if (window.devicePixelRatio)
				touchPixelRatio = window.devicePixelRatio;
			pixelOffset = startPixelOffset + deltaSlide / touchPixelRatio;
			if (pixelOffset < $scope.padding)
				self.$element.css('transform', 'translate3d(' + pixelOffset + 'px,0,0)').removeClass('animate');
		}
	};

	self.openDrawer = function(){
		$('#temp').remove();
		$('<style id="temp">#' + self.id + '.animate{transform:translate3d(' + $scope.padding + 'px,0,0)}</style>').appendTo('head');
		self.$element.addClass('animate').css('transform', '');
		self.$mask.show().css({'opacity': '.8'});
		setTimeout(function() {
			$scope.$apply(function(){
				$scope.open = true;
			});
		});
	};

	self.endDrawer = function(event){
		if (sliding == 1) {
			self.endCloseDrawer(event);
		}
		if (sliding == 2) {
			sliding = 0;
			self.openDrawer();
		}
	};

	self.startCloseDrawer = function(event){
		if (event.originalEvent.touches)
			event = event.originalEvent.touches[0];
		if (sliding == 0) {
			sliding = 1;
			startClientX = event.clientX;
		}
	};

	self.moveCloseDrawer = function(event){
		event.preventDefault();
		if (event.originalEvent.touches)
			event = event.originalEvent.touches[0];
		var deltaSlide = event.clientX - startClientX;

		if (sliding == 1 && deltaSlide != 0) {
			sliding = 2;
			startPixelOffset = $scope.padding;
		}

		if (sliding == 2) {
			var touchPixelRatio = 1;
			if (event.clientX > startClientX)
				touchPixelRatio = 3;
			pixelOffset = startPixelOffset + deltaSlide / touchPixelRatio;
			if (pixelOffset < $scope.padding)
				self.$element.css('transform', 'translate3d(' + pixelOffset + 'px,0,0)').removeClass('animate');
		}
	};

	self.closeDrawer = function(){
		$('#temp').remove();
		$('<style id="temp">#' + self.id + '.animate{transform:translate3d(0,0,0)}</style>').appendTo('head');
		self.$element.addClass('animate').css('transform', '');
		self.$mask.css({'opacity': '0'}).hide();
		$(document.body).css({'overflow': 'visible'});
		setTimeout(function() {
			$scope.$apply(function(){
				$scope.open = false;
			});
		});
	};

	self.endCloseDrawer = function(event){
		var eventX = 0;
		if (event.originalEvent.changedTouches) {
			event = event.originalEvent.changedTouches[0];
			eventX = event.pageX;
		} else if (event.originalEvent.touches) {
			event = event.originalEvent.touches[0];
			eventX = event.clientX;
		}
		if (startClientX > eventX + 50) { // 50 is the sample threshold here
			self.closeDrawer();
		} else {
			self.endDrawer(event);
		}
		sliding = 0;
	};

	if (!$scope.fixed) {
		$scope.$watch(function(scope){ return scope.open; }, function(newValue, oldValue){
			if (newValue) {
				self.openDrawer();
			} else {
				self.closeDrawer();
			}
		});
	}
});
