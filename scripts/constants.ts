//
// MIT License
//
// Copyright (c) 2021 TECH ESPM
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// https://github.com/tech-espm/labs-spacetrain
//

const isIOSOrSafari = (function () {
		// https://stackoverflow.com/q/9038625/3569421
		if ((navigator.userAgent.indexOf("Chrome") <= 0 && navigator.userAgent.indexOf("Safari") >= 0) ||
			(navigator.userAgent.indexOf("Mac") >= 0 && ("ontouchend" in document)))
			return true;
		switch (navigator.platform) {
			case "iPad Simulator":
			case "iPhone Simulator":
			case "iPod Simulator":
			case "iPad":
			case "iPhone":
			case "iPod":
				return true;
		}
		return false;
	})(),
	iconMarginEm = 0.25,
	iconMarginCss = "0.25em",
	smallMarginRem = 0.5,
	smallMarginCss = "0.5rem",
	largeMarginRem = 1,
	largeMarginCss = "1rem",
	animationStartDelayMS = 50,
	slowestAnimationTimeoutMS = 1020,
	slowAnimationTimeoutMS = 520,
	fastAnimationTimeoutMS = 320,
	fastestAnimationTimeoutMS = 120,
	blinkLastCounter = 7,
	blinkSingleDurationMS = 75,
	blinkTotalDurationMS = (blinkLastCounter + 1) * blinkSingleDurationMS,
	baseWidth = 1280,
	baseHeight = 720,
	alienWidthRem = 3.361930295,
	alienHeightRem = 3.361930295,
	alienWidthCss = alienWidthRem + "rem",
	alienHeightCss = alienHeightRem + "rem",
	baseFontSize = 32,
	baseHeightFontUnits = (baseHeight / baseFontSize) | 0,
	iconSize = 32;
