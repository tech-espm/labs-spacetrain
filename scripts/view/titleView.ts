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

class TitleView extends View {
	private readonly logo: HTMLImageElement;
	private readonly subtitle: HTMLDivElement;
	private readonly startButton: HTMLButtonElement;
	private readonly rulesButton: HTMLButtonElement;
	private readonly creditsButton: HTMLButtonElement;
	private readonly footer: HTMLDivElement;
	private readonly fullscreenButton: HTMLButtonElement | null;

	private fadeSequence: number;
	private fadeElements: HTMLElement[] | null;
	private fadeInterval: number;

	public constructor() {
		super();

		this.baseElement.innerHTML = `
		<div style="margin: 2em 0;">
			<img id="logo" src="assets/images/logo.png" alt="Logo" class="fade" style="width: 20rem;" />
		</div>
		<div id="subtitle" class="fade" style="margin: 2em 0 1em;">
			<s>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</s>
			&nbsp;
			BLOCKCHAIN GAME
			&nbsp;
			<s>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp</s>
		</div>
		`;

		this.baseElement.className = "text-center";

		this.logo = this.baseElement.querySelector("#logo") as any;
		this.subtitle = this.baseElement.querySelector("#subtitle") as any;

		this.startButton = View.createBlueButton(this.baseElement, Strings.START, this.start.bind(this), "fade", "data-teste", "1");
		this.startButton.style.marginBottom = largeMarginCss;
		this.baseElement.appendChild(document.createElement("br"));
		this.rulesButton = View.createOrangeButton(this.baseElement, Strings.RULES, this.rules.bind(this), "fade");
		this.rulesButton.style.marginBottom = largeMarginCss;
		this.baseElement.appendChild(document.createElement("br"));
		this.creditsButton = View.createPinkButton(this.baseElement, Strings.CREDITS, this.credits.bind(this), "fade");
		this.creditsButton.style.marginBottom = largeMarginCss;

		this.footer = document.createElement("div");
		this.footer.className = "green small fade";
		this.footer.textContent = "2021 - GameLab ESPM (@gamelab_espm) + Hub Arenas ESPM (@arenas_espm) - #GoGamers";
		this.baseElement.appendChild(this.footer);

		if (!isPWA) {
			this.fullscreenButton = View.createWhiteButton(this.baseElement, Strings.Fullscreen, this.fullscreen.bind(this), "fade small");
			this.fullscreenButton.style.position = "absolute";
			this.fullscreenButton.style.right = "1.5rem";
			this.fullscreenButton.style.bottom = "3rem";
		} else {
			this.fullscreenButton = null;
		}

		this.fadeSequence = 0;
		this.fadeElements = null;
		this.fadeInterval = 0;
	}

	protected async attach(): Promise<void> {
	}

	protected async detach(): Promise<void> {
		if (this.fadeInterval) {
			clearInterval(this.fadeInterval);
			this.fadeInterval = 0;
		}
	}

	protected destroyInternal(partial: boolean): void {
	}

	protected fadeInFinished(): void {
		this.startFadeSequence(1);
	}

	private startFadeSequence(fadeSequence: number, callback?: () => void): void {
		if (this.fadeSequence)
			return;

		const fadeElements = [this.logo, this.subtitle, this.startButton, this.rulesButton, this.creditsButton, this.footer];
		if (this.fullscreenButton)
			fadeElements.push(this.fullscreenButton);
		if (fadeSequence < 0)
			fadeElements.reverse();

		this.fadeSequence = fadeSequence;
		this.fadeElements = fadeElements;
		this.fadeInterval = window.setInterval(() => {
			const i = Math.abs(this.fadeSequence) - 1;

			if (!this.fadeElements || i >= this.fadeElements.length) {
				clearInterval(this.fadeInterval);
				this.fadeSequence = 0;
				this.fadeElements = null;
				this.fadeInterval = 0;

				if (callback)
					callback();

				return;
			}

			const element = this.fadeElements[i];
			if (this.fadeSequence > 0) {
				element.classList.add("visible");
				this.fadeSequence++;
			} else {
				element.classList.remove("visible");
				this.fadeSequence--;
			}
		}, 100);
	}

	private start(e: Event): boolean {
		if (Modal.visible || this.fadeSequence)
			return false;

		this.startFadeSequence(-1, () => this.fadeTo(() => new GameView()));
		return true;
	}

	private rules(e: Event): boolean {
		if (this.fadeSequence)
			return false;

		this.startFadeSequence(-1, () => this.fadeTo(() => new RulesView(), true));
		return true;
	}

	private credits(e: Event): boolean {
		if (this.fadeSequence)
			return false;

		this.startFadeSequence(-1, () => this.fadeTo(() => new CreditsView(), true));
		return true;
	}

	private fullscreen(e: Event): boolean {
		FullscreenControl.toggleFullscreen();
		return true;
	}
}
