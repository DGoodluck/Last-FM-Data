FROM python:3.10-slim

WORKDIR /app

ENV FLASK_APP=server.py

COPY ./requirements.txt .

RUN pip install -r requirements.txt

COPY . .

CMD [ "python", "server.py" ]