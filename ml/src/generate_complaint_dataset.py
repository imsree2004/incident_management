import os
import random


# -------- Explicit complaints (keyword based) --------

explicit_complaints = [
    "refund not received",
    "transaction failed and money deducted",
    "payment failed but amount deducted",
    "login not working",
    "account blocked without reason",
    "fraud transaction detected",
    "unauthorized transaction on my account",
    "money deducted but order not processed",
]

# -------- Implicit complaints (no obvious keywords) --------

implicit_complaints = [
    "my money disappeared after transaction",
    "the system took my money but nothing happened",
    "someone used my account yesterday",
    "there was activity on my account that I did not do",
    "my account shows actions I never performed",
    "the application keeps crashing when I try to use it",
    "the system freezes whenever I open it",
    "my account access stopped working",
    "the system refuses to let me access my profile",
    "the service charged me twice",
]

# -------- Neutral sentences (with same keywords) --------

neutral_sentences = [
    "explain refund policy",
    "how does payment processing work",
    "tell me about fraud protection",
    "how do I login to the system",
    "information about transaction limits",
    "refund policy details",
    "payment security information",
    "fraud prevention methods",
    "how to change account password",
    "guide to login process",
]

def generate_dataset():

    dataset = []

    # generate explicit complaints
    for _ in range(200):
        sentence = random.choice(explicit_complaints)
        dataset.append(f"__label__complaint {sentence}")

    # generate implicit complaints
    for _ in range(200):
        sentence = random.choice(implicit_complaints)
        dataset.append(f"__label__complaint {sentence}")

    # generate neutral sentences
    for _ in range(250):
        sentence = random.choice(neutral_sentences)
        dataset.append(f"__label__neutral {sentence}")

    random.shuffle(dataset)

    return dataset


def save_dataset():

    os.makedirs("ml/data", exist_ok=True)

    dataset = generate_dataset()

    with open("ml/data/complaint_dataset.txt", "w", encoding="utf-8") as f:
        for line in dataset:
            f.write(line + "\n")

    print("Dataset generated with", len(dataset), "samples")


if __name__ == "__main__":
    save_dataset()