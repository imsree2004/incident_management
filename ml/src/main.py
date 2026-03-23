from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from predict_fasttext import predict_complaint

app = FastAPI(title="Incident Management AI API", description="API for predicting complaint intent, department, and severity.")

class ComplaintRequest(BaseModel):
    text: str

@app.post("/predict")
def predict(request: ComplaintRequest):
    try:
        result = predict_complaint(request.text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "active", "message": "AI Model API is running."}
