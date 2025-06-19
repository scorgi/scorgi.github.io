// @ts-check

/**
 * Layout Components Module
 * Coordinates navbar and footer components for unified layout initialization
 */

import { initializeNavbar } from './navbar.mjs';
import { initializeFooter } from './footer.mjs';

/**
 * Initializes layout components on a page
 * Automatically finds and replaces navbar and footer placeholders
 */
export async function initializeLayout() {
    // Initialize navbar and footer in parallel for better performance
    await Promise.all([
        initializeNavbar(),
        initializeFooter()
    ]);
}

/**
 * Utility function to load layout on page load
 * Call this in your page scripts
 */
export function loadLayout() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLayout);
    } else {
        initializeLayout();
    }
}

// Re-export individual components for direct access if needed
export { createNavbar, initializeNavbar } from './navbar.mjs';
export { createFooter, initializeFooter } from './footer.mjs';

// Auto-initialize layout when module is loaded
loadLayout(); 