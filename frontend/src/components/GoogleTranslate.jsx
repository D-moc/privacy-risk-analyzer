import { useEffect } from "react";

function GoogleTranslate() {
  useEffect(() => {
    // Prevent loading script multiple times
    if (window.googleTranslateElementInit) return;

    window.googleTranslateElementInit = () => {
      if (
        window.google &&
        window.google.translate &&
        document.getElementById("google_translate_element")
      ) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,hi,mr",
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    const existingScript = document.querySelector(
      'script[src*="translate_a/element.js"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");

      script.src =
        "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

      script.async = true;

      document.body.appendChild(script);
    }
  }, []);

  return <div id="google_translate_element" />;
}

export default GoogleTranslate;