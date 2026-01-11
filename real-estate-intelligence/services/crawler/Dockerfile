FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt || true
ENV PORT=8080
EXPOSE 8080
CMD ["sh","-c","python main.py"]
