export function GlassCard({ children, className = '' }) {
  return <section className={`panel rounded-[2rem] p-6 ${className}`}>{children}</section>;
}
