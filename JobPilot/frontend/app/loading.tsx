export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center" aria-label="Loading" role="status">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading your content...</p>
      </div>
    </div>
  );
}
