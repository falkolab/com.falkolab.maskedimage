# Radio group Widget
![screenshot1](screenshot.png?raw=true "Example screenshot")

## Quick Start

### Get it
[![gitTio](http://gitt.io/badge.svg)](http://gitt.io/component/com.falkolab.maskedimage)


Download the latest distribution ZIP-file and consult the
[Titanium Documentation](http://docs.appcelerator.com/titanium/latest/#!/guide/Using_a_Module) on how install it, or simply use the [gitTio CLI](http://gitt.io/cli):

`$ gittio install com.falkolab.maskedimage`

## Usage

This module provide support form masking images for both iOS and Android.

For android support you must additionaly install `miga.tintimage` module.

`$ gittio install miga.tintimage`

Also you must install `com.geraudbourdin.svgview` if you planing to use SVG masks.

For test purposes you can use demo masks from this repository.

For both platform you can use `mode` attribute as string from list:

* `clear`
* `darken`
* `dst_atop`
* `dst_in`
* `dst_out`
* `dst_over`
* `lighten`
* `multiply`
* `overlay`
* `screen`
* `src_atop`
* `src_in`
* `src_out`
* `xor`

Or `MaskedImage` titanium ui view `mode` attribute constants **(only for ios)**.

#### Example

    <Alloy>
    	<Window class="container" backgroundColor="#45474F">		
    		<View width="300" height="240">					
    			<MaskedImage module="com.falkolab.maskedimage"
    				image="/images/freewilly.jpg"
    				mask="/images/mask.svg"					
    				mode="src_in"
    				/>			
    		</View>			
    	</Window>
    </Alloy>


Give me a star if the widget was useful for you or
