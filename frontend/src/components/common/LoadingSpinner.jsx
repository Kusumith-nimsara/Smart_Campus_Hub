export default function LoadingSpinner({ label = 'Loading...' }) {
  return <div aria-live="polite">{label}</div>
}
