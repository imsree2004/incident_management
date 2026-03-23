import pandas as pd
import fasttext
import random
import os

# -----------------------------
# Load Complaint Data
# -----------------------------

import json

root_path = "data/raw/complaints.json"

with open(root_path, "r", encoding="utf-8") as f:
    data = json.load(f)

df = pd.DataFrame([record["_source"] for record in data])

df = df[['complaint_what_happened']]
df = df.rename(columns={'complaint_what_happened': 'text'})
df = df[df['text'].notna()]
df = df[df['text'].str.strip() != ""]

# -----------------------------
# Create Complaint Samples
# -----------------------------

complaints = df['text'].tolist()


# -----------------------------
# Improved Non-Complaint Generator
# -----------------------------

import random

greetings = [
    "hello", "hi", "good morning", "good evening",
    "hope you are doing well", "dear team"
]

conversation_phrases = [
    "we spoke yesterday",
    "he mentioned everything is fine",
    "she confirmed it was okay",
    "we had a normal discussion",
    "the meeting went well",
    "everything looks good"
]

informational_phrases = [
    "please review the attached file",
    "sharing the report for reference",
    "the document has been uploaded",
    "this is a general update",
    "the schedule has been finalized",
    "the system maintenance is complete"
]

positive_phrases = [
    "thank you for your support",
    "appreciate your help",
    "great work on the project",
    "everything is working perfectly",
    "looking forward to working together"
]

short_messages = [
    "okay", "noted", "sure", "understood",
    "fine", "alright", "sounds good"
]

casual_neutral = [
    "someone said he is fine",
    "she told me everything is okay",
    "we talked about random things",
    "nothing serious happened",
    "it was just a normal conversation",
    "we had a casual discussion"
]

# Neutral sentences containing complaint keywords (to prevent leakage)

keyword_neutral = [
    "explain refund policy",
    "refund rules information",
    "refund policy details",
    "how refund processing works",

    "how payment processing works",
    "payment gateway information",
    "payment system explanation",
    "transaction processing guide",

    "fraud protection information",
    "fraud prevention methods",
    "how fraud detection works",

    "account security information",
    "account access instructions",
    "guide to login process",
    "how to reset account password"

        "information about refund rules",
    "refund rule explanation",
    "refund policy information",

    "transaction limit information",
    "explain transaction limits",
    "transaction limit policy",

    "login instructions",
    "how to login guide",
    "steps to login"
]

def generate_non_complaints(n=5000):
    samples = []

    for _ in range(n):
        category = random.choice([
            greetings,
            conversation_phrases,
            informational_phrases,
            positive_phrases,
            short_messages,
            keyword_neutral
        ])

        sentence = random.choice(category)

        
        if random.random() > 0.5:
            sentence = random.choice(greetings) + ", " + sentence

        if random.random() > 0.7:
            sentence += "."

        if random.random() > 0.6:
            sentence = sentence + " please check"

        if random.random() > 0.8:
            sentence = "can you " + sentence    

        samples.append(sentence.lower())

    return samples

# Generate dataset
non_complaints = generate_non_complaints(5000)

# -----------------------------
# Balance Dataset
# -----------------------------

min_size = min(len(complaints), len(non_complaints))
complaints = complaints[:min_size]
non_complaints = non_complaints[:min_size]

# -----------------------------
# Create FastText Training File
# -----------------------------

os.makedirs("models", exist_ok=True)

train_file = "models/complaint_train.txt"

with open(train_file, "w", encoding="utf-8") as f:
    for text in complaints:
        f.write(f"__label__complaint {text.lower()}\n")

    for text in non_complaints:
        f.write(f"__label__noncomplaint {text.lower()}\n")

print("Training file created.")

# -----------------------------
# Train FastText Model
# -----------------------------

model = fasttext.train_supervised(
    input=train_file,
    epoch=40,
    lr=0.8,
    wordNgrams=3,
    dim=150,
    minn=2,
    maxn=5,
    loss="softmax"
)

model.save_model("models/fasttext_complaint_detector.bin")

print("Complaint Detector Model Saved Successfully.")