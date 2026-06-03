import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Area */}
      <div className="ml-0 lg:ml-72">

        {/* Fixed Navbar */}
        <Navbar />

        {/* Scrollable Content */}
        <main className="pt-28 px-8 pb-8">

          {/* Hero */}
          <Hero />

          {/* Stats Cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-8">

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Scans Completed
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                124
              </h2>

              <p className="mt-2 text-sm text-green-600">
                +12% this month
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Threats Found
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                8
              </h2>

              <p className="mt-2 text-sm text-red-500">
                Needs attention
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Reports Generated
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                56
              </h2>

              <p className="mt-2 text-sm text-cyan-600">
                Updated recently
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <p className="text-sm text-slate-500">
                Privacy Score
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                92%
              </h2>

              <p className="mt-2 text-sm text-green-600">
                Excellent
              </p>
            </div>

          </section>

            </main>

      </div>

    </div>
  );
}

export default Home;