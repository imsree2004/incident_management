import sys
import json
from transformers import pipeline

# Load model once
generator = pipeline("text-generation", model="distilgpt2")

def generate_ai_response(text):
    prompt = f"""
Customer Complaint:
{text}

Provide a professional and helpful response with clear steps:
"""

    result = generator(
        prompt,
        max_length=200,
        num_return_sequences=1,
        do_sample=True,
        temperature=0.7
    )

    generated = result[0]["generated_text"]
    response = generated.replace(prompt, "").strip()

    return response

if __name__ == "__main__":
    complaint_text = sys.argv[1]
    output = generate_ai_response(complaint_text)

    print(json.dumps({
        "response": output
    }))
