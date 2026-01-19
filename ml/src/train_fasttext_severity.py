import json
import pandas as pd
import numpy as np
import re
import os
import fasttext
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

# -----------------------------
# Load Dataset
# -----------------------------

root_path = "data/raw/complaints.json"

with open(root_path, "r", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame([record["_source"] for record in data])

# -----------------------------
# Select Required Columns
# -----------------------------

df = df[['complaint_what_happened', 'product']]
df = df.rename(columns={
    'complaint_what_happened': 'complaint_text',
    'product': 'category'
})

df['complaint_text'] = df['complaint_text'].replace('', np.nan)
df = df.dropna(subset=['complaint_text'])

# -----------------------------
# Department Mapping (same as final)
# -----------------------------

def map_department(text, category):
    combined = f"{text} {category}".lower()

    if any(w in combined for w in ['fraud', 'unauthorized', 'identity theft', 'otp']):
        return 'Security'
    if any(w in combined for w in ['loan', 'mortgage', 'emi']):
        return 'Loans'
    return 'Accounts'

df['department'] = df.apply(
    lambda r: map_department(r['complaint_text'], r['category']), axis=1
)

# -----------------------------
# Severity Labeling (same logic)
# -----------------------------

HIGH = [
    'fraud', 'unauthorized', 'scam', 'identity theft',
    'charged twice', 'money deducted', 'account blocked',
    'card blocked', 'legal', 'urgent'
]

MEDIUM = [
    'delay', 'pending', 'failed', 'problem', 'issue',
    'not processed', 'not received'
]

LOW = [
    'request', 'query', 'clarification',
    'statement', 'details', 'information'
]

def map_severity(text, dept):
    text = text.lower()

    if any(w in text for w in HIGH):
        return 'High'
    if dept == 'Security':
        return 'High'
    if any(w in text for w in MEDIUM):
        return 'Medium'
    if any(w in text for w in LOW):
        return 'Low'
    return 'Medium'

df['severity'] = df.apply(
    lambda r: map_severity(r['complaint_text'], r['department']), axis=1
)

print("Severity distribution:")
print(df['severity'].value_counts())

# -----------------------------
# Text Cleaning (FastText-friendly)
# -----------------------------

def clean_text(text):
    text = text.lower()
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

df['cleaned_text'] = df['complaint_text'].apply(clean_text)

# -----------------------------
# Prepare FastText Format
# -----------------------------

df['ft_label'] = df['severity'].apply(lambda x: f"__label__{x}")

train_df, test_df = train_test_split(
    df[['ft_label', 'cleaned_text']],
    test_size=0.2,
    random_state=42,
    stratify=df['severity']
)

os.makedirs("fasttext_data", exist_ok=True)

train_file = "fasttext_data/severity_train.txt"
test_file  = "fasttext_data/severity_test.txt"

with open(train_file, "w", encoding="utf-8") as f:
    for _, r in train_df.iterrows():
        f.write(f"{r['ft_label']} {r['cleaned_text']}\n")

with open(test_file, "w", encoding="utf-8") as f:
    for _, r in test_df.iterrows():
        f.write(f"{r['ft_label']} {r['cleaned_text']}\n")

# -----------------------------
# Train FastText Severity Model
# -----------------------------

model = fasttext.train_supervised(
    input=train_file,
    epoch=40,
    lr=0.5,
    wordNgrams=2,
    dim=200,
    loss='softmax'
)

# -----------------------------
# Evaluate
# -----------------------------

y_true, y_pred = [], []

with open(test_file, "r", encoding="utf-8") as f:
    for line in f:
        label, text = line.strip().split(" ", 1)
        pred = model.predict(text, k=1)[0][0]
        y_true.append(label.replace("__label__", ""))
        y_pred.append(pred.replace("__label__", ""))

print("\nFastText Severity Accuracy:",
      accuracy_score(y_true, y_pred))

print("\nFastText Severity Classification Report:\n")
print(classification_report(y_true, y_pred))

# -----------------------------
# Save Model
# -----------------------------

os.makedirs("models", exist_ok=True)
model.save_model("models/fasttext_severity.bin")

print("\nFastText Severity model saved successfully")
