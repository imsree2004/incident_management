import random

# Subjects
subjects = [
    "I",
    "My account",
    "My payment",
    "The transaction",
    "The app",
    "The system"
]

# Problems
problems = [
    "is not working",
    "failed",
    "was declined",
    "is not responding",
    "was blocked",
    "is delayed"
]

# Actions / contexts
contexts = [
    "during payment",
    "while logging in",
    "when I tried to access my account",
    "after I made a transaction",
    "when I opened the app"
]

# Financial issues
financial_issues = [
    "money deducted but payment failed",
    "refund not received",
    "amount not credited",
    "double charged for the transaction",
    "payment reversal not processed",
    "incorrect deduction from my account"
]

# Security issues
security_issues = [
    "unauthorized transaction detected",
    "someone accessed my account",
    "fraud transaction happened on my account",
    "suspicious activity in my account"
]

# Access issues
access_issues = [
    "login not working",
    "unable to access my account",
    "account locked",
    "password reset not working"
]

# Urgency phrases
urgency_phrases = [
    "please resolve this quickly",
    "need help immediately",
    "please check this issue",
    "kindly fix this problem",
    ""
]

# Neutral / greeting sentences (to test complaint detector)
neutral_sentences = [
    "hello good morning",
    "thank you very much",
    "how are you today",
    "just checking my account",
    "everything is fine"
]


def generate_complaint():

    complaint_types = [
        "financial",
        "security",
        "access",
        "general"
    ]

    complaint_type = random.choice(complaint_types)

    if complaint_type == "financial":
        sentence = random.choice(financial_issues)

    elif complaint_type == "security":
        sentence = random.choice(security_issues)

    elif complaint_type == "access":
        sentence = random.choice(access_issues)

    else:
        subject = random.choice(subjects)
        problem = random.choice(problems)
        context = random.choice(contexts)
        sentence = f"{subject} {problem} {context}"

    urgency = random.choice(urgency_phrases)

    return f"{sentence} {urgency}".strip()


def generate_neutral():
    return random.choice(neutral_sentences)


def generate_dataset(n=100):

    dataset = []

    for _ in range(n):

        # 80% complaints, 20% neutral
        if random.random() < 0.8:
            dataset.append(generate_complaint())
        else:
            dataset.append(generate_neutral())

    return dataset


if __name__ == "__main__":

    complaints = generate_dataset(20)

    for c in complaints:
        print(c)