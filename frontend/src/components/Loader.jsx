function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-12">

      {/* GLOW SPINNER */}
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-blue-400 opacity-20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
      </div>

      {/* TEXT */}
      <p className="mt-5 text-gray-500 text-sm tracking-wide">
        AI is analyzing the policy...
      </p>

    </div>
  );
}

export default Loader;