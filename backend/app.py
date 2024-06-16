import os
import time
import re
import requests
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
import torch

app = Flask(__name__)
CORS(app)  # Enable CORS

polygon_api_key = 'L4UpQeptdTZhC94xjP7W9laT_JL0WXZl'

# Initialize the NLI model
classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")

# Load tokenizer and model from Hugging Face Model Hub
tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
model = AutoModelForCausalLM.from_pretrained("distilgpt2")

# Define the candidate labels
candidate_labels = ['bearish', 'neutral', 'bullish']

# Function to fetch news articles from Polygon.io within the given date range
def fetch_news(company, start_date, end_date, num_news_per_day):
    all_articles = []
    current_date = start_date
    while current_date <= end_date:
        next_date = current_date + timedelta(days=1)
        url = f"https://api.polygon.io/v2/reference/news?ticker={company}&published_utc.gte={current_date.strftime('%Y-%m-%d')}&published_utc.lte={next_date.strftime('%Y-%m-%d')}&sort=published_utc&limit={num_news_per_day}&apiKey={polygon_api_key}"
        response = requests.get(url)
        response.raise_for_status()
        articles = response.json().get('results', [])
        print(f"Fetched {len(articles)} articles for {company} on {current_date.strftime('%Y-%m-%d')}")  # Debugging line
        all_articles.extend(articles)
        current_date = next_date
    return all_articles

# Function to check if a company has news articles within the given date range
def has_news(company, start_date, end_date):
    url = f"https://api.polygon.io/v2/reference/news?ticker={company}&published_utc.gte={start_date.strftime('%Y-%m-%d')}&published_utc.lte={end_date.strftime('%Y-%m-%d')}&sort=published_utc&limit=1&apiKey={polygon_api_key}"
    response = requests.get(url)
    response.raise_for_status()
    articles = response.json().get('results', [])
    return len(articles) > 0

# Function to truncate the description to a maximum length
def truncate_description(description, max_length=1024):
    if description and len(description) > max_length:
        return description[:max_length] + '...'
    return description

def generate_response(prompt):
    start_time = time.time()  # Start time measurement

    # Tokenize the input prompt
    inputs = tokenizer(prompt, return_tensors="pt")

    # Generate a response from the model
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_length=4096,  # Maximum length of the generated response
            num_return_sequences=1,  # Number of responses to generate
            no_repeat_ngram_size=2,  # Avoid repeating the same n-gram
            early_stopping=True  # Stop early when end-of-sentence is reached
        )

    # Decode the generated tokens to get the response text
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Remove the prompt from the response if it exists
    if response.startswith(prompt):
        response = response[len(prompt):].strip()

    # Measure the generation time
    generation_time = time.time() - start_time  # Calculate elapsed time

    return response, generation_time

# Endpoint to fetch the list of companies
@app.route('/companies', methods=['GET'])
def get_companies():
    url = f"https://api.polygon.io/v3/reference/tickers?active=true&sort=ticker&order=asc&limit=1000&apiKey={polygon_api_key}"
    response = requests.get(url)
    response.raise_for_status()
    tickers = response.json().get('results', [])
    companies = [{'value': ticker['ticker'], 'label': ticker['name']} for ticker in tickers]
    print(f"Fetched {len(companies)} companies")  # Debugging line
    return jsonify(companies)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        print('Received data:', data)  # Debugging line
        companies = data.get('companies', [])
        start_date = datetime.strptime(data.get('start_date', ''), '%Y-%m-%d')
        end_date = datetime.strptime(data.get('end_date', ''), '%Y-%m-%d')
        num_news_per_day = int(data.get('num_news', 3))

        if not companies or not start_date or not end_date:
            return jsonify({'error': 'Companies, start_date, and end_date are required'}), 400

        news_data = []

        for company in companies:
            if not has_news(company, start_date, end_date):
                print(f"No news found for {company} between {start_date} and {end_date}")
                continue

            articles = fetch_news(company, start_date, end_date, num_news_per_day)
            for article in articles:
                title = article.get('title')
                if title == '[Removed]':
                    continue

                # Validate if the news is related to the company
                relevance_result = classifier(title, [company], multi_label=False)
                relevance_score = relevance_result['scores'][0]
                print(f"Relevance score for {title} (company {company}): {relevance_score}")  # Debugging line

                classification_result = classifier(title, candidate_labels, multi_label=False)
                sentiment = classification_result['labels'][0]
                score = classification_result['scores'][0]
                news_data.append({
                    'company': company,
                    'date': article.get('published_utc'),
                    'title': title,
                    'description': truncate_description(article.get('description')),
                    'sentiment': sentiment,
                    'score': score,
                    'relevance_score': relevance_score
                })

        print(f"Total news data: {len(news_data)} items")  # Debugging line

        return jsonify({'news_data': news_data})
    except Exception as e:
        print('Error:', str(e))  # Debugging line
        return jsonify({'error': str(e)}), 500

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.json
        print('Received generation data:', data)  # Debugging line
        user_prompt = data.get('prompt', '')

        if not user_prompt:
            return jsonify({'error': 'User prompt is required'}), 400

        prompt, generation_time = generate_response(user_prompt)
        return jsonify({'Prompt': prompt, 'generation_time': generation_time})
    except Exception as e:
        print('Error:', str(e))  # Debugging line
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
