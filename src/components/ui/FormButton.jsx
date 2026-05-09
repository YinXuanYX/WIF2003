// FormButton — Reusable gradient button with loading state
// Same visual language as AuthButton, for in-app forms.

export default function FormButton({
  children,
  type = 'submit',
  variant = 'primary',
  loading = false,
  loadingText = 'Saving...',
  disabled = false,
  fullWidth = true,
  ...rest
}) {
  const variantClass = variant === 'danger' ? 'form-btn--danger' :
                       variant === 'outline' ? 'form-btn--outline' :
                       '';

  return (
    <button
      type={type}
      className={`form-btn ${variantClass} ${fullWidth ? 'form-btn--full' : ''}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
