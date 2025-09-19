export function AppFooter() {
  return (
    <footer className="mt-8 border-t backdrop-blur-sm bg-background/50">
      <div className="container px-4 py-4 mx-auto max-w-7xl">
        <div className="flex gap-1 justify-center items-center text-sm text-muted-foreground">
          Made by{' '}
          <a
            href="http://revolabs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold transition-colors hover:text-foreground"
          >
            RevoLabs
          </a>{' '}
          with{' '}
          <span className="text-red-600 size-4">♥️</span>
        </div>
      </div>
    </footer>
  );
}