// @ts-check

/**
 * Footer Component Module
 * Contains footer creation and initialization functionality
 */

/**
 * Loads the footer HTML template
 * @returns {Promise<string>} The footer HTML content
 */
async function loadFooterTemplate() {
    try {
        const response = await fetch('./html/templates/FOOTER.html');
        if (!response.ok) {
            throw new Error(`Failed to load footer template: ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error loading footer template:', error);
        // Fallback to empty content
        return '<div>Error loading footer</div>';
    }
}

/**
 * Creates and returns the main footer
 * @returns {Promise<HTMLElement>} The footer element
 */
export async function createFooter() {
    const footer = document.createElement("footer");
    footer.className = "modern-footer mt-auto";
    
    const template = await loadFooterTemplate();
    footer.innerHTML = template;
    
    return footer;
}

/**
 * Initializes the footer on the page
 * Finds and replaces footer placeholder or appends to body
 */
export async function initializeFooter() {
    const footerPlaceholder = document.getElementById('footer-placeholder');
    if (footerPlaceholder) {
        const footer = await createFooter();
        footerPlaceholder.replaceWith(footer);
    } else {
        // If no placeholder, append to body
        const footer = await createFooter();
        document.body.appendChild(footer);
    }
} 