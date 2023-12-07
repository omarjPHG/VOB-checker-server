import os
import sys
import time
import openai
from config import OPENAI_API_KEY

# Set the OpenAI API key globally
openai.api_key = OPENAI_API_KEY

def run_assistant_and_get_answer(question):
    try:
        # Create and run the assistant
        run = openai.beta.threads.create_and_run(
            assistant_id="asst_uHIcUFcG983U24n1ohEvXk42",
            thread={"messages": [{"role": "user", "content": question}]}
        )

        thread_id = run.thread_id
        run_id = run.id

        # Wait for the run to complete
        while True:
            time.sleep(1)  # Adding a delay to avoid too frequent polling
            run = openai.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run_id)
            if run.status == "completed":
                break

        # Retrieve messages
        messages = openai.beta.threads.messages.list(thread_id=thread_id)
        message_content = messages.data[0].content[0].text.value
        print(message_content)
        return message_content

    except Exception as e:
        print(f"An error occurred: {e}")
        return None

# Ensure that the script is provided with an argument
if len(sys.argv) > 1:
    arg1 = sys.argv[1]
    question = f"Based on the information given to you. I have a prefix of {arg1}. If you find the prefix in the prefix column, i wanted to know if the prefix is a good vob or bad vob. You can determine if a prefix is good or bad by referencing the GOOD VOB column. For the same prefix, I want to know if the prefix was admitted or not admitted based on the admitted column for the specific prefix. If there is more than 1 instance of the exact prefix, reference the most recent prefix based on the date column. if the prefix does not show up in the document data, please set the vob evaluation as unknown and admitted evaluation as unknown. If the admitted column is empty please determine admitted to be unknown. Convert all variations of yes to a simply 'yes'. Convert all variations of no to a simple 'no'.  Please return the results in the form of a json object with the keys of vob and a value of yes, no, or unknown. The second key in the object would be admitted with a value of yes, no, or unknown."

    response = run_assistant_and_get_answer(question)
    print(response)
else:
    print("No argument provided. Please provide a prefix as an argument.")
