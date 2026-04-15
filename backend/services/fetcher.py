import requests
from bs4 import BeautifulSoup

def fetch_policy(input_data):

    # 🔒 SAFETY CHECK
    if not input_data:
        return ""

    try:
        # 🌐 IF URL → fetch content
        if isinstance(input_data, str) and input_data.startswith("http"):
            response = requests.get(input_data, timeout=10)

            # ❌ Check if request failed
            if response.status_code != 200:
                return ""

            soup = BeautifulSoup(response.text, "html.parser")

            # 🔥 Remove scripts/styles (cleaner text)
            for tag in soup(["script", "style"]):
                tag.extract()

            text = soup.get_text(separator=" ")

            # 🔥 Clean extra spaces
            return " ".join(text.split())

        # 📝 IF RAW TEXT → return as is
        return input_data

    except Exception as e:
        print("Fetch error:", e)
        return ""