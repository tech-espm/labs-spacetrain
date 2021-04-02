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

class RulesView extends View {
	private static readonly TotalRuleCount = 5;

	private previousRuleButton: HTMLDivElement;
	private ruleImage: HTMLImageElement;
	private nextRuleButton: HTMLDivElement;

	private fadingRule: boolean;
	private currentRule: number;
	private ruleMarker: HTMLSpanElement[];

	public constructor() {
		super();

		this.baseElement.classList.add("text-center");

		const backButton = View.createWhiteButton(this.baseElement, { imageId: Icon.Clear, text: Strings.Close }, this.back.bind(this), "small");
		backButton.style.position = "absolute";
		backButton.style.left = extraLargeMarginCss;
		backButton.style.top = extraLargeMarginCss;

		this.fadingRule = false;
		this.currentRule = 0;

		const ruleContainer = document.createElement("div");
		ruleContainer.className = "rule-container";

		const previousRuleButton = document.createElement("div");
		previousRuleButton.className = "rule-prev fade";
		previousRuleButton.onclick = this.previousRule.bind(this);
		this.previousRuleButton = previousRuleButton;
		ruleContainer.appendChild(previousRuleButton);

		const ruleImage = document.createElement("img");
		ruleImage.className = "rule-image fade visible";
		ruleImage.src = "assets/images/rule0.png";
		this.ruleImage = ruleImage;
		ruleContainer.appendChild(ruleImage);

		const nextRuleButton = document.createElement("div");
		nextRuleButton.className = "rule-next fade visible";
		nextRuleButton.onclick = this.nextRule.bind(this);
		this.nextRuleButton = nextRuleButton;
		ruleContainer.appendChild(nextRuleButton);

		this.baseElement.appendChild(ruleContainer);

		const ruleLabel = document.createElement("div");
		ruleLabel.className = "result-label visible";

		const ruleMarker: HTMLSpanElement[] = new Array(RulesView.TotalRuleCount);
		for (let i = 0; i < RulesView.TotalRuleCount; i++) {
			const marker = document.createElement("span");
			marker.className = (i ? "marker" : "marker done");
			ruleLabel.appendChild(marker);
			ruleMarker[i] = marker;
			const points = document.createElement("span");
			points.className = "points";
			marker.appendChild(points);
		}
		this.ruleMarker = ruleMarker;

		const ruleLabelRow2 = document.createElement("div");
		ruleLabelRow2.className = "row2";
		ruleLabelRow2.innerHTML = `<s>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</s><img src="assets/images/logo-small.png" /><s>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</s>`;
		ruleLabel.appendChild(ruleLabelRow2);

		this.baseElement.appendChild(ruleLabel);
	}

	protected async attach(): Promise<void> {
	}

	protected async detach(): Promise<void> {
	}

	protected destroyInternal(partial: boolean): void {
	}

	private back(e: Event): boolean {
		this.fadeToPrevious();
		return true;
	}

	private async changeRule(delta: number): Promise<void> {
		if (View.fading || this.fadingRule || !this.ruleMarker)
			return;

		const newRule = this.currentRule + delta;
		if (newRule < 0 || newRule >= RulesView.TotalRuleCount)
			return;

		this.fadingRule = true;

		if (newRule > 0)
			this.previousRuleButton.classList.add("visible");
		else
			this.previousRuleButton.classList.remove("visible");

		if (newRule < (RulesView.TotalRuleCount - 1))
			this.nextRuleButton.classList.add("visible");
		else
			this.nextRuleButton.classList.remove("visible");

		this.ruleImage.classList.remove("visible");

		await delay(slowAnimationTimeoutMS);

		const ruleMarker = this.ruleMarker;
		for (let i = 0; i < RulesView.TotalRuleCount; i++) {
			if (i <= newRule)
				ruleMarker[i].classList.add("done");
			else
				ruleMarker[i].classList.remove("done");
		}

		this.ruleImage.src = `assets/images/rule${newRule}.png`;
		this.ruleImage.classList.add("visible");
		this.currentRule = newRule;

		await delay(slowAnimationTimeoutMS);

		this.fadingRule = false;
	}

	private previousRule(): void {
		this.changeRule(-1);
	}

	private nextRule(): void {
		this.changeRule(1);
	}
}
