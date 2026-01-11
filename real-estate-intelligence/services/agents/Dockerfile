FROM python:3.11-slim
WORKDIR /app
RUN pip install requests
COPY main.py .
ENV PORT=8080
EXPOSE 8080
CMD ["sh","-c","python main.py"]
