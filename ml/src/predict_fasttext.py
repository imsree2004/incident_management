import re
import fasttext

# -----------------------------
# Load Models
# -----------------------------

complaint_model = fasttext.load_model("models/fasttext_complaint_detector.bin")
dept_model = fasttext.load_model("models/fasttext_department.bin")
sev_model  = fasttext.load_model("models/fasttext_severity.bin")

# -----------------------------
# Configuration (Scalable Weights)
# -----------------------------

WEIGHTS = {
    "High": 60,
    "Medium": 40,
    "Low": 20,
    "financial_risk": 30,
    "strong_signal": 20
}

PRIORITY_THRESHOLDS = {
    "high_priority": 80,
    "route": 50
}

# Financial Risk Signals 
FINANCIAL_RISK_SIGNALS = [
    "refund", "charged", "money deducted",
    "wrong deduction", "double charged",
    "payment failed", "transaction failed",
    "amount not credited", "payment reversal"
]

# -----------------------------
# Text Cleaning
# -----------------------------

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

# -----------------------------
# Complaint Intent Detection
# -----------------------------

COMPLAINT_STRONG_SIGNALS = [
    "fraud", "unauthorized", "scam",
    "account blocked", "stolen", "hacked"
]

COMPLAINT_MODERATE_SIGNALS = [
    "not able", "unable", "cannot", "can't",
    "issue", "problem", "error",
    "delay", "missing", "login issue",
    "not working"
]

ACTION_REQUEST_SIGNALS = [
    "please resolve", "need help", "fix this",
    "as soon as possible", "immediately",
    "looking for resolution"
]


def is_valid_complaint(text):

    cleaned = clean_text(text)

    label, prob = complaint_model.predict(cleaned, k=1)

    predicted_label = label[0].replace("__label__", "")
    confidence = prob[0]

    # Accept complaint if model predicts complaint with decent confidence
    if predicted_label == "complaint" and confidence >= 0.60:
        return True, round(confidence, 2)

    return False, round(confidence, 2)


# -----------------------------
# Priority Scoring Engine
# -----------------------------

def calculate_priority(cleaned_text, model_severity):

    priority_score = 0

    # Base severity weight
    priority_score += WEIGHTS.get(model_severity, 0)

    # Financial risk weight
    for keyword in FINANCIAL_RISK_SIGNALS:
        if keyword in cleaned_text:
            priority_score += WEIGHTS["financial_risk"]
            break

    # Strong complaint signal weight
    for phrase in COMPLAINT_STRONG_SIGNALS:
        if phrase in cleaned_text:
            priority_score += WEIGHTS["strong_signal"]
            break

    return priority_score


# -----------------------------
# Inference Function
# -----------------------------

def predict_complaint(complaint_text):

    cleaned = clean_text(complaint_text)

    # Stage 1: Complaint Detection
    is_complaint, complaint_score = is_valid_complaint(complaint_text)

    if not is_complaint:
        return {
            "message": "Input does not appear to be a valid complaint.",
            "score": complaint_score
        }

    # Stage 2: Department Prediction
    dept_label, dept_prob = dept_model.predict(cleaned, k=1)
    department = dept_label[0].replace("__label__", "")
    dept_conf  = dept_prob[0]

    # Stage 3: Severity Prediction
    sev_label, sev_prob = sev_model.predict(cleaned, k=1)
    model_severity = sev_label[0].replace("__label__", "")
    sev_conf = sev_prob[0]

    # Stage 4: Priority Scoring
    priority_score = calculate_priority(cleaned, model_severity)

    # Final Action Decision
    if priority_score >= PRIORITY_THRESHOLDS["high_priority"]:
        action = "Auto Routed - High Priority"
    elif priority_score >= PRIORITY_THRESHOLDS["route"]:
        action = "Auto Routed"
    else:
        action = "Auto Response"

    return {
        "department": department,
        "department_confidence": round(dept_conf, 2),
        "severity": model_severity,
        "severity_confidence": round(sev_conf, 2),
        "priority_score": priority_score,
        "action": action
    }


# -----------------------------
# Demo
# -----------------------------

if __name__ == "__main__":
    complaint = "i cant login to my account.login issue"
    result = predict_complaint(complaint)
    print(result)