export function BrowserSupportWarning() {
  return (
    <div className="mb-6 glass glass-card border-accent-warning/50">
      <div className="flex gap-3 items-center">
        <div className="flex justify-center items-center w-6 h-6 rounded-full bg-accent-warning/20">
          <span className="text-sm text-accent-warning">!</span>
        </div>
        <div>
          <h3 className="font-semibold text-accent-warning">Limited Browser Support</h3>
          <p className="text-sm text-text-secondary">
            Your browser doesn't support multi-threading. Conversions may be slower.
          </p>
        </div>
      </div>
    </div>
  );
}