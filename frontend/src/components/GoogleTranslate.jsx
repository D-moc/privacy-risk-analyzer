import { useEffect } from "react";

function GoogleTranslate() {
  useEffect(() => {
    const addScript = document.createElement("script");

    addScript.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";

    addScript.async = true;

    document.body.appendChild(addScript);

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,mr",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);

  return (
    <div id="google_translate_element"></div>
  );
}

export default GoogleTranslate;