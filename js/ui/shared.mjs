import { bootstrapVersionGet } from "./environment.mjs";
import * as VisualComponents from "./components-visual.mjs";

/** @typedef {import("./base.d.ts").IGenericInputElementField} IGenericInputElementField */
/** @typedef {import("./base.d.ts").InputElementOptions} InputElementOptions */
/** @typedef {import("./base.d.ts").ValidationOptions} ValidationOptions */
/** @typedef {import("./base.d.ts").ValidationMessage} ValidationMessage */

/**
 *
 * @param {IGenericInputElementField} inputElement
 * @param {string} reason
 * @param {ValidationOptions} [options]
 * @returns {ValidationMessage}
 */
export function fieldInvalidate(inputElement, reason, options) {
    if (inputElement && options?.test !== true) {
        if (inputElement.elementInput) {
            inputElement.elementInput.classList.remove("is-valid");
            inputElement.elementInput.classList.add("is-invalid");
        }
        if (typeof inputElement.validationMessageUpdate === "function") {
            inputElement.validationMessageUpdate({ valid: false, reason: reason });
        }
    }
    return { valid: false, reason: reason };
}

/**
 *
 * @param {IGenericInputElementField} inputElement
 * @param {ValidationOptions} [options]
 * @returns {ValidationMessage}
 */
export function fieldValidate(inputElement, options) {
    if (inputElement && options?.test !== true) {
        if (inputElement.elementInput) {
            inputElement.elementInput.classList.remove("is-invalid");
            inputElement.elementInput.classList.add("is-valid");
        }
        if (typeof inputElement.validationMessageUpdate === "function") {
            inputElement.validationMessageUpdate({ valid: true, reason: "" });
        }
    }
    return { valid: true, reason: "" };
}

/**
 *
 * @param {IGenericInputElementField} inputElement
 * @returns {ValidationMessage}
 */
export function fieldValidationClear(inputElement) {
    if (inputElement) {
        inputElement.elementInput.classList.remove("is-invalid");
        inputElement.elementInput.classList.remove("is-valid");
        inputElement.validationMessageUpdate({ valid: true, reason: "" });
    }
    return { valid: true, reason: "" };
}

export let useOverlappingLabel = bootstrapVersionGet() === 4;

export const gridBackground = "repeating-conic-gradient(rgb(238, 238, 238) 0%, rgb(238, 238, 238) 25%, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 50%) 50% center / 24px 24px";

// export const undefinedBackground = `repeating-linear-gradient(45deg, var(--brand-primary-light), var(--brand-primary-light) 10px, var(--brand-primary) 10px, var(--brand-primary) 20px`;
export const undefinedBackground = `repeating-linear-gradient(45deg, #0000, #0000 10px, #0001 10px, #0001 20px)`;

/**
 * @param {string} text
 * @param {string} href
 * @returns
 */
export function createLinkButton(text, href) {
    let element = document.createElement("a");
    element.classList.add("btn", "btn-outline-secondary");
    element.href = href;
    element.innerText = text;
    return element;
}

export class InputElement {
    /** @type {HTMLSpanElement} */
    elementLabel;
    /** @type {HTMLElement} */
    elementMessage;
    /** @type {boolean} */
    required;

    /**
     * @param {InputElementOptions} [options]
     */
    constructor(options) {
        this.elementLabel = VisualComponents.createLabel(options?.label);

        this.required = options?.required ?? false;
        if (options?.required === true) {
            this.elementLabel.appendChild(VisualComponents.createRequiredAsterisk());
        }
        if (options?.tooltip) {
            this.elementLabel.appendChild(VisualComponents.createTooltip(options.tooltip));
        }

        this.elementMessage = document.createElement("small");
        this.elementMessage.classList.add("text-danger", "d-none");
        this.elementMessage.innerText = "No issues yet";
    }

    getLabel() {
        return this.elementLabel.textContent;
    }
}