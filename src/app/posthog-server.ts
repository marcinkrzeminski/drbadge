import { PostHog } from 'posthog-node'

let posthogInstance: PostHog | null = null

export function getPostHogServer() {
  if (!posthogInstance) {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
    
    if (!posthogKey) {
      console.warn('PostHog key not found, analytics will be disabled')
      return {
        capture: () => {},
        captureException: () => {},
        shutdown: () => Promise.resolve()
      } as unknown as PostHog
    }

    posthogInstance = new PostHog(posthogKey, {
      host: posthogHost,
      flushAt: 1,
      flushInterval: 0 // Because server-side functions in Next.js can be short-lived we flush regularly
    })
  }
  return posthogInstance
}