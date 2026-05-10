export function GlassCard({ children, className = '' }) {
  return <section className={`glass rounded-[2rem] p-6 ${className}`}>{children}</section>;
}
