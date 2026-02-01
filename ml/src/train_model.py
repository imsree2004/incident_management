import json
import pandas as pd
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.svm import LinearSVC
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os


root_path = "data/raw/complaints.json"

with open(root_path, "r", encoding="utf-8") as f:
    data = json.load(f)

print("Dataset loaded successfully")
print("Type of data:", type(data))
print("Number of records:", len(data))
print("First record keys:", data[0].keys())

df = pd.DataFrame([record["_source"] for record in data])

# Step: Select only required columns
df = df[[
    'complaint_what_happened',
    'product',
    'sub_product'
]]

# Step: Rename columns to be reader-friendly
df = df.rename(columns={
    'complaint_what_happened': 'complaint_text',
    'product': 'category',
    'sub_product': 'sub_category'
})

#df['category'] = df['category'] + '+' + df['sub_category']
#df = df.drop(['sub_category'],axis= 1)
#print("After renaming columns:")
#print(df.head(10))


# Step: Handle missing / empty complaint text


# Check NaN complaints
print("NaN complaint_text count:", df['complaint_text'].isnull().sum())

# Check empty string complaints
print("Empty complaint_text count:", len(df[df['complaint_text'] == '']))

# Replace empty strings with NaN
df.loc[df['complaint_text'] == '', 'complaint_text'] = np.nan

# Drop rows where complaint_text is NaN
df = df[~df['complaint_text'].isnull()]

# Final verification
print("Remaining records after cleaning:", len(df))
print("NaN complaint_text count after cleaning:", df['complaint_text'].isnull().sum())

df = df[df['category'].notna()]

# Step: Single-Department Mapping


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
#print(df[['complaint_text', 'category', 'department']].head(10))


# Improved Severity Labeling


HIGH_SEVERITY_KEYWORDS = [
    'fraud', 'unauthorized', 'scam', 'identity theft',
    'charged twice', 'money deducted', 'incorrect charge',
    'account blocked', 'account locked', 'card blocked',
    'not working', 'service stopped', 'failed completely',
    'legal', 'complaint filed', 'immediately', 'urgent'
]

MEDIUM_SEVERITY_KEYWORDS = [
    'delay', 'pending', 'failed', 'problem', 'issue',
    'error', 'not processed', 'not received', 'dispute'
]

LOW_SEVERITY_KEYWORDS = [
    'request', 'query', 'clarification', 'information',
    'statement', 'details', 'how to', 'please provide'
]

def map_to_severity(text, department):
    text = str(text).lower()

    
    # Rule 1: Strong High-Severity Signals
    
    if any(word in text for word in HIGH_SEVERITY_KEYWORDS):
        return 'High'

    
    # Rule 2: Department-based escalation
    
    if department == 'Billing' and any(
        word in text for word in ['charge', 'deducted', 'refund', 'payment']
    ):
        return 'High'

    if department == 'Security':
        return 'High'

    
    # Rule 3: Medium Severity
    
    if any(word in text for word in MEDIUM_SEVERITY_KEYWORDS):
        return 'Medium'

    
    # Rule 4: Low Severity
    
    if any(word in text for word in LOW_SEVERITY_KEYWORDS):
        return 'Low'

    
    # Default fallback
    
    return 'Medium'

df['severity'] = df.apply(
    lambda row: map_to_severity(row['complaint_text'], row['department']),
    axis=1
)

print("Improved severity distribution:")
print(df['severity'].value_counts())
print(df[['complaint_text', 'category', 'department','severity']].head(10))

nltk.download('stopwords')
nltk.download('wordnet')


# Step: NLP Cleaning

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

def clean_text(text):
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", "", text)   # remove URLs
    text = re.sub(r"[^a-z\s]", "", text)         # remove punctuation & numbers
    tokens = text.split()
    tokens = [t for t in tokens if t not in stop_words]
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(tokens)

df['cleaned_text'] = df['complaint_text'].apply(clean_text)

print("Sample cleaned text:")
print(df[['complaint_text', 'cleaned_text']].head(5))

# -----------------------------
# Step: TF-IDF Vectorization
# -----------------------------

tfidf_vectorizer = TfidfVectorizer(
    analyzer='char_wb',
    ngram_range=(3, 5),
    min_df=3,
    sublinear_tf=True
)



X = tfidf_vectorizer.fit_transform(df['cleaned_text'])
print("TF-IDF matrix shape:", X.shape)

# Targets
y_department = df['department']
#y_severity   = df['severity']

# -----------------------------
# Train / Test Split
# -----------------------------

X_train, X_test, y_dep_train, y_dep_test = train_test_split(
    X, y_department,
    test_size=0.2,
    random_state=42,
    stratify=y_department
)
"""
_, _, y_sev_train, y_sev_test = train_test_split(
    X, y_severity,
    test_size=0.2,
    random_state=42,
    stratify=y_severity
)
"""
print("Train/Test split completed")

# -----------------------------
# Department Model (Linear SVM)
# -----------------------------

from sklearn.svm import LinearSVC

dept_model = LinearSVC(
    C=1.0,
    class_weight='balanced',
    max_iter=5000
)

dept_model.fit(X_train, y_dep_train)

y_dep_pred = dept_model.predict(X_test)

print("\nDepartment Model (Linear SVM) Accuracy:",
      accuracy_score(y_dep_test, y_dep_pred))
print("Department Classification Report (Linear SVM):\n")
print(classification_report(y_dep_test, y_dep_pred))

"""
# -----------------------------
# Severity Model (Logistic Regression)
# -----------------------------

sev_model = LogisticRegression(
    max_iter=1000,
    class_weight='balanced'
)

sev_model.fit(X_train, y_sev_train)

y_sev_pred = sev_model.predict(X_test)

print("\nSeverity Model Accuracy:",
      accuracy_score(y_sev_test, y_sev_pred))
print("Severity Classification Report:\n")
print(classification_report(y_sev_test, y_sev_pred))
"""
# -----------------------------
# Save Models
# -----------------------------

os.makedirs("models", exist_ok=True)

joblib.dump(tfidf_vectorizer, "models/tfidf_vectorizer.pkl")
joblib.dump(dept_model, "models/department_classifier.pkl")
#joblib.dump(sev_model, "models/severity_classifier.pkl")

print("\nAll models and vectorizer saved successfully.")
