export type BoolOrObjectOfBool<T> = boolean | SetResult<T>;
export interface SetResult<T> extends Record<string, BoolOrObjectOfBool<T>> {}

/**
 * Generic input elements represent containers, typically holding other field elements or even containers
 */
export interface IGenericInputElement<T> {
    /** Represents the root element that can be used to move this around in the DOM */
    elementColumn: HTMLElement;
    /** Represents the label element that is used to describe this input with a form */
    elementLabel: HTMLElement;
    /** Represents if this input should contain a value that must is defined and valid */
    required: boolean;

    set(value: T): BoolOrObjectOfBool<boolean>;
    get(): T;
    disable(): void;
    enable(): void;

    validate(): ValidationMessage;
    validationMessageUpdate(validationMessage: ValidationMessage): void;
    validationClear(): void;

    getLabel(): string | null;

    spin(): void;
    success(): void;
    failure(): void;
}

/**
 * Generic input element fields represent input elements that can be changed directly by the user
 */
export interface IGenericInputElementField extends IGenericInputElement<any> {
    /* Represents the input element that can be interacted with by the user */
    elementInput: HTMLElement;

    // reset(): void;
    // clear(): void;
    // focus(): void;
    // defineOnInput(callback: EventListener): void;
    // defineOnBlur(callback: EventListener): void;
}

// #region Input Elements

export interface InputGroupOptions {
    label?: string;
    required?: boolean;
    showCount?: boolean;
    tooltip?: string;
    collapsible?: boolean;
    startCollapsed?: boolean;
    type?: string;
}

export interface InputGroupArrayOptions {
    draggable?: boolean;
    removable?: boolean;
}

export interface InputElementOptions {
    label?: string;
    containerClass?: string;
    required?: boolean;
    tooltip?: string;
}

export interface InputElementSelectOption {
    text: string;
    value: string;
    hidden?: boolean;
    group?: string;
    disabled?: boolean;
}

export interface InputElementDataListOption {
    text: string;
    value: string;
    description: string;
    hidden?: boolean;
    group?: string;
    preview?: boolean;
}

//#endregion

// #region Visual Elements

export interface VisualAlertOptions {
    type: string;
    title: string;
    text?: string;
    icon?: string;
    dismissible?: boolean;
}

// #endregion

// #region Validation

export interface ValidationOptions {
    test?: boolean;
    checkUnique?: boolean;
}

export interface ValidationMessage {
    valid: boolean;
    reason: string;
}

//#endregion
