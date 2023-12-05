import os
import sys

import openai
import time
from config import OPENAI_API_KEY

def run_assistant(question):
    openai.api_key = OPENAI_API_KEY
    try:
        run = openai.beta.threads.create_and_run(
            assistant_id="asst_uHIcUFcG983U24n1ohEvXk42",
            thread={
                "messages": [
                    {"role": "user", "content": question}
                ]
            }
        )
        return run
    except Exception as e:
        print(f"An error occurred: {e}")
        return None

def get_answer(run):
    # Access attributes directly from the 'run' object
    thread_id = run.thread_id
    run_id = run.id

    while run.status != "completed":
        time.sleep(1)  # Adding a delay to avoid too frequent polling
        try:
            run = openai.beta.threads.runs.retrieve(
                thread_id=thread_id,
                run_id=run_id
            )
        except Exception as e:
            print(f"An error occurred: {e}")
            return None, None

    try:
        messages = openai.beta.threads.messages.list(
            thread_id=thread_id
        )

        # Adjusting to the correct structure of messages
        annotations = messages.data[0].content[0].text.annotations
        message_content = messages.data[0].content[0].text.value
        return message_content
    except Exception as e:
        print(f"An error occurred while retrieving messages: {e}")
        return None, None


arg1 = sys.argv[1]
question = f"based on provided file, with the prefix of '{arg1}' in the prefix column, is '{arg1}' considered to be a good VOB based ont he Good Vob column? Answer the question with a Yes or No. If the record is not found answer as Unknown."
    
chat = run_assistant(question)
response = get_answer(chat)
print(response)