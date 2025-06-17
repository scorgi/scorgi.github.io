// @ts-check

/** @type {4|5} */
let bootstrapVersion = 4;

export function bootstrapVersionGet() {
    return bootstrapVersion;
}
/** @param {4|5} version */
export function bootstrapVersionSet(version) {
    bootstrapVersion = version;
}
