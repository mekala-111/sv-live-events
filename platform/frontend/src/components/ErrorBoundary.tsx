import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex min-h-screen flex-col items-center justify-center bg-[#090909] px-6 text-center text-white"
        >
          <h1 className="font-display text-2xl">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-white/60">
            {this.state.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            type="button"
            className="mt-6 rounded-full bg-gold px-6 py-3 text-sm font-medium text-black"
            onClick={() => window.location.assign('/')}
          >
            Go home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
