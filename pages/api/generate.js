import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const msg = req.body.msg || '';
  if (msg.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid message",
      }
    });
    return;
  }

  try {
    const request = {
      model: req.body.model,
      messages: splitTextToMessages(msg),
    };
    console.log("Sending request:");
    console.log(request);
    const completion = await openai.createChatCompletion(request);
    /*
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(animal),
      temperature: 0.6,
    });
    */
    console.log("Got response:");
    console.log(completion.data);
    let message = completion.data.choices[0].message;
    console.log("Message from '" + message.role + "':");
    console.log(message.content);
    res.status(200).json({ message });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function splitTextToMessages(text) {
  const lines = text.split('\n');
  const result = [];
  let currentMessage = null;

  for (const line of lines) {
    const isStartOfCommand = /^(\w+):/.test(line);

    if (isStartOfCommand) {
      const colonIndex = line.indexOf(':');
      const role = line.substring(0, colonIndex).trim();
      const content = line.substring(colonIndex + 1).trim();

      if (currentMessage) {
        result.push(cleanMessage(currentMessage));
      }
      currentMessage = { role, content };

    } else if (currentMessage) {
      if (currentMessage.content) {
        currentMessage.content += '\n' + line.trim();
      } else {
        currentMessage.content = line.trim();
      }
    }
  }

  if (currentMessage) {
    result.push(cleanMessage(currentMessage));
  }

  return result;
}

function cleanMessage(message) {
  message.content = message.content.trim();
  return message;
}

function generatePrompt_old(animal) {
  const capitalizedAnimal =
    animal[0].toUpperCase() + animal.slice(1).toLowerCase();
  return `Suggest three names for an animal that is a superhero.

Animal: Cat
Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
Animal: Dog
Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
Animal: ${capitalizedAnimal}
Names:`;
}
