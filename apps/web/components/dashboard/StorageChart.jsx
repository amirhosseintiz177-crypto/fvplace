export function StorageChart() {
  const segments = [44, 24, 18, 14];
  const labels = [
    { name: 'ویدیو', color: 'bg-cyanGlow' },
    { name: 'تصویر', color: 'bg-violetGlow' },
    { name: 'سند', color: 'bg-amber-300' },
    { name: 'کد و سایر', color: 'bg-rose-300' },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-slate-400">Storage Overview</p>
          <h2 className="text-3xl font-black">8.4 GB / 15 GB</h2>
        </div>
        <span className="rounded-full bg-cyanGlow/10 px-3 py-1 text-sm text-cyanGlow">56% مصرف شده</span>
      </div>
      <div className="flex h-5 overflow-hidden rounded-full bg-white/10">
        {segments.map((value, index) => <div key={index} style={{ width: `${value}%` }} className={labels[index].color} />)}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {labels.map((label, index) => (
          <div key={label.name} className="rounded-[1.3rem] border border-white/8 bg-white/[0.04] p-3 text-sm">
            <div className="mb-2 flex items-center gap-2">
              <span className={`h-3 w-3 rounded-full ${label.color}`} />
              <span>{label.name}</span>
            </div>
            <strong className="text-lg font-black">{segments[index]}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
