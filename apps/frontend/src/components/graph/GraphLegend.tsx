export function GraphLegend() {
    const items = [
        { color: 'bg-violet-400', label: 'Component' },
        { color: 'bg-teal-400',   label: 'Hook' },
        { color: 'bg-amber-400',  label: 'Util' },
        { color: 'bg-blue-400',   label: 'Config' },
    ]

    return (
        <div
            className="absolute bottom-6 left-4 z-10
                flex flex-col gap-1.5 p-2.5 rounded-xl
                bg-[var(--zinc-900)]/90 border border-[var(--zinc-800)] backdrop-blur-sm"
            aria-label="Graph legend"
        >
            {items.map(item => (
                <div key={item.label} className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} aria-hidden="true" />
                    <span className="text-[11px] text-[var(--zinc-400)]">{item.label}</span>
                </div>
            ))}
            <div className="border-t border-[var(--zinc-800)] mt-1 pt-1.5">
                <p className="text-[10px] text-[var(--zinc-600)]">
                    Size = lines of code
                </p>
            </div>
        </div>
    )
}