import time
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Load tokenizer and model from Hugging Face Model Hub
tokenizer = AutoTokenizer.from_pretrained("distilgpt2")
model = AutoModelForCausalLM.from_pretrained("distilgpt2")

def generate_response(prompt):
    start_time = time.time()  # Start time measurement

    # Tokenize the input prompt
    inputs = tokenizer(prompt, return_tensors="pt")

    # Generate a response from the model
    with torch.no_grad():
        outputs = model.generate(
            inputs.input_ids,
            max_length=1024,  # Maximum length of the generated response
            num_return_sequences=1,  # Number of responses to generate
            no_repeat_ngram_size=2,  # Avoid repeating the same n-gram
            early_stopping=True  # Stop early when end-of-sentence is reached
        )

    # Decode the generated tokens to get the response text
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Measure the generation time
    generation_time = time.time() - start_time  # Calculate elapsed time

    return response, generation_time

def chat():
    print("Chatbot is ready. Type 'exit' to end the conversation.")
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            print("Chatbot: Goodbye!")
            break
        response, generation_time = generate_response(user_input)
        print(f"Chatbot: {response} (Generated in {generation_time:.2f} seconds)")

if __name__ == "__main__":
    chat()
