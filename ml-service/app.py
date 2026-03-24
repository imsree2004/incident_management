from fastapi import FastAPI
import fasttext
import re
import os

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

dept_model = fasttext.load_model(
    os.path.join(MODEL_DIR, "fasttext_department.bin")
)
sev_model = fasttext.load_model(
    os.path.join(MODEL_DIR, "fasttext_severity.bin")
)

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

@app.post("/predict")
def predict(data: dict):
    cleaned = clean_text(data["text"])

    dept_label, dept_prob = dept_model.predict(cleaned, k=1)
    sev_label, sev_prob = sev_model.predict(cleaned, k=1)

    return {
        "department": dept_label[0].replace("__label__", ""),
        "department_confidence": round(dept_prob[0], 2),
        "severity": sev_label[0].replace("__label__", ""),
        "severity_confidence": round(sev_prob[0], 2)
    }