export default function Button({ children, variant = 'primary', onClick, className = '', ...props }) {
    const cls = variant === 'secondary' ? 'btn btn-secondary'
        : variant === 'outline' ? 'btn btn-outline'
            : 'btn btn-primary';
    return (
        <button className={`${cls} ${className}`} onClick={onClick} {...props}>
            {children}
        </button>
    );
}
