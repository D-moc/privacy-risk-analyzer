export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex justify-center items-center bg-black text-white">
      <div className="bg-gray-800 p-6 rounded-xl">
        <h2 className="mb-4">Reset Password</h2>
        <input className="p-2 bg-gray-700 rounded w-full" placeholder="Email" />
        <button className="mt-3 bg-blue-600 p-2 rounded w-full">
          Send Link
        </button>
      </div>
    </div>
  );
}