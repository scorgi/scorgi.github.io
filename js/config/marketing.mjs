/** Production wiring. Never put provider secrets in this public file. */
export const MARKETING = {
  salesEmail: 'info@scorgi.com',
  // The previous /form/scorgi/submit/ URL returns 404 on scorgi.com.
  // Set only after verifying an endpoint accepting { formResponse } and
  // returning JSON { success: true } after durable lead storage.
  leadEndpoint: null,
};
