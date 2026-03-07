export default function Loading() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            {/* Animated Flower Loader */}
            <div className="relative mb-8">
                <div className="w-16 h-16 border-4 border-[#D4AF37]/30 rounded-full animate-spin border-t-[#D4AF37]" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl animate-pulse">🌸</span>
                </div>
            </div>

            {/* Loading Text */}
            <p className="text-zinc-500 uppercase tracking-widest text-sm animate-pulse">
                Загрузка...
            </p>
        </div>
    );
}
