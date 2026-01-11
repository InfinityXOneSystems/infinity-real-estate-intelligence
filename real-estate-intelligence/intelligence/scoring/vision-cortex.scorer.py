def score(signal):
    urgency = signal.get("urgency", 0)
    novelty = signal.get("novelty", 0)
    confidence = signal.get("confidence", 0.5)

    score = (urgency * 0.5) + (novelty * 0.3) + (confidence * 0.2)
    return round(score, 4)
