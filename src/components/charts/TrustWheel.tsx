export const TrustWheel = () => {
  return (
    <div className="bg-gradient-to-br from-orange-400/80 via-pink-400/80 via-purple-500/80 to-blue-600/80 rounded-2xl p-8 relative overflow-hidden">
      <div className="absolute top-4 right-4 bg-primary/90 px-4 py-1 rounded-full">
        <span className="text-sm font-semibold">streak</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <span className="text-sm font-medium opacity-90">Task Point 32</span>
        <span className="text-sm font-medium opacity-90">
          Social Account 12
        </span>
      </div>

      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 h-48">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeDasharray="251.2"
              strokeDashoffset="62.8"
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-medium mb-1">Trust Score</span>
            <span className="text-5xl font-bold">93</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs opacity-75">
          Last updated on 05 October 2025
        </span>
        <div className="flex items-center justify-between text-sm font-semibold">
          <span className="mr-8">On-chain 52</span>
          <div className="flex items-center gap-2">
            <span>Trust Vote</span>
            <span>243.64</span>
          </div>
        </div>
      </div>
    </div>
  );
};
