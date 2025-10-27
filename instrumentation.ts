export async function register() {
  // No-op for initialization
}

export async function onRequestError(err: Error, request: Request) {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { getPostHogServer } = await import('./src/app/posthog-server')
      const posthog = getPostHogServer()

      let distinctId = 'anonymous'
      const cookieHeader = request.headers.get('cookie')
      if (cookieHeader) {
        // Look for PostHog cookie pattern
        const postHogCookieMatch = cookieHeader.match(/ph_[^=]+_posthog=([^;]+)/)

        if (postHogCookieMatch && postHogCookieMatch[1]) {
          try {
            const decodedCookie = decodeURIComponent(postHogCookieMatch[1])
            const postHogData = JSON.parse(decodedCookie)
            distinctId = postHogData.distinct_id || 'anonymous'
          } catch (e) {
            console.warn('Could not parse PostHog cookie:', e)
          }
        }
      }

      // Capture the exception with available distinctId
      posthog.captureException(err, distinctId)
    } catch (e) {
      console.error('Error in PostHog error tracking:', e)
    }
  }
}