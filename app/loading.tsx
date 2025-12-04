import SkeletonHero from "./components/SkeletonHero";
import SkeletonSlider from "./components/SkeletonSlider";
import SkeletonCard from "./components/SkeletonCard";

export default function Loading() {
    return (
        <div className="bg-[#050505] min-h-screen pb-20 text-right" dir="rtl">
            {/* Hero Skeleton */}
            <SkeletonHero />

            <div className="w-full max-w-full md:max-w-[1450px] mx-auto px-4 md:px-6 mt-6 md:mt-10">
                {/* Slider Skeleton */}
                <SkeletonSlider />

                <div className="flex flex-col xl:flex-row gap-10 border-t border-white/5 pt-10">
                    {/* Main Grid Skeleton */}
                    <div className="w-full xl:w-[75%]">
                        {/* Header Skeleton */}
                        <div className="flex items-center gap-4 mb-8 pb-4 border-b border-[#1a1a1a]">
                            <div className="w-12 h-12 bg-[#111] rounded-xl animate-pulse"></div>
                            <div className="flex flex-col gap-2">
                                <div className="h-6 w-32 bg-[#111] rounded animate-pulse"></div>
                                <div className="h-3 w-48 bg-[#111] rounded animate-pulse"></div>
                            </div>
                        </div>

                        {/* Cards Grid Skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Skeleton */}
                    <div className="w-full xl:w-[25%]">
                        <div className="flex flex-col gap-6">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 bg-[#111] rounded-lg animate-pulse"></div>
                                <div className="h-5 w-32 bg-[#111] rounded animate-pulse"></div>
                            </div>

                            {/* Trending items */}
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#111] animate-pulse">
                                    <div className="w-10 h-10 bg-[#1a1a1a] rounded"></div>
                                    <div className="w-12 h-16 bg-[#1a1a1a] rounded-lg"></div>
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className="h-3 bg-[#1a1a1a] rounded w-3/4"></div>
                                        <div className="h-2 bg-[#1a1a1a] rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
