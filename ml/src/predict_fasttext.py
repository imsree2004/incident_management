import re
import fasttext

# -----------------------------
# Load FastText Models
# -----------------------------

dept_model = fasttext.load_model("models/fasttext_department.bin")
sev_model  = fasttext.load_model("models/fasttext_severity.bin")

# -----------------------------
# Text Cleaning (MUST match training)
# -----------------------------

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# -----------------------------
# Inference Function
# -----------------------------

def predict_complaint(complaint_text, threshold=0.70):
    cleaned = clean_text(complaint_text)

    # Department Prediction
    dept_label, dept_prob = dept_model.predict(cleaned, k=1)
    department = dept_label[0].replace("__label__", "")
    dept_conf  = dept_prob[0]

    # Severity Prediction
    sev_label, sev_prob = sev_model.predict(cleaned, k=1)
    severity = sev_label[0].replace("__label__", "")
    sev_conf = sev_prob[0]

    # Decision Logic
    if dept_conf < threshold or sev_conf < threshold:
        action = "Manual Review Required"
    else:
        action = "Auto Routed"

    return {
        "department": department,
        "department_confidence": round(dept_conf, 2),
        "severity": severity,
        "severity_confidence": round(sev_conf, 2),
        "action": action
    }

# -----------------------------
# Demo
# -----------------------------

if __name__ == "__main__":
    complaint = "Some fraud called me and asked for my otp saying I won a price"
    result = predict_complaint(complaint)
    print(result)
