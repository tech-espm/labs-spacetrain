//
// MIT License
//
// Copyright (c) 2020 Carlos Rafael Gimenes das Neves
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
// https://github.com/carlosrafaelgn/pixel
//

interface ButtonInfo {
	imageId?: number;
	text?: string;
}

interface ButtonCallback {
	(e: Event): boolean;
}

abstract class View {
	public static readonly main = document.getElementById("main") as HTMLDivElement;
	public static readonly cover = document.getElementById("cover") as HTMLDivElement;
	private static readonly fadeLeft = document.getElementById("fadeLeft") as HTMLDivElement;
	private static readonly fadeRight = document.getElementById("fadeRight") as HTMLDivElement;

	private static _loading = false;
	private static _fading = false;
	private static mainLandscape = false;
	private static currentView: View | null = null;
	private static viewStack: View[] = [];
	private static divLoading: HTMLDivElement | null = null;
	private static divLoadingTimeout = 0;
	private static windowHistoryStatePushed = false;

	public static get loading(): boolean {
		return View._loading;
	}

	public static set loading(l: boolean) {
		if (View._loading === l)
			return;

		View._loading = l;

		if (l) {
			if (!View.divLoading) {
				View.divLoading = document.createElement("div");
				View.divLoading.style.display = "none";
				document.body.appendChild(View.divLoading);
			}
			if (View.divLoadingTimeout)
				clearTimeout(View.divLoadingTimeout);
			View.divLoadingTimeout = window.setTimeout(function () {
				View.divLoadingTimeout = 0;
				if (View.divLoading) {
					View.divLoading.style.display = "";
					View.divLoading.className = "loading";
				}
			}, 100);
		} else {
			if (View.divLoading) {
				if (View.divLoadingTimeout) {
					clearTimeout(View.divLoadingTimeout);
					View.divLoadingTimeout = 0;
				}
				document.body.removeChild(View.divLoading);
				View.divLoading = null;
			}
		}
	}

	public static get fading(): boolean {
		return View._fading;
	}

	public static createInitialView(): Promise<void> | null {
		return ((!View.currentView && !View._loading && !View._fading && !View.viewStack.length) ?
			(new TitleView()).fadeIn() :
			null);
	}

	public static windowResized(elementSizeChanged: boolean): void {
		if (baseLeftCss < 8) {
			if (!View.fadeLeft.style.backgroundColor) {
				const color = "#2f0e52";
				View.fadeLeft.style.backgroundColor = color;
				View.fadeRight.style.backgroundColor = color;
				View.fadeLeft.style.backgroundImage = "none";
				View.fadeRight.style.backgroundImage = "none";
			}
		} else {
			if (View.fadeLeft.style.backgroundColor) {
				View.fadeLeft.style.backgroundColor = "";
				View.fadeRight.style.backgroundColor = "";
				View.fadeLeft.style.backgroundImage = "";
				View.fadeRight.style.backgroundImage = "";
			}
		}

		if (!elementSizeChanged)
			return;

		if (baseTopCss) {
			if (!View.fadeLeft.style.display) {
				View.fadeLeft.style.display = "none";
				View.fadeRight.style.display = "none";
			}
		} else {
			if (View.fadeLeft.style.display) {
				View.fadeLeft.style.display = "";
				View.fadeRight.style.display = "";
			}
		}

		if (View.currentView)
			View.currentView.resize();
	}

	public static windowHistoryStatePopped(e: PopStateEvent): void {
		View.windowHistoryStatePushed = false;
		View.pushHistoryStateIfNecessary();

		if (Modal.visible)
			Modal.defaultCancelAction();
	}

	public static pushHistoryStateIfNecessary(): void {
		if (!View.windowHistoryStatePushed && (!View.currentView || !(View.currentView instanceof TitleView) || View._fading || Modal.visible)) {
			View.windowHistoryStatePushed = true;
			// Closing the browser with our state already pushed to the top of
			// window.history will cause the current state to have
			// window.history.state.spaceTrain = true when opening the browser
			// again later. But, given that the browser cannot confirm the
			// state has been pushed by "this page", since the browser has been
			// closed and reopened, calling window.history.back() inside
			// popHistoryStateIfNecessary() will actually make the browser
			// navigate to the previous page. Therefore, we are better off not
			// performing these checks here.
			//if (!window.history.state || !window.history.state.spaceTrain)
			window.history.pushState({ spaceTrain: true }, "Space Train");
		}
	}

	public static popHistoryStateIfNecessary(): void {
		if (View.windowHistoryStatePushed)
			window.history.back();
	}

	public static createHorizontalSpacer(parent: HTMLElement, widthRem: number, existingId?: string): HTMLDivElement {
		const spacer = (existingId ? parent.querySelector("#" + existingId) as HTMLDivElement : document.createElement("div"));
		spacer.className = "horizontal-spacer";
		spacer.style.width = widthRem + "rem";
		if (!existingId)
			parent.appendChild(spacer);
		return spacer;
	}

	public static createVerticalSpacer(parent: HTMLElement, heightRem: number, existingId?: string): HTMLDivElement {
		const spacer = (existingId ? parent.querySelector("#" + existingId) as HTMLDivElement : document.createElement("div"));
		spacer.className = "vertical-spacer";
		spacer.style.height = heightRem + "rem";
		if (!existingId)
			parent.appendChild(spacer);
		return spacer;
	}

	public static createButton(parent: HTMLElement | null, imageId: number | string | ButtonInfo, callback?: ButtonCallback | null, ...attributes: string[]): HTMLButtonElement {
		const button = document.createElement("button"),
			text: string | null = (((typeof imageId) === "string") ? imageId as string : (((typeof imageId) === "number") ? null : (imageId as ButtonInfo).text || null)),
			id = (((typeof imageId) === "string") ? 0 : (((typeof imageId) === "number") ? imageId as number : ((imageId as ButtonInfo).imageId || 0))),
			image: HTMLSpanElement | null = (id ? Icon.create(id, button, !text) : null);
		button.setAttribute("type", "button");
		if (callback)
			prepareButtonBlink(button, false, callback);
		if (parent)
			parent.appendChild(button);
		if (text)
			button.appendChild(document.createTextNode(text));
		if (attributes) {
			for (let i = 0; i < attributes.length; i += 2)
				button.setAttribute(attributes[i], attributes[i + 1]);
		}
		return button;
	}

	public static createBlackButton(parent: HTMLElement | null, imageId: number | string | ButtonInfo, callback?: ButtonCallback | null, extraClass?: string | null, ...attributes: string[]): HTMLButtonElement {
		const args: [HTMLElement | null, number | string | ButtonInfo, ButtonCallback | null | undefined] = [parent, imageId, callback];
		if (attributes && attributes.length)
			args.push.apply(args, attributes);
		args.push("class");
		args.push("black " + (extraClass || ""));
		return View.createButton.apply(this, args);
	}

	public static createWhiteButton(parent: HTMLElement | null, imageId: number | string | ButtonInfo, callback?: ButtonCallback | null, extraClass?: string | null, ...attributes: string[]): HTMLButtonElement {
		const args: [HTMLElement | null, number | string | ButtonInfo, ButtonCallback | null | undefined] = [parent, imageId, callback];
		if (attributes && attributes.length)
			args.push.apply(args, attributes);
		args.push("class");
		args.push("white " + (extraClass || ""));
		return View.createButton.apply(this, args);
	}

	public static createBlueButton(parent: HTMLElement | null, imageId: number | string | ButtonInfo, callback?: ButtonCallback | null, extraClass?: string | null, ...attributes: string[]): HTMLButtonElement {
		const args: [HTMLElement | null, number | string | ButtonInfo, ButtonCallback | null | undefined] = [parent, imageId, callback];
		if (attributes && attributes.length)
			args.push.apply(args, attributes);
		args.push("class");
		args.push("blue " + (extraClass || ""));
		return View.createButton.apply(this, args);
	}

	public static createGreenButton(parent: HTMLElement | null, imageId: number | string | ButtonInfo, callback?: ButtonCallback | null, extraClass?: string | null, ...attributes: string[]): HTMLButtonElement {
		const args: [HTMLElement | null, number | string | ButtonInfo, ButtonCallback | null | undefined] = [parent, imageId, callback];
		if (attributes && attributes.length)
			args.push.apply(args, attributes);
		args.push("class");
		args.push("green " + (extraClass || ""));
		return View.createButton.apply(this, args);
	}

	public static createOrangeButton(parent: HTMLElement | null, imageId: number | string | ButtonInfo, callback?: ButtonCallback | null, extraClass?: string | null, ...attributes: string[]): HTMLButtonElement {
		const args: [HTMLElement | null, number | string | ButtonInfo, ButtonCallback | null | undefined] = [parent, imageId, callback];
		if (attributes && attributes.length)
			args.push.apply(args, attributes);
		args.push("class");
		args.push("orange " + (extraClass || ""));
		return View.createButton.apply(this, args);
	}

	public static createRedButton(parent: HTMLElement | null, imageId: number | string | ButtonInfo, callback?: ButtonCallback | null, extraClass?: string | null, ...attributes: string[]): HTMLButtonElement {
		const args: [HTMLElement | null, number | string | ButtonInfo, ButtonCallback | null | undefined] = [parent, imageId, callback];
		if (attributes && attributes.length)
			args.push.apply(args, attributes);
		args.push("class");
		args.push("red " + (extraClass || ""));
		return View.createButton.apply(this, args);
	}

	public static createPinkButton(parent: HTMLElement | null, imageId: number | string | ButtonInfo, callback?: ButtonCallback | null, extraClass?: string | null, ...attributes: string[]): HTMLButtonElement {
		const args: [HTMLElement | null, number | string | ButtonInfo, ButtonCallback | null | undefined] = [parent, imageId, callback];
		if (attributes && attributes.length)
			args.push.apply(args, attributes);
		args.push("class");
		args.push("pink " + (extraClass || ""));
		return View.createButton.apply(this, args);
	}

	public readonly baseElement: HTMLDivElement;

	protected attached: boolean;

	public constructor() {
		this.baseElement = document.createElement("div");
		this.baseElement.className = "base-element";

		this.attached = false;
	}

	protected releaseResources(): void {
	}

	protected loadResources(): void {
	}

	protected resize(): void {
	}

	protected fadeInFinished(): void {
	}

	protected abstract attach(): Promise<void>;

	protected abstract detach(): Promise<void>;

	protected abstract destroyInternal(partial: boolean): void;

	// Simulating final...
	protected readonly destroy = async (partial: boolean): Promise<void> => {
		if (this.baseElement) {
			if (this.baseElement.parentNode && this.attached)
				this.baseElement.parentNode.removeChild(this.baseElement);

			if (this.attached) {
				this.attached = false;
				await this.detach();
			}

			this.destroyInternal(partial);

			if (!partial)
				zeroObject(this);
		}
	}

	private finishFadeIn(resolve: () => void): void {
		window.setTimeout(() => {
			this.resize();

			View.cover.classList.remove("visible");

			window.setTimeout(() => {
				View._fading = false;
				View.popHistoryStateIfNecessary();
				document.body.removeChild(View.cover);
				this.fadeInFinished();
				resolve();
			}, slowAnimationTimeoutMS);
		}, animationStartDelayMS);
	}

	private fadeIn(): Promise<void> | null {
		if (View._fading || View.currentView === this)
			return null;

		View._fading = true;

		View.currentView = this;

		return new Promise((resolve) => {
			if (this.baseElement && !this.attached) {
				View.main.appendChild(this.baseElement);
				this.attached = true;
				const promise = this.attach();

				if (promise) {
					promise.then(() => {
						this.finishFadeIn(resolve);
					}, (reason) => {
						console.error(reason);
					});
					return;
				}
			}

			this.finishFadeIn(resolve);
		});
	}

	private fadeOut(saveViewInStack: boolean): Promise<void> | null {
		if (View._fading || View.currentView !== this)
			return null;

		View._fading = true;

		return new Promise((resolve) => {
			document.body.appendChild(View.cover);
			
			window.setTimeout(() => {
				View.cover.classList.add("visible");

				window.setTimeout(async () => {
					await this.destroy(saveViewInStack);
					if (saveViewInStack)
						View.viewStack.push(this);
					View.currentView = null;
					View._fading = false;
					View.pushHistoryStateIfNecessary();
					resolve();
				}, slowAnimationTimeoutMS);
			}, animationStartDelayMS);
		});
	}

	protected fadeTo(newViewFactory: () => View, saveViewInStack: boolean = false): Promise<void> | null {
		if (View._fading || View.currentView !== this)
			return null;

		const p = this.fadeOut(saveViewInStack);
		if (!p)
			return null;

		return p.then(() => {
			const p = newViewFactory().fadeIn();
			if (p)
				return p;
		});
	}

	protected fadeToPrevious(): Promise<void> | null {
		if (View._fading || View.currentView !== this || !View.viewStack.length)
			return null;

		const p = this.fadeOut(false);
		if (!p)
			return null;

		return p.then(() => {
			const p = (View.viewStack.pop() as View).fadeIn();
			if (p)
				return p;
		});
	}
}
