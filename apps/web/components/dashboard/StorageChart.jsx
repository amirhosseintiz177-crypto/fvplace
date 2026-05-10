export function StorageChart() {
  const segments = [42, 21, 14, 8];
  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div><p className="text-sm text-slate-400">Storage Usage</p><h2 className="text-3xl font-black">8.4 GB / 15 GB</h2></div>
        <span className="rounded-full bg-cyanGlow/10 px-3 py-1 text-sm text-cyanGlow">56%</span>
      </div>
      <div className="flex h-5 overflow-hidden rounded-full bg-white/10">
        {segments.map((value, index) => <div key={index} style={{ width: `${value}%` }} className={['bg-cyanGlow', 'bg-violetGlow', 'bg-blue-400', 'bg-pink-400'][index]} />)}
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3 text-xs text-slate-300">
        {['Images', 'Videos', 'Docs', 'Code'].map((item) => <div key={item} className="rounded-2xl bg-white/5 p-3">{item}</div>)}
      </div>
    </div>
  );
}
