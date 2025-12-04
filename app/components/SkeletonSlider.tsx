export default function SkeletonSlider() {
    return (
        <section className="w-full max-w-full overflow-hidden mb-12 md:mb-16">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-[#1a1a1a] rounded animate-pulse"></div>
                    <div className="h-6 w-32 bg-[#1a1a1a] rounded animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#1a1a1a] animate-pulse"></div>
                    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[#1a1a1a] animate-pulse"></div>
                </div>
            </div>

            <div className="flex gap-3 overflow-hidden">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-[calc(50%-6px)] md:w-[calc(33.333%-8px)]">
                        <div className="relative aspect-[2/3] rounded-xl bg-[#1a1a1a] animate-pulse"></div>
                    </div>
                ))}
            </div>
        </section>
    );
}
