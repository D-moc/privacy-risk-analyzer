import requests
from bs4 import BeautifulSoup

def fetch_policy(input_data):

    if not input_data:
        return ""

    try:
        if isinstance(input_data, str) and input_data.startswith("http"):
            response = requests.get(input_data, timeout=10)

            if response.status_code != 200:
                return ""

            soup = BeautifulSoup(response.text, "html.parser")
            for tag in soup(["script", "style"]):
                tag.extract()

            text = soup.get_text(separator=" ")
            return " ".join(text.split())

        return input_data

    except Exception as e:
        print("Fetch error:", e)
        return ""