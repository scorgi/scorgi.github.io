// @ts-check

/**
 * Navbar Component Module
 * Contains navbar creation and behavior functionality
 */

/**
 * Loads the navbar HTML template
 * @returns {Promise<string>} The navbar HTML content
 */
async function loadNavbarTemplate() {
    try {
        const response = await fetch('./html/templates/NAVBAR.html');
        if (!response.ok) {
            throw new Error(`Failed to load navbar template: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading navbar template:', error);
        // Fallback to empty content
        return '<div>Error loading navbar</div>';
    }
}

/**
 * Creates and returns the main navigation bar
 * @returns {Promise<HTMLElement>} The navbar element
 */
export async function createNavbar() {
    const nav = document.createElement("nav");
    nav.className = "navbar fixed-top navbar-light navbar-scorgi";
    
    const template = await loadNavbarTemplate();
    nav.innerHTML = template;
    
    return nav;
}

/**
 * Initializes navbar responsive behavior
 */
export function initializeNavbarBehavior() {
    // Mobile email text adjustment
    if (window.screen && window.screen.width < 768) {
        const emailText = document.querySelector(".email-text");
        if (emailText) {
            emailText.innerHTML = '<i class="bi bi-envelope-fill mr-1"></i> Email Us!';
        }
    }
}

/**
 * Initializes the navbar on the page
 * Finds and replaces navbar placeholder or inserts at beginning of body
 */
export async function initializeNavbar() {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        const navbar = await createNavbar();
        navbarPlaceholder.replaceWith(navbar);
    } else {
        // If no placeholder, insert at the beginning of body
        const navbar = await createNavbar();
        document.body.insertAdjacentElement('afterbegin', navbar);
    }
    
    // Initialize responsive behavior
    initializeNavbarBehavior();
} 