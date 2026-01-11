FROM python:3.11-slim
WORKDIR /app
ENV PORT=8080
RUN pip install flask
COPY app.py .
EXPOSE 8080
CMD ["sh","-c","python app.py"]
