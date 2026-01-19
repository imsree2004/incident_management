import joblib
import re
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer


# Load trained artifacts

tfidf = joblib.load("models/tfidf_vectorizer.pkl")
dept_model = joblib.load("models/department_classifier.pkl")
sev_model = joblib.load("models/severity_classifier.pkl")


# NLP cleaning 

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in stop_words]
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(tokens)

# Confidence-based prediction

CONFIDENCE_THRESHOLD = 0.70

def predict_complaint(complaint_text):
    cleaned = clean_text(complaint_text)
    X = tfidf.transform([cleaned])

    # Department prediction
    dept_probs = dept_model.predict_proba(X)[0]
    dept_idx = dept_probs.argmax()
    dept_conf = dept_probs[dept_idx]
    dept_label = dept_model.classes_[dept_idx]

    # Severity prediction
    sev_probs = sev_model.predict_proba(X)[0]
    sev_idx = sev_probs.argmax()
    sev_conf = sev_probs[sev_idx]
    sev_label = sev_model.classes_[sev_idx]

    result = {
        "department": dept_label,
        "department_confidence": round(float(dept_conf), 2),
        "severity": sev_label,
        "severity_confidence": round(float(sev_conf), 2)
    }

    # Confidence-based routing decision
    if dept_conf < CONFIDENCE_THRESHOLD or sev_conf < CONFIDENCE_THRESHOLD:
        result["action"] = "Manual Review Required"
    else:
        result["action"] = "Auto-Routed"

    return result

if __name__ == "__main__":
    complaint = "Some fraud called me and asked for my otp saying I won a price"
    prediction = predict_complaint(complaint)
    print(prediction)
