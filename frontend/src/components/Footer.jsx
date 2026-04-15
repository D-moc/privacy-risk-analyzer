function Footer() {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6 text-gray-600">

        <div>
          <h2 className="font-bold text-lg text-gray-800">PrivacyAI</h2>
          <p className="mt-2 text-sm">
            Making privacy policies simple and understandable using AI.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800">Quick Links</h3>
          <ul className="mt-2 space-y-1">
            <li>Home</li>
            <li>About</li>
            <li>Extension</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800">Contact</h3>
          <p className="mt-2 text-sm">privacyai@email.com</p>
        </div>

      </div>

      <div className="text-center text-sm text-gray-400 pb-4">
        © 2026 PrivacyAI. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;