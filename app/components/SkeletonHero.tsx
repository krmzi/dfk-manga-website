export default function SkeletonHero() {
    return (
        <div className="w-full bg-[#050505] pt-4 pb-4 px-4 md:px-8">
            <div className="w-full max-w-full md:max-w-[1400px] mx-auto relative">
                <div className="w-full h-[260px] md:h-[500px] rounded-xl md:rounded-3xl overflow-hidden bg-[#111] animate-pulse relative">
                    {/* Badges */}
                    <div className="absolute top-4 right-4 md:top-10 md:right-12 flex items-center gap-2 md:gap-3 z-10">
                        <div className="w-16 h-6 bg-[#1a1a1a] rounded-full"></div>
                        <div className="w-12 h-6 bg-[#1a1a1a] rounded-full"></div>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-8 md:bottom-20 left-4 right-4 md:left-16 md:right-16 flex flex-col items-center md:items-start gap-4">
                        {/* Title */}
                        <div className="h-8 md:h-16 bg-[#1a1a1a] rounded w-3/4 md:w-1/2"></div>

                        {/* Description - desktop only */}
                        <div className="hidden md:block h-6 bg-[#1a1a1a] rounded w-2/3"></div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
                            <div className="flex-1 md:flex-none h-10 md:h-12 bg-[#1a1a1a] rounded-lg md:rounded-xl w-full md:w-32"></div>
                            <div className="flex-1 md:flex-none h-10 md:h-12 bg-[#1a1a1a] rounded-lg md:rounded-xl w-full md:w-32"></div>
                        </div>
                    </div>

                    {/* Pagination dots */}
                    <div className="absolute bottom-3 md:bottom-4 left-0 right-0 flex justify-center gap-2">
                        <div className="w-6 h-2 bg-[#1a1a1a] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#1a1a1a] rounded-full"></div>
                        <div className="w-2 h-2 bg-[#1a1a1a] rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
