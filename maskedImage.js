if(Ti.Platform.osname === 'iphone') {
var modesMap = { 
	// unknown: add, dst, src, src_over
    'clear': Titanium.UI.iOS.BLEND_MODE_CLEAR,    
    'darken': Titanium.UI.iOS.BLEND_MODE_DARKEN,
    'dst_atop': Titanium.UI.iOS.BLEND_MODE_DESTINATION_ATOP,
    'dst_in': Titanium.UI.iOS.BLEND_MODE_DESTINATION_IN,
    'dst_out': Titanium.UI.iOS.BLEND_MODE_DESTINATION_OUT,
    'dst_over': Titanium.UI.iOS.BLEND_MODE_DESTINATION_OVER,
    'lighten': Titanium.UI.iOS.BLEND_MODE_LIGHTEN,
    'multiply': Titanium.UI.iOS.BLEND_MODE_MULTIPLY,
    'overlay': Titanium.UI.iOS.BLEND_MODE_OVERLAY,
    'screen': Titanium.UI.iOS.BLEND_MODE_SCREEN,
    'src_atop': Titanium.UI.iOS.BLEND_MODE_SOURCE_ATOP,
    'src_in': Titanium.UI.iOS.BLEND_MODE_SOURCE_IN,
    'src_out': Titanium.UI.iOS.BLEND_MODE_SOURCE_OUT,
    'xor': Titanium.UI.iOS.BLEND_MODE_XOR
    // has not map
    //Titanium.UI.iOS.BLEND_MODE_COLOR
    //Titanium.UI.iOS.BLEND_MODE_COLOR_BURN
    //Titanium.UI.iOS.BLEND_MODE_COLOR_DODGE
    //Titanium.UI.iOS.BLEND_MODE_COPY
    //Titanium.UI.iOS.BLEND_MODE_DIFFERENCE
    //Titanium.UI.iOS.BLEND_MODE_EXCLUSION
    //Titanium.UI.iOS.BLEND_MODE_HARD_LIGHT
    //Titanium.UI.iOS.BLEND_MODE_HUE
    //Titanium.UI.iOS.BLEND_MODE_LUMINOSITY    
    //Titanium.UI.iOS.BLEND_MODE_NORMAL    
    //Titanium.UI.iOS.BLEND_MODE_PLUS_DARKER
    //Titanium.UI.iOS.BLEND_MODE_PLUS_LIGHTER
    //Titanium.UI.iOS.BLEND_MODE_SATURATION    
    //Titanium.UI.iOS.BLEND_MODE_SOFT_LIGHT     
    }; 
}

function pick(obj) {
	var copy = {};
	var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
	keys.forEach(function(key) {
		if ( key in obj)
			copy[key] = obj[key];
	});
	return copy;
};

function omit(obj) {
	var copy = {};
	var keys = Array.prototype.concat.apply(Array.prototype, Array.prototype.slice.call(arguments, 1));
	for (var key in obj) {
		if (keys.indexOf(key) === -1)
			copy[key] = obj[key];
	}
	return copy;
};

function getImageFileFromSVG(mask, width, height) {
	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationCacheDirectory, 
		Ti.Utils.md5HexDigest(mask + width + height + 'maskedImage.mask'));
		
	if (!file.exists()) {
		var blob = require('com.geraudbourdin.svgview').createView({
			image : mask,
			width : width,
			height : height,
			left : 0,
			top : 0
		}).toImage();
							
		if (!file.write(blob)) {
			Ti.API.error("Can't save to file:", opts.mask);				
			return null;
		}			
		
		if (Ti.Platform.osname === 'android') {
			return blob;
		} else if(Ti.Platform.osname === 'iphone') {				
			return file.getNativePath();
		}
	} else {
		if (Ti.Platform.osname === 'android') {
			// fix for tint module
			return Ti.UI.createImageView({
				image: file.read(),
				width: Ti.UI.SIZE,
				height: Ti.UI.SIZE
			}).toBlob();
		} else if(Ti.Platform.osname === 'iphone') {
			return file.getNativePath();
		}			
	}		
	return null;	
}

exports.createMaskedImage = function(opts) {
	var mask = opts.mask;
	    
	mask && (isSVGMask = mask.toLocaleLowerCase().indexOf('.svg') !== -1);	    

	if (Ti.Platform.osname === 'android') {		
		var imageOpts = omit(opts, 'mode', 'mask');
		typeof imageOpts.width === 'undefined' && (imageOpts.width = Ti.UI.FILL);
		typeof imageOpts.height === 'undefined' && (imageOpts.height = Ti.UI.FILL);

		var view = Ti.UI.createImageView(imageOpts);
		imageOpts = undefined;

		if (opts.mask) {			
			var tintOpts = pick(opts, 'tint', 'mode', 'modeImage', 'mask');
				tintOpts.imageOverlay = view.toBlob();
										
			if(typeof tintOpts.mode !== 'undefined') {
			 	tintOpts.modeColor = tintOpts.mode;
			 	delete tintOpts.mode;
			}
			
			if(typeof tintOpts.tint !== 'undefined') {
				Ti.API.warn("'tint' not supported yet!");
			 	//tintOpts.color = tintOpts.tint;
			 	//delete tintOpts.tint;
			}
				
			if (isSVGMask) {				
				var max = Math.max(tintOpts.imageOverlay.width, tintOpts.imageOverlay.height);
				tintOpts.image = getImageFileFromSVG(opts.mask, 
					opts.maskWidth || max, 
					opts.maskHeight || max);				
			} else {
				tintOpts.image = Ti.UI.createImageView({
					image: opts.mask,
					width: Ti.UI.SIZE,
					height: Ti.UI.SIZE
				}).toBlob();
			}			
					
			tintOpts.image = tintOpts.image.imageAsResized(tintOpts.imageOverlay.width, tintOpts.imageOverlay.height);						
			view.image = require("miga.tintimage").tint(tintOpts);
		}
		return view;
	} else if (Ti.Platform.osname === 'iphone') {		
		var maskedImageOpts = omit(opts); // like copy
		
		if(typeof maskedImageOpts.mode === 'string') {
			maskedImageOpts.mode = modesMap[maskedImageOpts.mode];
			if(typeof maskedImageOpts.mode == 'undefined') {
				throw "Unknown mode";
			}
		}
		
		if (opts.mask) {
			if(isSVGMask) {
				var max;
				if(typeof opts.maskWidth === 'undefined' || typeof opts.maskHeight === 'undefined') {
					var size = pick(Ti.UI.createImageView({
						image : opts.image,
						width : Ti.UI.SIZE,
						height : Ti.UI.SIZE
					}).toBlob(), 'width', 'height');
					max = Math.max(size.width, size.height);					
				}
				maskedImageOpts.mask = getImageFileFromSVG(opts.mask, opts.maskWidth || max, opts.maskHeight || max);
			}
		}		
		return Titanium.UI.createMaskedImage(omit(maskedImageOpts, 'maskWidth', 'maskHeight'));
	}
	return null;
}; 