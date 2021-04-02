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

let scaleFactor = -1, widthCss = 0, heightCss = 0,
	baseLeftCss = 0, baseTopCss = 0,
	fontSize = 0, fontSizeCss = "0px",
	musicPlaying = false,
	audioContext: AudioContext | null = null, audioBuffer: AudioBuffer | null = null, audioBufferSource: AudioBufferSourceNode | null = null,
	bgMusic: HTMLAudioElement | null = null, musicButton: HTMLElement | null = null,
	installationPrompt: Event | null = null,
	landscapeWarning: HTMLDivElement | null = null;

function ignorePromise(p: any): void {
	try {
		const nop = () => {};
		if (p && p.then)
			p.then(nop, nop);
	} catch (ex) {
		// Just ignore...
	}
}

function cancelEvent(e: Event): boolean {
	if (e) {
		if ("isCancelled" in e)
			(e as any).isCancelled = true;
		if ("preventDefault" in e)
			e.preventDefault();
		if ("stopPropagation" in e)
			e.stopPropagation();
	}
	return false;
}

function format2(x: number): string {
	return (x < 10 ? ("0" + x) : x.toString());
}

function rem2Px(rem: number): string {
	return (fontSize * rem) + "px";
}

function rem2PxNumber(rem: number): number {
	return fontSize * rem;
}

function smoothStep(input: number): number {
	// Hermite interpolation (GLSL's smoothstep)
	// https://www.opengl.org/sdk/docs/man/html/smoothstep.xhtml
	return (input * input * (3.0 - (2.0 * input)));
}

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function handleBlink(args: [number, HTMLElement]): void {
	const count = args[0], element = args[1];
	if (count > 0 && count < blinkLastCounter) {
		element.style.visibility = ((count & 1) ? "" : "hidden");
		args[0] = count + 1;
	} else {
		abortBlink(element);
	}
}

function abortBlink(element: HTMLElement): void {
	if (!element)
		return;
	const blinkInterval = element.getAttribute("data-blink-interval");
	if (blinkInterval) {
		element.setAttribute("data-blink-interval", "");
		const interval = parseInt(blinkInterval);
		if (interval)
			clearInterval(interval);
		element.style.visibility = "";
	}
}

function blink(element: HTMLElement): void {
	if (!element)
		return;
	abortBlink(element);
	element.style.visibility = "hidden";
	element.setAttribute("data-blink-interval", window.setInterval(handleBlink, blinkSingleDurationMS, [1, element]).toString())
}

function prepareButtonBlink(button: HTMLElement, insideModal: boolean, callback: ButtonCallback): void {
	button.onclick = (e) => {
		if (View.loading || View.fading || (!insideModal && Modal.visible) || !callback(e))
			return;
		blink(button);
	};
}

function zeroObject(o: any): void {
	for (let p in o) {
		switch (typeof o[p]) {
			case "function":
				break;
			case "boolean":
				o[p] = false;
				break;
			case "number":
				o[p] = 0;
				break;
			default:
				const v = o[p];
				if (Array.isArray(v))
					v.fill(null);
				o[p] = null;
				break;
		}
	}
}

function adjustWindowSize(): void {
	widthCss = window.innerWidth,
	heightCss = window.innerHeight;

	if (document.documentElement && ("clientWidth" in document.documentElement)) {
		widthCss = document.documentElement.clientWidth;
		heightCss = document.documentElement.clientHeight;
	}

	if (isIOSOrSafari) {
		let bodyRect: DOMRect | null = null;

		if (document.documentElement && ("getBoundingClientRect" in document.documentElement))
			bodyRect = document.documentElement.getBoundingClientRect();
		else if (("getBoundingClientRect" in document.body))
			bodyRect = document.body.getBoundingClientRect();

		if (bodyRect) {
			widthCss = bodyRect.right - bodyRect.left;
			heightCss = bodyRect.bottom - bodyRect.top;
		}
	}

	const transform = `scale(${Math.ceil(widthCss * 0.25)},${Math.ceil(heightCss * 0.25)})`;
	const style = View.cover.style as any;
	style["oTransform"] = transform;
	style["msTransform"] = transform;
	style["mozTransform"] = transform;
	style["webkitTransform"] = transform;
	style.transform = transform;

	const lastScaleFactor = scaleFactor,
		currentRatio = widthCss / heightCss,
		desiredRatio = baseWidth / baseHeight;

	let baseWidthCss = 0, baseHeightCss = 0;
	if (currentRatio >= desiredRatio) {
		baseHeightCss = heightCss;
		scaleFactor = heightCss / baseHeight;
		// Try to occupy the entire screen on ultrawide displays
		baseWidthCss = widthCss; // * scaleFactor;
	} else {
		baseWidthCss = widthCss;
		scaleFactor = widthCss / baseWidth;
		baseHeightCss = baseHeight * scaleFactor;
	}

	baseLeftCss = ((widthCss - baseWidthCss) * 0.5) | 0;
	if (baseLeftCss < 0) baseLeftCss = 0;
	baseTopCss = ((heightCss - baseHeightCss) * 0.5) | 0;
	if (baseTopCss < 0) baseTopCss = 0;

	View.main.style.left = baseLeftCss + "px";
	View.main.style.top = baseTopCss + "px";

	if (widthCss <= heightCss) {
		if (!landscapeWarning) {
			landscapeWarning = document.createElement("div");
			landscapeWarning.style.pointerEvents = "none";
			landscapeWarning.style.textAlign = "center";
			landscapeWarning.style.position = "absolute";
			landscapeWarning.style.left = "0";
			landscapeWarning.style.top = smallMarginCss;
			landscapeWarning.style.width = "100%";
			landscapeWarning.style.zIndex = "9999";
			landscapeWarning.textContent = Strings.LandscapeWarning;
			document.body.appendChild(landscapeWarning);
		}
	} else if (landscapeWarning) {
		document.body.removeChild(landscapeWarning);
		landscapeWarning = null;
	}

	View.main.style.width = baseWidthCss + "px";
	View.main.style.height = baseHeightCss + "px";

	if (scaleFactor !== lastScaleFactor) {
		fontSize = (baseHeightCss / baseHeightFontUnits) | 0;
		fontSizeCss = fontSize + "px";
		if (document.documentElement)
			document.documentElement.style.fontSize = fontSizeCss;
		document.body.style.fontSize = fontSizeCss;

		View.windowResized(true);
	} else {
		View.windowResized(false);
	}

	Modal.windowResized();
}

function beforeInstallPrompt(e: Event): void {
	if (("preventDefault" in e))
		e.preventDefault();
	installationPrompt = e;
}

function toggleMusic(e: Event): boolean {
	if (bgMusic) {
		if (musicPlaying === bgMusic.paused)
			musicPlaying = !musicPlaying;

		if (musicPlaying) {
			musicPlaying = false;
			bgMusic.pause();
		} else {
			musicPlaying = true;
			bgMusic.play();
		}
	} else if (audioContext && audioBuffer) {
		try {
			if (audioBufferSource) {
				audioBufferSource.stop();
				audioBufferSource.disconnect();
				audioBufferSource = null;
			}

			if (musicPlaying) {
				audioContext.suspend();
				musicPlaying = false;
			} else {
				audioContext.resume();
				audioBufferSource = audioContext.createBufferSource();
				audioBufferSource.buffer = audioBuffer;
				audioBufferSource.loop = true;
				audioBufferSource.connect(audioContext.destination);
				audioBufferSource.start();
				musicPlaying = true;
			}
		} catch (ex) {
			// Just ignore...
		}
	}

	if (e.target && (e.target as HTMLElement).tagName)
		(e.target as HTMLElement).textContent = (musicPlaying ? Strings.StopMusic : Strings.PlayMusic);

	return true;
}

function updateMusicButton() {
	if (musicButton)
		musicButton.textContent = (musicPlaying ? Strings.StopMusic : Strings.PlayMusic);
}

let fullscreenChangedTimeout = 0;

function fullscreenChanged(e: Event): void {
	if (fullscreenChangedTimeout) {
		clearTimeout(fullscreenChangedTimeout);
		fullscreenChangedTimeout = 0;
	}

	try {
		if (FullscreenControl.fullscreenMode)
			fullscreenChangedTimeout = setTimeout(fullscreenChangedHandler, 150);
		else
			fullscreenChangedHandler();
	} catch (ex) {
		// Just ignore...
	}
}

function fullscreenChangedHandler(): void {
	fullscreenChangedTimeout = 0;
	// https://www.w3.org/TR/screen-orientation/#locking-to-a-specific-orientation-and-unlocking
	// https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
	// https://developer.mozilla.org/en-US/docs/Web/API/Screen/lockOrientation
	if ((screen as any)["mozLockOrientation"] && (screen as any)["mozUnlockOrientation"]) {
		try {
			if (FullscreenControl.fullscreenMode) {
				if ((screen as any)["mozLockOrientation"]("landscape-primary"))
					return;
			} else {
				if ((screen as any)["mozUnlockOrientation"]())
					return;
			}
		} catch (ex) {
			// Just ignore...
		}
	}
	if ((screen as any)["msLockOrientation"] && (screen as any)["msUnlockOrientation"]) {
		try {
			if (FullscreenControl.fullscreenMode) {
				if ((screen as any)["msLockOrientation"]("landscape-primary"))
					return;
			} else {
				if ((screen as any)["msUnlockOrientation"]())
					return;
			}
		} catch (ex) {
			// Just ignore...
		}
	}
	if (screen.orientation && screen.orientation.lock && screen.orientation.unlock) {
		try {
			ignorePromise(FullscreenControl.fullscreenMode ?
				screen.orientation.lock("landscape-primary") :
				// Are there browsers out there returning a promise here?!?!
				screen.orientation.unlock());
		} catch (ex) {
			// For those browsers that do not support lock(), but
			// fail to return a proper Promise...
		}
	}
}

function preloadImage(url: string): Promise<void> {
	return new Promise((resolve) => {
		const image = document.createElement("img");
		image.onload = () => {
			image.style.display = "none";
			image.style.position = "absolute";
			image.style.width = "0";
			image.style.height = "0";
			image.style.zIndex = "-1";
			//document.body.appendChild(image);
			resolve();
		};
		image.onerror = () => resolve();
		image.setAttribute("src", url);
	});
}

function setup(): void {
	Strings.init();

	View.loading = true;

	if (("serviceWorker" in navigator)) {
		window.addEventListener("beforeinstallprompt", beforeInstallPrompt);

		//navigator.serviceWorker.register("sw.js");
	}

	window.onpopstate = View.windowHistoryStatePopped;

	window.onresize = adjustWindowSize;

	adjustWindowSize();

	FullscreenControl.onfullscreenchange = fullscreenChanged;

	async function preloadAudio(): Promise<void> {
		/*
		try {
			if (("AudioContext" in window) && ("AudioBuffer" in window) && ("AudioBufferSourceNode" in window) && ("fetch" in window)) {
				audioContext = new AudioContext();
				audioContext.suspend();
				audioBuffer = await audioContext.decodeAudioData(await (await fetch("assets/sounds/bg.mp3")).arrayBuffer());
				return;
			}
		} catch (ex) {
			// Just ignore an fall to the classic method
			audioContext = null;
			audioBuffer = null;
		}
		*/
		bgMusic = document.createElement("audio");
		bgMusic.loop = true;
		bgMusic.src = "assets/sounds/bgfade.mp3";
		document.body.appendChild(bgMusic);
		bgMusic.load();
	}

	function finishSetup() {
		View.loading = false;

		//musicPlaying = !bgMusic.paused;

		if (bgMusic) {
			bgMusic.onplay = function () {
				musicPlaying = true;
				updateMusicButton();
			};

			bgMusic.onpause = function () {
				musicPlaying = false;
				updateMusicButton();
			};
		}

		View.createInitialView();
	}

	Promise.all([
		preloadAudio(),
		Alien.preloadAllImages()
	]).then(finishSetup, finishSetup);
}

(window as any)["spacetrainStepMAIN"] = true;
if ((window as any)["spacetrainCheckSetup"])
	(window as any)["spacetrainCheckSetup"]();
