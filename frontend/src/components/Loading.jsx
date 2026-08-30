function Loading({ text = "Loading data..." }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        <p className="mt-3 text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

export default Loading;