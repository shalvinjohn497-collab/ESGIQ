

export const PageShell = ({ title, subtitle, actions, children }) => (
  <div style={{ padding: '24px 32px', minHeight: '100%' }}>
    <div style={{ maxWidth: 1280, margin: '0 auto' }}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 32,
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#0f172a',
            letterSpacing: '-0.5px',
            marginBottom: 4,
          }}>
            {title}
          </h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>
            {subtitle}
          </p>
        </div>

        {actions && (
          <div style={{ display: 'flex', gap: 12 }}>
            {actions}
          </div>
        )}
      </div>

      {children}
    </div>
  </div>
);

export default PageShell;