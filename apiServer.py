import os
import asyncio
from google.adk.agents import Agent
from google.adk.models.lite_llm import LiteLlm
from google.adk.sessions import InMemorySessionService
from google.adk.runners import Runner
from google.genai import types # For creating message Content/Parts
import warnings
# Ignore all warnings
warnings.filterwarnings("ignore")

import logging
logging.basicConfig(level=logging.ERROR)

# @title Configure API Keys 


# Gemini API Key (Get from Google AI Studio: https://aistudio.google.com/app/apikey)
#   macOS/Linux: export GOOGLE_API_KEY="AIza...your_real_key..."
#   Windows:     setx GOOGLE_API_KEY "AIza...your_real_key..."

# Configure ADK to use API keys directly (not Vertex AI for this multi-model setup)
os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"

# --- Verify Keys (Optional Check) ---
print("API Keys Set:")
if os.environ.get("GOOGLE_API_KEY"):
    print("Google API Key set: Yes")
else:
    print("Google API Key set: No")

#name the model
modelGemini = "gemini-2.5-flash"


# @title Define the Path Finder tool
def getPrompt(website: str) -> dict:
    """ Provides a step by step guide on how to navigate through a website.
    
    Ar:
    """

def get_weather(city: str) -> dict:
    """Retrieves the current weather report for a specified city.

    Args:
        city (str): The name of the city (e.g., "New York", "London", "Tokyo").

    Returns:
        dict: A dictionary containing the weather information.
              Includes a 'status' key ('success' or 'error').
              If 'success', includes a 'report' key with weather details.
              If 'error', includes an 'error_message' key.
    """
    print(f"--- Tool: get_weather called for city: {city} ---") # Log tool execution
    city_normalized = city.lower().replace(" ", "") # Basic normalization

    # Mock weather data
    mock_weather_db = {
        "newyork": {"status": "success", "report": "The weather in New York is sunny with a temperature of 25°C."},
        "london": {"status": "success", "report": "It's cloudy in London with a temperature of 15°C."},
        "tokyo": {"status": "success", "report": "Tokyo is experiencing light rain and a temperature of 18°C."},
    }

    if city_normalized in mock_weather_db:
        return mock_weather_db[city_normalized]
    else:
        return {"status": "error", "error_message": f"Sorry, I don't have weather information for '{city}'."}

# Example tool usage (optional test)
print(get_weather("New York"))
print(get_weather("Paris"))

# @title Define the Weather Agent
# Use one of the model constants defined earlier
agentModel = modelGemini # Starting with Gemini

weather_agent = Agent(
    name="weather_agent_v1",
    model=agentModel, # Can be a string for Gemini or a LiteLlm object
    description="Provides weather information for specific cities.",
    instruction="You are a helpful weather assistant. "
                "When the user asks for the weather in a specific city, "
                "use the 'get_weather' tool to find the information. "
                "If the tool returns an error, inform the user politely. "
                "If the tool is successful, present the weather report clearly.",
    tools=[get_weather], # Pass the function directly
)

print(f"Agent '{weather_agent.name}' created using model '{agentModel}'.")
