FROM python:3.11-slim
WORKDIR /app
ENV PORT=8080
COPY . .
RUN pip install --no-cache-dir -r requirements.txt || true
EXPOSE 8080
CMD ["sh","-c","python main.py"]
RUN npm install || true
