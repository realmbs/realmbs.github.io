import { Component } from 'react'
import type { ReactNode } from 'react'

type Props = { fallback: ReactNode; children: ReactNode }
type State = { failed: boolean }

// React error boundaries must be class components. Falls back to the static
// poster if WebGL is unavailable or the scene throws.
export default class GlobeErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
