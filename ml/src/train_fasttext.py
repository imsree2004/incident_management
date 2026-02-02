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

print("Dataset loaded successfully")
print("Total records:", len(data))

df = pd.DataFrame([record["_source"] for record in data])

# -----------------------------
# Select Required Columns
# -----------------------------

df = df[['complaint_what_happened', 'product', 'sub_product']]
df = df.rename(columns={
    'complaint_what_happened': 'complaint_text',
    'product': 'category',
    'sub_product': 'sub_category'
})

# -----------------------------
# Clean Empty Complaints
# -----------------------------

df['complaint_text'] = df['complaint_text'].replace('', np.nan)
df = df.dropna(subset=['complaint_text', 'category'])

print("Records after cleaning:", len(df))

# -----------------------------
# Department Mapping
# -----------------------------

def map_to_department(row):
    text = str(row['complaint_text']).lower()
    product = str(row['category']).lower()
    sub_product = str(row.get('sub_category', '')).lower()

    combined = " ".join([text, product, sub_product])

    # --- Security ---
    if any(word in combined for word in [
        'fraud', 'unauthorized', 'identity theft', 'scam', 'otp'
    ]):
        return 'Security'

    # --- Loans ---
    if any(word in combined for word in [
        'loan', 'mortgage', 'emi', 'repayment', 'foreclosure'
    ]):
        return 'Loans'

    # --- Accounts (Merged Banking + Billing) ---
    return 'Accounts'


df['department'] = df.apply(map_to_department, axis=1)

print("Department distribution:")
print(df['department'].value_counts())

# -----------------------------
# Text Cleaning (FastText-friendly)
# -----------------------------

def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)
    text = re.sub(r"[^a-z\s]", "", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

df['cleaned_text'] = df['complaint_text'].apply(clean_text)

# -----------------------------
# Prepare FastText Format
# -----------------------------

df['ft_label'] = df['department'].apply(lambda x: f"__label__{x}")

train_df, test_df = train_test_split(
    df[['ft_label', 'cleaned_text']],
    test_size=0.2,
    random_state=42,
    stratify=df['department']
)

os.makedirs("fasttext_data", exist_ok=True)

train_file = "fasttext_data/department_train.txt"
test_file  = "fasttext_data/department_test.txt"

with open(train_file, "w", encoding="utf-8") as f:
    for _, row in train_df.iterrows():
        f.write(f"{row['ft_label']} {row['cleaned_text']}\n")

with open(test_file, "w", encoding="utf-8") as f:
    for _, row in test_df.iterrows():
        f.write(f"{row['ft_label']} {row['cleaned_text']}\n")

print("FastText data files created")

# -----------------------------
# Train FastText Model
# -----------------------------

model = fasttext.train_supervised(
    input=train_file,
    epoch=25,
    lr=0.8,
    wordNgrams=2,
    dim=200,
    minn=3,
    maxn=6,
    loss='softmax'
)

# -----------------------------
# Evaluate Model
# -----------------------------

y_true = []
y_pred = []

with open(test_file, "r", encoding="utf-8") as f:
    for line in f:
        label, text = line.strip().split(" ", 1)

        # Predict label ONLY (no probabilities)
        pred_label = model.predict(text, k=1)[0][0]

        y_true.append(label.replace("__label__", ""))
        y_pred.append(pred_label.replace("__label__", ""))

print("\nFastText Department Accuracy:",
      accuracy_score(y_true, y_pred))

print("\nFastText Classification Report:\n")
print(classification_report(y_true, y_pred))


# -----------------------------
# Save Model
# -----------------------------

os.makedirs("models", exist_ok=True)
model.save_model("models/fasttext_department.bin")

print("\nFastText model saved successfully")
