export default function SkeletonCard() {
    return (
        <div className="flex w-full h-[165px] bg-[#111] rounded-md overflow-hidden border border-[#222] animate-pulse">
            {/* Image Section */}
            <div className="relative w-[115px] flex-shrink-0 h-full bg-[#1a1a1a]">
                <div className="absolute top-0 left-0 w-12 h-5 bg-[#222] rounded-br"></div>
                <div className="absolute top-0 right-0 w-16 h-5 bg-[#222] rounded-bl"></div>
            </div>

            {/* Content Section */}
            <div className="flex-1 flex flex-col p-2.5 bg-[#141414] gap-2">
                {/* Title */}
                <div className="h-4 bg-[#1a1a1a] rounded w-3/4"></div>

                {/* Status */}
                <div className="h-3 bg-[#1a1a1a] rounded w-1/3"></div>

                {/* Chapters */}
                <div className="flex flex-col gap-1.5 mt-auto">
                    <div className="h-8 bg-[#1f1f1f] rounded"></div>
                    <div className="h-8 bg-[#1f1f1f] rounded"></div>
                    <div className="h-8 bg-[#1f1f1f] rounded"></div>
                </div>
            </div>
        </div>
    );
}
