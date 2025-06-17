// @ts-check

import * as Environment from "./environment.mjs";

/** @typedef {import("./base.d.ts").VisualAlertOptions} VisualAlertOptions */

export class Alert {
    /**
     * @param {VisualAlertOptions} [options]
     */
    constructor(options) {
        this.elementColumn = document.createElement("div");
        this.elementColumn.className = "col-12";

        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "alert";
        if (options?.type) {
            this.elementContainer.classList.add(options.type);
        }
        this.elementContainer.role = "alert";

        if (options?.dismissible) {
            this.elementContainer.classList.add("alert-dismissible");
            const btnClose = document.createElement("button");
            btnClose.type = "button";
            btnClose.className = "btn-close";
            btnClose.addEventListener("click", () => this.hide());
            this.elementContainer.append(btnClose);
        }

        this.elementTitle = document.createElement("h5");
        this.elementTitle.className = "font-weight-bold fw-bold";
        this.elementIcon = document.createElement("i");
        if (options?.icon) {
            this.elementIcon.className = options.icon;
            this.elementIcon.classList.add("mr-2", "me-2");
        }
        this.elementTitle.append(this.elementIcon);
        if (options?.title) {
            this.elementTitle.append(document.createTextNode(options.title));
        }
        this.elementContainer.append(this.elementTitle);

        this.elementText = document.createElement("p");
        this.elementText.className = "mb-0";
        if (options?.text) {
            this.elementText.innerHTML = options.text;
        }
        this.elementContainer.append(this.elementText);

        this.elementColumn.append(this.elementContainer);
    }

    hide() {
        this.elementColumn.remove();
    }
}

/**
 *
 * @param {string} [text]
 */
export function createLabel(text) {
    let elementLabel = document.createElement("span");
    elementLabel.style.padding = "1px 4px";
    elementLabel.style.borderRadius = "4px";

    if (text) {
        const span = document.createElement("span");
        span.className = "small text-secondary";
        span.innerHTML = text;
        elementLabel.appendChild(span);
    }

    return elementLabel;
}

/**
 *
 * @param {HTMLSpanElement} elementLabel
 */
export function labelFloat(elementLabel) {
    if (Environment.bootstrapVersionGet() === 5) return;

    elementLabel.style.position = "relative";
    elementLabel.style.top = "8px";
    elementLabel.style.left = "8px";
    elementLabel.style.zIndex = "10";

    elementLabel.style.backgroundColor = "white";
}

/**
 *
 * @param {HTMLSpanElement} elementLabel
 */
export function labelStatic(elementLabel) {
    if (Environment.bootstrapVersionGet() === 5) return;

    elementLabel.style.position = "static";
    elementLabel.style.top = "0";
    elementLabel.style.left = "0";
    elementLabel.style.zIndex = "0";

    elementLabel.style.backgroundColor = "transparent";
}

export function createRequiredAsterisk() {
    const asterisk = document.createElement("i");
    asterisk.className = "bi bi-asterisk required-asterisk";
    return asterisk;
}

/**
 *
 * @param {string} iconClass
 */
export function createIcon(iconClass) {
    const icon = document.createElement("i");
    icon.className = iconClass;
    return icon;
}

/**
 * @typedef {object} TooltipOptions
 * @property {string} [fontSize="80%"]
 */

/**
 * Create a new tooltip that is shown when hovering a question mark icon
 * @param {string} text
 * @param {TooltipOptions} [options]
 */
export function createTooltip(text, options) {
    let elementTooltip = /** @type {HTMLSpanElement} */ (document.createElement("i"));
    elementTooltip.className = "bi bi-question-circle mx-1 text-secondary";
    elementTooltip.style.fontSize = options?.fontSize ?? "80%";
    elementTooltip.style.cursor = "pointer";
    elementTooltip.dataset.bsToggle = "tooltip";
    elementTooltip.dataset.bsPlacement = "top";
    elementTooltip.dataset.bsTitle = text;
    return elementTooltip;
}

/**
 * Apply a tooltip to an existing element that is shown when hovering
 * @param {HTMLElement} element
 * @param {string} text
 * @param {TooltipOptions} [options]
 */
export function applyTooltip(element, text, options) {
    element.dataset.bsToggle = "tooltip";
    element.dataset.bsPlacement = "top";
    element.dataset.bsTitle = text;
}

/**
 * @typedef {object} SpinnerOptions
 * @property {string} [text]
 */

export class Spinner {
    /** @type {HTMLDivElement} */
    elementContainer;

    /**
     * @param {SpinnerOptions} [options]
     */
    constructor(options) {
        this.elementContainer = document.createElement("div");
        this.elementContainer.className = "spinner-border";
        this.elementContainer.setAttribute("role", "status");
        this.elementContainer.setAttribute("aria-hidden", "true");

        if (options?.text) {
            const span = document.createElement("span");
            span.className = "visually-hidden sr-only";
            span.textContent = options.text;
            this.elementContainer.append(span);
        }
    }
}

export class CircularImage {
    constructor(imageSrc = "https://foleyprep.nyc3.cdn.digitaloceanspaces.com/Users/user.svg", size = 150) {
        this.size = size;
        this.container = document.createElement("div");
        this.container.style.display = "flex";
        this.container.style.alignItems = "center";
        this.container.style.justifyContent = "center";
        this.container.style.margin = "0 auto";

        this.img = document.createElement("img");
        this.img.style.width = "100%";
        this.img.style.height = "100%";
        this.img.style.borderRadius = "50%";
        this.img.style.objectFit = "cover";
        this.img.style.display = "block";
        this.img.style.border = "2px solid #fff";

        this.update(imageSrc);
    }

    update(src) {
        this.container.className = "circular-image-container";
        this.container.style.width = this.size + "px";
        this.container.style.height = this.size + "px";

        this.img.src = src;
        this.img.className = "circular-image";

        this.container.appendChild(this.img);
    }
}

/**
 * @typedef {object} ElementTitleOptions
 * @property {string} text
 * @property {"h1" | "h2" | "h3" | "h4" | "h5" | "h6"} [size="h1"]
 * @property {string} [icon]
*/
export class ElementTitle {
    /** @type {HTMLDivElement} */
    elementColumn;
    /** @type {HTMLHeadingElement} */
    elementTitle;
    /** @type {HTMLSpanElement} */
    elementIcon;
    /** @type {HTMLSpanElement} */
    elementText;

    /**
     * @param {ElementTitleOptions} [options]
     */
    constructor(options) {
        this.elementColumn = document.createElement("div");
        this.elementColumn.className = "col-12";

        this.elementTitle = document.createElement(options?.size ?? "h1");
        this.elementTitle.className = "font-weight-bold fw-bold";
        this.elementColumn.appendChild(this.elementTitle);

        this.icon = options?.icon;
        this.text = options?.text;
    }

    get text() {
        return this.elementText?.textContent ?? "";
    }

    /**
     * @param {string|undefined} text
     */
    set text(text) {
        if (!this.elementText) {
            this.elementText = document.createElement("span");
            this.elementTitle.appendChild(this.elementText);
        }
        this.elementText.innerHTML = text ?? "";
    }

    get icon() {
        return this.elementIcon?.className ?? "";
    }

    /**
     * @param {string|undefined} className
     */
    set icon(className) {
        if (!this.elementIcon) {
            this.elementIcon = document.createElement("i");
            this.elementTitle.prepend(this.elementIcon);
        }
        this.elementIcon.className = className ?? "";
        this.elementIcon.classList.add("me-2");
    }
}