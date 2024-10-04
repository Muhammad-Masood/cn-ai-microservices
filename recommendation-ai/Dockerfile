FROM python:3.11.5-slim

WORKDIR /app

RUN pip install poetry

COPY pyproject.toml ./

RUN poetry install --no-root

COPY . .

ENV GROQ_API_KEY=${GROQ_API_KEY} BROKER_INSTANCE=${BROKER_INSTANCE}

CMD ["poetry", "run", "uvicorn", "index:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]