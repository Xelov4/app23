Gemini API quickstart

This quickstart shows you how to install your SDK of choice and then make your first Gemini API request.

Python JavaScript REST Go

Make your first request
Get a Gemini API key in Google AI Studio

Use the generateContent method to send a request to the Gemini API.


curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$YOUR_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a few words"
          }
        ]
      }
    ]
  }'


  Gemini models

2.5 Pro 

Our most powerful thinking model with maximum response accuracy and state-of-the-art performance

Input audio, images, video, and text, get text responses
Tackle difficult problems, analyze large databases, and more
Best for complex coding, reasoning, and multimodal understanding
2.0 Flash 

Our newest multimodal model, with next generation features and improved capabilities

Input audio, images, video, and text, get text responses
Generate code and images, extract data, analyze files, generate graphs, and more
Low latency, enhanced performance, built to power agentic experiences
2.0 Flash-Lite

A Gemini 2.0 Flash model optimized for cost efficiency and low latency

Input audio, images, video, and text, get text responses
Outperforms 1.5 Flash on the majority of benchmarks
A 1 million token context window and multimodal input, like Flash 2.0
Model variants
The Gemini API offers different models that are optimized for specific use cases. Here's a brief overview of Gemini variants that are available:

Model variant	Input(s)	Output	Optimized for
Gemini 2.5 Pro Preview
gemini-2.5-pro-preview-03-25	Audio, images, videos, and text	Text	Enhanced thinking and reasoning, multimodal understanding, advanced coding, and more
Gemini 2.0 Flash
gemini-2.0-flash	Audio, images, videos, and text	Text, images (experimental), and audio (coming soon)	Next generation features, speed, thinking, realtime streaming, and multimodal generation
Gemini 2.0 Flash-Lite
gemini-2.0-flash-lite	Audio, images, videos, and text	Text	Cost efficiency and low latency
Gemini 1.5 Flash
gemini-1.5-flash	Audio, images, videos, and text	Text	Fast and versatile performance across a diverse variety of tasks
Gemini 1.5 Flash-8B
gemini-1.5-flash-8b	Audio, images, videos, and text	Text	High volume and lower intelligence tasks
Gemini 1.5 Pro
gemini-1.5-pro	Audio, images, videos, and text	Text	Complex reasoning tasks requiring more intelligence
Gemini Embedding
gemini-embedding-exp	Text	Text embeddings	Measuring the relatedness of text strings
Imagen 3
imagen-3.0-generate-002	Text	Images	Our most advanced image generation model
You can view the rate limits for each model on the rate limits page.

Gemini 2.5 Pro Preview
Gemini 2.5 Pro is our state-of-the-art thinking model, capable of reasoning over complex problems in code, math, and STEM, as well as analyzing large datasets, codebases, and documents using long context.

Try in Google AI Studio

Model details
Property	Description
Model code	Paid: gemini-2.5-pro-preview-03-25, Experimental: gemini-2.5-pro-exp-03-25
Supported data types
Inputs

Audio, images, video, and text

Output

Text

Token limits[*]
Input token limit

1,048,576

Output token limit

65,536

Capabilities
Structured outputs

Supported

Caching

Not supported

Tuning

Not supported

Function calling

Supported

Code execution

Supported

Search grounding

Supported

Image generation

Not supported

Native tool use

Supported

Audio generation

Not supported

Live API

Not supported

Thinking

Supported

Versions	
Read the model version patterns for more details.
Preview: gemini-2.5-pro-preview-03-25
Experimental: gemini-2.5-pro-exp-03-25
Latest update	March 2025
Knowledge cutoff	January 2025
Gemini 2.0 Flash
Gemini 2.0 Flash delivers next-gen features and improved capabilities, including superior speed, native tool use, multimodal generation, and a 1M token context window.

Try in Google AI Studio

Model details
Property	Description
Model code	models/gemini-2.0-flash
Supported data types
Inputs

Audio, images, video, and text

Output

Text, images (experimental), and audio(coming soon)

Token limits[*]
Input token limit

1,048,576

Output token limit

8,192

Capabilities
Structured outputs

Supported

Caching

Coming soon

Tuning

Not supported

Function calling

Supported

Code execution

Supported

Search

Supported

Image generation

Experimental

Native tool use

Supported

Audio generation

Coming soon

Live API

Experimental

Thinking

Experimental

Versions	
Read the model version patterns for more details.
Latest: gemini-2.0-flash
Stable: gemini-2.0-flash-001
Experimental: gemini-2.0-flash-exp and gemini-2.0-flash-exp-image-generation point to the same underlying model
Experimental: gemini-2.0-flash-thinking-exp-01-21
Latest update	February 2025
Knowledge cutoff	August 2024
Gemini 2.0 Flash-Lite
A Gemini 2.0 Flash model optimized for cost efficiency and low latency.

Try in Google AI Studio

Model details
Property	Description
Model code	models/gemini-2.0-flash-lite
Supported data types
Inputs

Audio, images, video, and text

Output

Text

Token limits[*]
Input token limit

1,048,576

Output token limit

8,192

Capabilities
Structured outputs

Supported

Caching

Not supported

Tuning

Not supported

Function calling

Not supported

Code execution

Not supported

Search

Not supported

Image generation

Not supported

Native tool use

Not supported

Audio generation

Not supported

Live API

Not supported

Versions	
Read the model version patterns for more details.
Latest: gemini-2.0-flash-lite
Stable: gemini-2.0-flash-lite-001
Latest update	February 2025
Knowledge cutoff	August 2024
Gemini 1.5 Flash
Gemini 1.5 Flash is a fast and versatile multimodal model for scaling across diverse tasks.

Try in Google AI Studio

Model details
Property	Description
Model code	models/gemini-1.5-flash
Supported data types
Inputs

Audio, images, video, and text

Output

Text

Token limits[*]
Input token limit

1,048,576

Output token limit

8,192

Audio/visual specs
Maximum number of images per prompt

3,600

Maximum video length

1 hour

Maximum audio length

Approximately 9.5 hours

Capabilities
System instructions

Supported

JSON mode

Supported

JSON schema

Supported

Adjustable safety settings

Supported

Caching

Supported

Tuning

Supported

Function calling

Supported

Code execution

Supported

Live API

Not supported

Versions	
Read the model version patterns for more details.
Latest: gemini-1.5-flash-latest
Latest stable: gemini-1.5-flash
Stable:
gemini-1.5-flash-001
gemini-1.5-flash-002
Latest update	September 2024
Gemini 1.5 Flash-8B
Gemini 1.5 Flash-8B is a small model designed for lower intelligence tasks.

Try in Google AI Studio

Model details
Property	Description
Model code	models/gemini-1.5-flash-8b
Supported data types
Inputs

Audio, images, video, and text

Output

Text

Token limits[*]
Input token limit

1,048,576

Output token limit

8,192

Audio/visual specs
Maximum number of images per prompt

3,600

Maximum video length

1 hour

Maximum audio length

Approximately 9.5 hours

Capabilities
System instructions

Supported

JSON mode

Supported

JSON schema

Supported

Adjustable safety settings

Supported

Caching

Supported

Tuning

Supported

Function calling

Supported

Code execution

Supported

Live API

Not supported

Versions	
Read the model version patterns for more details.
Latest: gemini-1.5-flash-8b-latest
Latest stable: gemini-1.5-flash-8b
Stable:
gemini-1.5-flash-8b-001
Latest update	October 2024
Gemini 1.5 Pro
Try Gemini 2.0 Pro Experimental, our most advanced Gemini model to date.

Gemini 1.5 Pro is a mid-size multimodal model that is optimized for a wide-range of reasoning tasks. 1.5 Pro can process large amounts of data at once, including 2 hours of video, 19 hours of audio, codebases with 60,000 lines of code, or 2,000 pages of text.

Try in Google AI Studio

Model details
Property	Description
Model code	models/gemini-1.5-pro
Supported data types
Inputs

Audio, images, video, and text

Output

Text

Token limits[*]
Input token limit

2,097,152

Output token limit

8,192

Audio/visual specs
Maximum number of images per prompt

7,200

Maximum video length

2 hours

Maximum audio length

Approximately 19 hours

Capabilities
System instructions

Supported

JSON mode

Supported

JSON schema

Supported

Adjustable safety settings

Supported

Caching

Supported

Tuning

Not supported

Function calling

Supported

Code execution

Supported

Live API

Not supported

Versions	
Read the model version patterns for more details.
Latest: gemini-1.5-pro-latest
Latest stable: gemini-1.5-pro
Stable:
gemini-1.5-pro-001
gemini-1.5-pro-002
Latest update	September 2024
Imagen 3
Imagen 3 is our highest quality text-to-image model, capable of generating images with even better detail, richer lighting and fewer distracting artifacts than our previous models.

Model details
Property	Description
Model code
Gemini API

imagen-3.0-generate-002

Supported data types
Input

Text

Output

Images

Token limits[*]
Input token limit

N/A

Output images

Up to to 4

Latest update	February 2025
Gemini Embedding Experimental
Gemini embedding achieves a SOTA performance across many key dimensions including code, multi-lingual, and retrieval.

Model details
Property	Description
Model code
Gemini API

gemini-embedding-exp-03-07

Supported data types
Input

Text

Output

Text embeddings

Token limits[*]
Input token limit

8,192

Output dimension size

Elastic, supports: 3072, 1536, or 768

Latest update	March 2025
Text Embedding and Embedding
Text Embedding
Try our new experimental Gemini embedding model which achieves state-of-the-art performance.

Text embeddings are used to measure the relatedness of strings and are widely used in many AI applications.

text-embedding-004 achieves a stronger retrieval performance and outperforms existing models with comparable dimensions, on the standard MTEB embedding benchmarks.

Model details
Property	Description
Model code
Gemini API

models/text-embedding-004

Supported data types
Input

Text

Output

Text embeddings

Token limits[*]
Input token limit

2,048

Output dimension size

768

Rate limits[**]	1,500 requests per minute
Adjustable safety settings	Not supported
Latest update	April 2024
Embedding
Note: Text Embedding is the newer version of the Embedding model. If you're creating a new project, use Text Embedding.
You can use the Embedding model to generate text embeddings for input text.

The Embedding model is optimized for creating embeddings with 768 dimensions for text of up to 2,048 tokens.

Embedding model details
Property	Description
Model code	models/embedding-001
Supported data types
Input

Text

Output

Text embeddings

Token limits[*]
Input token limit

2,048

Output dimension size

768

Rate limits[**]	1,500 requests per minute
Adjustable safety settings	Not supported
Latest update	December 2023
AQA
You can use the AQA model to perform Attributed Question-Answering (AQA)–related tasks over a document, corpus, or a set of passages. The AQA model returns answers to questions that are grounded in provided sources, along with estimating answerable probability.

Model details
Property	Description
Model code	models/aqa
Supported data types
Input

Text

Output

Text

Supported language	English
Token limits[*]
Input token limit

7,168

Output token limit

1,024

Rate limits[**]	1,500 requests per minute
Adjustable safety settings	Supported
Latest update	December 2023
See the examples to explore the capabilities of these model variations.

[*] A token is equivalent to about 4 characters for Gemini models. 100 tokens are about 60-80 English words.

Model version name patterns
Gemini models are available in either preview or stable versions. In your code, you can use one of the following model name formats to specify which model and version you want to use.

Latest: Points to the cutting-edge version of the model for a specified generation and variation. The underlying model is updated regularly and might be a preview version. Only exploratory testing apps and prototypes should use this alias.

To specify the latest version, use the following pattern: <model>-<generation>-<variation>-latest. For example, gemini-1.0-pro-latest.

Latest stable: Points to the most recent stable version released for the specified model generation and variation.

To specify the latest stable version, use the following pattern: <model>-<generation>-<variation>. For example, gemini-1.0-pro.

Stable: Points to a specific stable model. Stable models usually don't change. Most production apps should use a specific stable model.

To specify a stable version, use the following pattern: <model>-<generation>-<variation>-<version>. For example, gemini-1.0-pro-001.

Experimental: Points to an experimental model which may not be suitable for production use. We release experimental models to gather feedback and get our latest updates into the hands of developers quickly.

To specify an experimental version, use the following pattern: <model>-<generation>-<variation>-<version>. For example, gemini-2.0-pro-exp-02-05.

Experimental models
In addition to the production ready models, the Gemini API offers experimental models which may not be suitable for production use.

We release experimental models to gather feedback, get our latest updates into the hands of developers quickly, and highlight the pace of innovation happening at Google. What we learn from experimental launches informs how we release models more widely. An experimental model can be swapped for another without prior notice. We don't guarantee that an experimental model will become a stable model in the future.

Previous experimental models
As new versions or stable releases become available, we remove and replace experimental models. You can find the previous experimental models we released in the following section along with the replacement version:

Model code	Base model	Replacement version
gemini-2.0-pro-exp-02-05	Gemini 2.0 Pro Experimental	gemini-2.5-pro-exp-03-25
gemini-2.0-flash-exp	Gemini 2.0 Flash	gemini-2.0-flash
gemini-exp-1206	Gemini 2.0 Pro	gemini-2.0-pro-exp-02-05
gemini-2.0-flash-thinking-exp-1219	Gemini 2.0 Flash Thinking	gemini-2.0-flash-thinking-exp-01-21
gemini-exp-1121	Gemini	gemini-exp-1206
gemini-exp-1114	Gemini	gemini-exp-1206
gemini-1.5-pro-exp-0827	Gemini 1.5 Pro	gemini-exp-1206
gemini-1.5-pro-exp-0801	Gemini 1.5 Pro	gemini-exp-1206
gemini-1.5-flash-8b-exp-0924	Gemini 1.5 Flash-8B	gemini-1.5-flash-8b
gemini-1.5-flash-8b-exp-0827	Gemini 1.5 Flash-8B	gemini-1.5-flash-8b
Supported languages
Gemini models are trained to work with the following languages:

Arabic (ar)
Bengali (bn)
Bulgarian (bg)
Chinese simplified and traditional (zh)
Croatian (hr)
Czech (cs)
Danish (da)
Dutch (nl)
English (en)
Estonian (et)
Finnish (fi)
French (fr)
German (de)
Greek (el)
Hebrew (iw)
Hindi (hi)
Hungarian (hu)
Indonesian (id)
Italian (it)
Japanese (ja)
Korean (ko)
Latvian (lv)
Lithuanian (lt)
Norwegian (no)
Polish (pl)
Portuguese (pt)
Romanian (ro)
Russian (ru)
Serbian (sr)
Slovak (sk)
Slovenian (sl)
Spanish (es)
Swahili (sw)
Swedish (sv)
Thai (th)
Turkish (tr)
Ukrainian (uk)
Vietnamese (vi)

Text generation

The Gemini API can generate text output in response to various inputs, including text, images, video, and audio. This guide shows you how to generate text using text and image inputs. It also covers streaming, chat, and system instructions.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Text input
The simplest way to generate text using the Gemini API is to provide the model with a single text-only input, as shown in this example:

Python
JavaScript
Go
REST

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "How does AI work?"
          }
        ]
      }
    ]
  }'
Image input
The Gemini API supports multimodal inputs that combine text and media files. The following example shows how to generate text from text and image input:

Python
JavaScript
Go
REST

# Use a temporary file to hold the base64 encoded image data
TEMP_B64=$(mktemp)
trap 'rm -f "$TEMP_B64"' EXIT
base64 $B64FLAGS $IMG_PATH > "$TEMP_B64"

# Use a temporary file to hold the JSON payload
TEMP_JSON=$(mktemp)
trap 'rm -f "$TEMP_JSON"' EXIT

cat > "$TEMP_JSON" << EOF
{
  "contents": [
    {
      "parts": [
        {
          "text": "Tell me about this instrument"
        },
        {
          "inline_data": {
            "mime_type": "image/jpeg",
            "data": "$(cat "$TEMP_B64")"
          }
        }
      ]
    }
  ]
}
EOF

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -X POST \
  -d "@$TEMP_JSON"
Streaming output
By default, the model returns a response after completing the entire text generation process. You can achieve faster interactions by using streaming to return instances of GenerateContentResponse as they're generated.

Python
JavaScript
Go
REST

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}" \
  -H 'Content-Type: application/json' \
  --no-buffer \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works"
          }
        ]
      }
    ]
  }'
Multi-turn conversations
The Gemini SDK lets you collect multiple rounds of questions and responses into a chat. The chat format enables users to step incrementally toward answers and to get help with multipart problems. This SDK implementation of chat provides an interface to keep track of conversation history, but behind the scenes it uses the same generateContent method to create the response.

The following code example shows a basic chat implementation:

Python
JavaScript
Go
REST

curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Hello"
          }
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "text": "Great to meet you. What would you like to know?"
          }
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "text": "I have two dogs in my house. How many paws are in my house?"
          }
        ]
      }
    ]
  }'
You can also use streaming with chat, as shown in the following example:

Python
JavaScript
Go
REST

curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=$GEMINI_API_KEY \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "role": "user",
        "parts": [
          {
            "text": "Hello"
          }
        ]
      },
      {
        "role": "model",
        "parts": [
          {
            "text": "Great to meet you. What would you like to know?"
          }
        ]
      },
      {
        "role": "user",
        "parts": [
          {
            "text": "I have two dogs in my house. How many paws are in my house?"
          }
        ]
      }
    ]
  }'
Configuration parameters
Every prompt you send to the model includes parameters that control how the model generates responses. You can configure these parameters, or let the model use the default options.

The following example shows how to configure model parameters:

Python
JavaScript
Go
REST

curl https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY \
  -H 'Content-Type: application/json' \
  -X POST \
  -d '{
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works"
          }
        ]
      }
    ],
    "generationConfig": {
      "stopSequences": [
        "Title"
      ],
      "temperature": 1.0,
      "maxOutputTokens": 800,
      "topP": 0.8,
      "topK": 10
    }
  }'
Here are some of the model parameters you can configure. (Naming conventions vary by programming language.)

stopSequences: Specifies the set of character sequences (up to 5) that will stop output generation. If specified, the API will stop at the first appearance of a stop_sequence. The stop sequence won't be included as part of the response.
temperature: Controls the randomness of the output. Use higher values for more creative responses, and lower values for more deterministic responses. Values can range from [0.0, 2.0].
maxOutputTokens: Sets the maximum number of tokens to include in a candidate.
topP: Changes how the model selects tokens for output. Tokens are selected from the most to least probable until the sum of their probabilities equals the topP value. The default topP value is 0.95.
topK: Changes how the model selects tokens for output. A topK of 1 means the selected token is the most probable among all the tokens in the model's vocabulary, while a topK of 3 means that the next token is selected from among the 3 most probable using the temperature. Tokens are further filtered based on topP with the final token selected using temperature sampling.
System instructions
System instructions let you steer the behavior of a model based on your specific use case. When you provide system instructions, you give the model additional context to help it understand the task and generate more customized responses. The model should adhere to the system instructions over the full interaction with the user, enabling you to specify product-level behavior separate from the prompts provided by end users.

You can set system instructions when you initialize your model:

Python
JavaScript
Go
REST

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "system_instruction": {
      "parts": [
        {
          "text": "You are a cat. Your name is Neko."
        }
      ]
    },
    "contents": [
      {
        "parts": [
          {
            "text": "Hello there"
          }
        ]
      }
    ]
  }'
Then, you can send requests to the model as usual.

Supported models
The entire Gemini family of models supports text generation. To learn more about the models and their capabilities, see Models.

Prompting tips
For basic text generation use cases, your prompt might not need to include any output examples, system instructions, or formatting information. This is a zero-shot approach. For some use cases, a one-shot or few-shot prompt might produce output that's more aligned with user expectations. In some cases, you might also want to provide system instructions to help the model understand the task or follow specific guidelines.

Generate images

The Gemini API supports image generation using Gemini 2.0 Flash Experimental and using Imagen 3. This guide helps you get started with both models.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Generate images using Gemini
Gemini 2.0 Flash Experimental supports the ability to output text and inline images. This lets you use Gemini to conversationally edit images or generate outputs with interwoven text (for example, generating a blog post with text and images in a single turn). All generated images include a SynthID watermark, and images in Google AI Studio include a visible watermark as well.

Note: Make sure to include responseModalities: ["Text", "Image"] in your generation configuration for text and image output with gemini-2.0-flash-exp-image-generation. Image only is not allowed.
The following example shows how to use Gemini 2.0 to generate text-and-image output:

Python
JavaScript
REST

curl -s -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [
        {"text": "Hi, can you create a 3d rendered image of a pig with wings and a top hat flying over a happy futuristic scifi city with lots of greenery?"}
      ]
    }],
    "generationConfig":{"responseModalities":["Text","Image"]}
  }' \
  | grep -o '"data": "[^"]*"' \
  | cut -d'"' -f4 \
  | base64 --decode > gemini-native-image.png
AI-generated image of a fantastical flying pig
AI-generated image of a fantastical flying pig
Depending on the prompt and context, Gemini will generate content in different modes (text to image, text to image and text, etc.). Here are some examples:

Text to image
Example prompt: "Generate an image of the Eiffel tower with fireworks in the background."
Text to image(s) and text (interleaved)
Example prompt: "Generate an illustrated recipe for a paella."
Image(s) and text to image(s) and text (interleaved)
Example prompt: (With an image of a furnished room) "What other color sofas would work in my space? can you update the image?"
Image editing (text and image to image)
Example prompt: "Edit this image to make it look like a cartoon"
Example prompt: [image of a cat] + [image of a pillow] + "Create a cross stitch of my cat on this pillow."
Multi-turn image editing (chat)
Example prompts: [upload an image of a blue car.] "Turn this car into a convertible." "Now change the color to yellow."
Image editing with Gemini
To perform image editing, add an image as input. The following example demonstrats uploading base64 encoded images. For multiple images and larger payloads, check the image input section.

Python
JavaScript
REST

IMG_PATH=/path/to/your/image1.jpeg

if [[ "$(base64 --version 2>&1)" = *"FreeBSD"* ]]; then
  B64FLAGS="--input"
else
  B64FLAGS="-w0"
fi

IMG_BASE64=$(base64 "$B64FLAGS" "$IMG_PATH" 2>&1)

curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=$GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -d "{
      \"contents\": [{
        \"parts\":[
            {\"text\": \"'Hi, This is a picture of me. Can you add a llama next to me\"},
            {
              \"inline_data\": {
                \"mime_type\":\"image/jpeg\",
                \"data\": \"$IMG_BASE64\"
              }
            }
        ]
      }],
      \"generationConfig\": {\"responseModalities\": [\"Text\", \"Image\"]}
    }"  \
  | grep -o '"data": "[^"]*"' \
  | cut -d'"' -f4 \
  | base64 --decode > gemini-edited-image.png
Limitations
For best performance, use the following languages: EN, es-MX, ja-JP, zh-CN, hi-IN.
Image generation does not support audio or video inputs.
Image generation may not always trigger:
The model may output text only. Try asking for image outputs explicitly (e.g. "generate an image", "provide images as you go along", "update the image").
The model may stop generating partway through. Try again or try a different prompt.
When generating text for an image, Gemini works best if you first generate the text and then ask for an image with the text.
Choose a model
Which model should you use to generate images? It depends on your use case.

Gemini 2.0 is best for producing contextually relevant images, blending text + images, incorporating world knowledge, and reasoning about images. You can use it to create accurate, contextually relevant visuals embedded in long text sequences. You can also edit images conversationally, using natural language, while maintaining context throughout the conversation.

If image quality is your top priority, then Imagen 3 is a better choice. Imagen 3 excels at photorealism, artistic detail, and specific artistic styles like impressionism or anime. Imagen 3 is also a good choice for specialized image editing tasks like updating product backgrounds, upscaling images, and infusing branding and style into visuals. You can use Imagen 3 to create logos or other branded product designs.

Generate images using Imagen 3
The Gemini API provides access to Imagen 3, Google's highest quality text-to-image model, featuring a number of new and improved capabilities. Imagen 3 can do the following:

Generate images with better detail, richer lighting, and fewer distracting artifacts than previous models
Understand prompts written in natural language
Generate images in a wide range of formats and styles
Render text more effectively than previous models
Note: Imagen 3 is only available on the Paid Tier and always includes a SynthID watermark.
Python
JavaScript
REST

curl -X POST \
    "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=GEMINI_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "instances": [
          {
            "prompt": "Robot holding a red skateboard"
          }
        ],
        "parameters": {
          "sampleCount": 4
        }
      }'
AI-generated image of two fuzzy bunnies in the kitchen
AI-generated image of two fuzzy bunnies in the kitchen
Imagen supports English only prompts at this time and the following parameters:

Imagen model parameters
(Naming conventions vary by programming language.)

numberOfImages: The number of images to generate, from 1 to 4 (inclusive). The default is 4.
aspectRatio: Changes the aspect ratio of the generated image. Supported values are "1:1", "3:4", "4:3", "9:16", and "16:9". The default is "1:1".
personGeneration: Allow the model to generate images of people. The following values are supported:
"DONT_ALLOW": Block generation of images of people.
"ALLOW_ADULT": Generate images of adults, but not children. This is the default.

Gemini can respond to prompts about audio. For example, Gemini can:

Describe, summarize, or answer questions about audio content.
Provide a transcription of the audio.
Provide answers or a transcription about a specific segment of the audio.
Note: You can't generate audio output with the Gemini API.
This guide demonstrates different ways to interact with audio files and audio content using the Gemini API.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Supported audio formats
Gemini supports the following audio format MIME types:

WAV - audio/wav
MP3 - audio/mp3
AIFF - audio/aiff
AAC - audio/aac
OGG Vorbis - audio/ogg
FLAC - audio/flac
Technical details about audio
Gemini imposes the following rules on audio:

Gemini represents each second of audio as 32 tokens; for example, one minute of audio is represented as 1,920 tokens.
Gemini can only infer responses to English-language speech.
Gemini can "understand" non-speech components, such as birdsong or sirens.
The maximum supported length of audio data in a single prompt is 9.5 hours. Gemini doesn't limit the number of audio files in a single prompt; however, the total combined length of all audio files in a single prompt cannot exceed 9.5 hours.
Gemini downsamples audio files to a 16 Kbps data resolution.
If the audio source contains multiple channels, Gemini combines those channels down to a single channel.
Make an audio file available to Gemini
You can make an audio file available to Gemini in either of the following ways:

Upload the audio file prior to making the prompt request.
Provide the audio file as inline data to the prompt request.
Upload an audio file and generate content
You can use the File API to upload an audio file of any size. Always use the File API when the total request size (including the files, text prompt, system instructions, etc.) is larger than 20 MB.

Note: The File API lets you store up to 20 GB of files per project, with a per-file maximum size of 2 GB. Files are stored for 48 hours. They can be accessed in that period with your API key, but cannot be downloaded from the API. The File API is available at no cost in all regions where the Gemini API is available.
Call media.upload to upload a file using the File API. The following code uploads an audio file and then uses the file in a call to models.generateContent.


MIME_TYPE=$(file -b --mime-type "${AUDIO_PATH}")
NUM_BYTES=$(wc -c < "${AUDIO_PATH}")
DISPLAY_NAME=AUDIO

tmp_header_file=upload-header.tmp

# Initial resumable request defining metadata.
# The upload url is in the response headers dump them to a file.
curl "${BASE_URL}/upload/v1beta/files?key=${GEMINI_API_KEY}" \
  -D upload-header.tmp \
  -H "X-Goog-Upload-Protocol: resumable" \
  -H "X-Goog-Upload-Command: start" \
  -H "X-Goog-Upload-Header-Content-Length: ${NUM_BYTES}" \
  -H "X-Goog-Upload-Header-Content-Type: ${MIME_TYPE}" \
  -H "Content-Type: application/json" \
  -d "{'file': {'display_name': '${DISPLAY_NAME}'}}" 2> /dev/null

upload_url=$(grep -i "x-goog-upload-url: " "${tmp_header_file}" | cut -d" " -f2 | tr -d "\r")
rm "${tmp_header_file}"

# Upload the actual bytes.
curl "${upload_url}" \
  -H "Content-Length: ${NUM_BYTES}" \
  -H "X-Goog-Upload-Offset: 0" \
  -H "X-Goog-Upload-Command: upload, finalize" \
  --data-binary "@${AUDIO_PATH}" 2> /dev/null > file_info.json

file_uri=$(jq ".file.uri" file_info.json)
echo file_uri=$file_uri

# Now generate content using that file
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY" \
    -H 'Content-Type: application/json' \
    -X POST \
    -d '{
      "contents": [{
        "parts":[
          {"text": "Describe this audio clip"},
          {"file_data":{"mime_type": "audio/mp3", "file_uri": '$file_uri'}}]
        }]
       }' 2> /dev/null > response.json

cat response.json
echo

jq ".candidates[].content.parts[].text" response.json

Get metadata for a file
You can verify the API successfully stored the uploaded file and get its metadata by calling files.get.


name=$(jq ".file.name" file_info.json)
# Get the file of interest to check state
curl https://generativelanguage.googleapis.com/v1beta/files/$name > file_info.json
# Print some information about the file you got
name=$(jq ".file.name" file_info.json)
echo name=$name
file_uri=$(jq ".file.uri" file_info.json)
echo file_uri=$file_uri

List uploaded files
You can upload multiple audio files (and other kinds of files). The following code generates a list of all the files uploaded:


echo "My files: "

curl "https://generativelanguage.googleapis.com/v1beta/files?key=$GEMINI_API_KEY"

Delete uploaded files
Files are automatically deleted after 48 hours. Optionally, you can manually delete an uploaded file. For example:


curl --request "DELETE" https://generativelanguage.googleapis.com/v1beta/files/$name?key=$GEMINI_API_KEY

What's next
This guide shows how to upload audio files using the File API and then generate text outputs from audio inputs. To learn more, see the following resources:

File prompting strategies: The Gemini API supports prompting with text, image, audio, and video data, also known as multimodal prompting.
System instructions: System instructions let you steer the behavior of the model based on your specific needs and use cases.
Safety guidance: Sometimes generative AI models produce unexpected outputs, such as outputs that are inaccurate, biased, or offensive. Post-processing and human evaluation are essential to limit the risk of harm from such outputs.

Long context

Gemini 2.0 Flash and Gemini 1.5 Flash come with a 1-million-token context window, and Gemini 1.5 Pro comes with a 2-million-token context window. Historically, large language models (LLMs) were significantly limited by the amount of text (or tokens) that could be passed to the model at one time. The Gemini 1.5 long context window, with near-perfect retrieval (>99%), unlocks many new use cases and developer paradigms.

The code you already use for cases like text generation or multimodal inputs will work out of the box with long context.

Throughout this guide, you briefly explore the basics of the context window, how developers should think about long context, various real world use cases for long context, and ways to optimize the usage of long context.

What is a context window?
The basic way you use the Gemini models is by passing information (context) to the model, which will subsequently generate a response. An analogy for the context window is short term memory. There is a limited amount of information that can be stored in someone's short term memory, and the same is true for generative models.

You can read more about how models work under the hood in our generative models guide.

Getting started with long context
Most generative models created in the last few years were only capable of processing 8,000 tokens at a time. Newer models pushed this further by accepting 32,000 tokens or 128,000 tokens. Gemini 1.5 is the first model capable of accepting 1 million tokens, and now 2 million tokens with Gemini 1.5 Pro.

In practice, 1 million tokens would look like:

50,000 lines of code (with the standard 80 characters per line)
All the text messages you have sent in the last 5 years
8 average length English novels
Transcripts of over 200 average length podcast episodes
Even though the models can take in more and more context, much of the conventional wisdom about using large language models assumes this inherent limitation on the model, which as of 2024, is no longer the case.

Some common strategies to handle the limitation of small context windows included:

Arbitrarily dropping old messages / text from the context window as new text comes in
Summarizing previous content and replacing it with the summary when the context window gets close to being full
Using RAG with semantic search to move data out of the context window and into a vector database
Using deterministic or generative filters to remove certain text / characters from prompts to save tokens
While many of these are still relevant in certain cases, the default place to start is now just putting all of the tokens into the context window. Because Gemini models were purpose-built with a long context window, they are much more capable of in-context learning. For example, with only instructional materials (a 500-page reference grammar, a dictionary, and ≈ 400 extra parallel sentences) all provided in context, Gemini 1.5 Pro and Gemini 1.5 Flash are capable of learning to translate from English to Kalamang— a Papuan language with fewer than 200 speakers and therefore almost no online presence—with quality similar to a person who learned from the same materials.

This example underscores how you can start to think about what is possible with long context and the in-context learning capabilities of Gemini models.

Long context use cases
While the standard use case for most generative models is still text input, the Gemini 1.5 model family enables a new paradigm of multimodal use cases. These models can natively understand text, video, audio, and images. They are accompanied by the Gemini API that takes in multimodal file types for convenience.

Long form text
Text has proved to be the layer of intelligence underpinning much of the momentum around LLMs. As mentioned earlier, much of the practical limitation of LLMs was because of not having a large enough context window to do certain tasks. This led to the rapid adoption of retrieval augmented generation (RAG) and other techniques which dynamically provide the model with relevant contextual information. Now, with larger and larger context windows (currently up to 2 million on Gemini 1.5 Pro), there are new techniques becoming available which unlock new use cases.

Some emerging and standard use cases for text based long context include:

Summarizing large corpuses of text
Previous summarization options with smaller context models would require a sliding window or another technique to keep state of previous sections as new tokens are passed to the model
Question and answering
Historically this was only possible with RAG given the limited amount of context and models' factual recall being low
Agentic workflows
Text is the underpinning of how agents keep state of what they have done and what they need to do; not having enough information about the world and the agent's goal is a limitation on the reliability of agents
Many-shot in-context learning is one of the most unique capabilities unlocked by long context models. Research has shown that taking the common "single shot" or "multi-shot" example paradigm, where the model is presented with one or a few examples of a task, and scaling that up to hundreds, thousands, or even hundreds of thousands of examples, can lead to novel model capabilities. This many-shot approach has also been shown to perform similarly to models which were fine-tuned for a specific task. For use cases where a Gemini model's performance is not yet sufficient for a production rollout, you can try the many-shot approach. As you might explore later in the long context optimization section, context caching makes this type of high input token workload much more economically feasible and even lower latency in some cases.

Long form video
Video content's utility has long been constrained by the lack of accessibility of the medium itself. It was hard to skim the content, transcripts often failed to capture the nuance of a video, and most tools don't process image, text, and audio together. With Gemini 1.5, the long-context text capabilities translate to the ability to reason and answer questions about multimodal inputs with sustained performance. Gemini 1.5 Flash, when tested on the needle in a video haystack problem with 1M tokens, obtained >99.8% recall of the video in the context window, and 1.5 Pro reached state of the art performance on the Video-MME benchmark.

Some emerging and standard use cases for video long context include:

Video question and answering
Video memory, as shown with Google's Project Astra
Video captioning
Video recommendation systems, by enriching existing metadata with new multimodal understanding
Video customization, by looking at a corpus of data and associated video metadata and then removing parts of videos that are not relevant to the viewer
Video content moderation
Real-time video processing
When working with videos, it is important to consider how the videos are processed into tokens, which affects billing and usage limits. You can learn more about prompting with video files in the Prompting guide.

Long form audio
The Gemini 1.5 models were the first natively multimodal large language models that could understand audio. Historically, the typical developer workflow would involve stringing together multiple domain specific models, like a speech-to-text model and a text-to-text model, in order to process audio. This led to additional latency required by performing multiple round-trip requests and decreased performance usually attributed to disconnected architectures of the multiple model setup.

On standard audio-haystack evaluations, Gemini 1.5 Pro is able to find the hidden audio in 100% of the tests and Gemini 1.5 Flash is able to find it in 98.7% of the tests. Gemini 1.5 Flash accepts up to 9.5 hours of audio in a single request and Gemini 1.5 Pro can accept up to 19 hours of audio using the 2-million-token context window. Further, on a test set of 15-minute audio clips, Gemini 1.5 Pro archives a word error rate (WER) of ~5.5%, much lower than even specialized speech-to-text models, without the added complexity of extra input segmentation and pre-processing.

Some emerging and standard use cases for audio context include:

Real-time transcription and translation
Podcast / video question and answering
Meeting transcription and summarization
Voice assistants
You can learn more about prompting with audio files in the Prompting guide.

Long context optimizations
The primary optimization when working with long context and the Gemini 1.5 models is to use context caching. Beyond the previous impossibility of processing lots of tokens in a single request, the other main constraint was the cost. If you have a "chat with your data" app where a user uploads 10 PDFs, a video, and some work documents, you would historically have to work with a more complex retrieval augmented generation (RAG) tool / framework in order to process these requests and pay a significant amount for tokens moved into the context window. Now, you can cache the files the user uploads and pay to store them on a per hour basis. The input / output cost per request with Gemini 1.5 Flash for example is ~4x less than the standard input / output cost, so if the user chats with their data enough, it becomes a huge cost saving for you as the developer.

Long context limitations
In various sections of this guide, we talked about how Gemini 1.5 models achieve high performance across various needle-in-a-haystack retrieval evals. These tests consider the most basic setup, where you have a single needle you are looking for. In cases where you might have multiple "needles" or specific pieces of information you are looking for, the model does not perform with the same accuracy. Performance can vary to a wide degree depending on the context. This is important to consider as there is an inherent tradeoff between getting the right information retrieved and cost. You can get ~99% on a single query, but you have to pay the input token cost every time you send that query. So for 100 pieces of information to be retrieved, if you needed 99% performance, you would likely need to send 100 requests. This is a good example of where context caching can significantly reduce the cost associated with using Gemini models while keeping the performance high.

FAQs
Do I lose model performance when I add more tokens to a query?
Generally, if you don't need tokens to be passed to the model, it is best to avoid passing them. However, if you have a large chunk of tokens with some information and want to ask questions about that information, the model is highly capable of extracting that information (up to 99% accuracy in many cases).

How does Gemini 1.5 Pro perform on the standard needle-in-a-haystack test?
Gemini 1.5 Pro achieves 100% recall up to 530k tokens and >99.7% recall up to 1M tokens.

How can I lower my cost with long-context queries?
If you have a similar set of tokens / context that you want to re-use many times, context caching can help reduce the costs associated with asking questions about that information.

How can I get access to the 2-million-token context window?
All developers now have access to the 2-million-token context window with Gemini 1.5 Pro.

Does the context length affect the model latency?
There is some fixed amount of latency in any given request, regardless of the size, but generally longer queries will have higher latency (time to first token).

Do the long context capabilities differ between Gemini 1.5 Flash and Gemini 1.5 Pro?
Yes, some of the numbers were mentioned in different sections of this guide, but generally Gemini 1.5 Pro is more performant on most long context use cases.

Grounding with Google Search

Python JavaScript REST

The Grounding with Google Search feature in the Gemini API and AI Studio can be used to improve the accuracy and recency of responses from the model. In addition to more factual responses, when Grounding with Google Search is enabled, the Gemini API returns grounding sources (in-line supporting links) and Google Search Suggestions along with the response content. The Search Suggestions point users to the search results corresponding to the grounded response.

This guide will help you get started with Grounding with Google Search.

Before you begin
Before calling the Gemini API, ensure you have your SDK of choice installed, and a Gemini API key configured and ready to use.

Configure Search Grounding
Starting with Gemini 2.0, Google Search is available as a tool. This means that the model can decide when to use Google Search. The following example shows how to configure Search as a tool.


curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GOOGLE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
      "contents": [
          {
              "parts": [
                  {"text": "What is the current Google stock price?"}
              ]
          }
      ],
      "tools": [
          {
              "google_search": {}
          }
      ]
  }' > result.json

cat result.json
The Search-as-a-tool functionality also enables multi-turn searches and multi-tool queries (for example, combining Grounding with Google Search and code execution).

Search as a tool enables complex prompts and workflows that require planning, reasoning, and thinking:

Grounding to enhance factuality and recency and provide more accurate answers
Retrieving artifacts from the web to do further analysis on
Finding relevant images, videos, or other media to assist in multimodal reasoning or generation tasks
Coding, technical troubleshooting, and other specialized tasks
Finding region-specific information or assisting in translating content accurately
Finding relevant websites for further browsing
Grounding with Google Search works with all available languages when doing text prompts. On the paid tier of the Gemini Developer API, you can get 1,500 Grounding with Google Search queries per day for free, with additional queries billed at the standard $35 per 1,000 queries (cf. pricing).

You can learn more by trying the Search tool notebook.

Google Search Suggestions
To use Grounding with Google Search, you have to display Google Search Suggestions, which are suggested queries included in the metadata of the grounded response. To learn more about the display requirements, see Use Google Search Suggestions.

Google Search retrieval
Note: Google Search retrieval is only compatible with Gemini 1.5 models. For Gemini 2.0 models, you should use Search as a tool.
The following example shows to configure a model to use Google Search retrieval:


echo '{"contents":
          [{"parts": [{"text": "What is the current Google stock price?"}]}],
      "tools": [{"google_search_retrieval": {
                  "dynamic_retrieval_config": {
                    "mode": "MODE_DYNAMIC",
                    "dynamic_threshold": 1,
                }
            }
        }
    ]
}' > request.json

curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=$GEMINI_API_KEY" \
-H "Content-Type: application/json" \
-d  @request.json > response.json

cat response.json
The mode and dynamic_threshold settings let you control the behavior of dynamic retrieval, giving you additional control over when to use Grounding with Google Search.

Dynamic retrieval
Note: Dynamic retrieval is only compatible with Gemini 1.5 Flash. For Gemini 2.0, you should use Search as a tool, as shown above.
Some queries are likely to benefit more from Grounding with Google Search than others. The dynamic retrieval feature gives you additional control over when to use Grounding with Google Search.

If the dynamic retrieval mode is unspecified, Grounding with Google Search is always triggered. If the mode is set to dynamic, the model decides when to use grounding based on a threshold that you can configure. The threshold is a floating-point value in the range [0,1] and defaults to 0.3. If the threshold value is 0, the response is always grounded with Google Search; if it's 1, it never is.

How dynamic retrieval works
You can use dynamic retrieval in your request to choose when to turn on Grounding with Google Search. This is useful when the prompt doesn't require an answer grounded in Google Search and the model can provide an answer based on its own knowledge without grounding. This helps you manage latency, quality, and cost more effectively.

Before you invoke the dynamic retrieval configuration in your request, understand the following terminology:

Prediction score: When you request a grounded answer, Gemini assigns a prediction score to the prompt. The prediction score is a floating point value in the range [0,1]. Its value depends on whether the prompt can benefit from grounding the answer with the most up-to-date information from Google Search. Thus, if a prompt requires an answer grounded in the most recent facts on the web, it has a higher prediction score. A prompt for which a model-generated answer is sufficient has a lower prediction score.

Here are examples of some prompts and their prediction scores.

Note: The prediction scores are assigned by Gemini and can vary over time depending on several factors.
Prompt	Prediction score	Comment
"Write a poem about peonies"	0.13	The model can rely on its knowledge and the answer doesn't need grounding.
"Suggest a toy for a 2yo child"	0.36	The model can rely on its knowledge and the answer doesn't need grounding.
"Can you give a recipe for an asian-inspired guacamole?"	0.55	Google Search can give a grounded answer, but grounding isn't strictly required; the model knowledge might be sufficient.
"What's Agent Builder? How is grounding billed in Agent Builder?"	0.72	Requires Google Search to generate a well-grounded answer.
"Who won the latest F1 grand prix?"	0.97	Requires Google Search to generate a well-grounded answer.
Threshold: In your API request, you can specify a dynamic retrieval configuration with a threshold. The threshold is a floating point value in the range [0,1] and defaults to 0.3. If the threshold value is zero, the response is always grounded with Google Search. For all other values of threshold, the following is applicable:

If the prediction score is greater than or equal to the threshold, the answer is grounded with Google Search. A lower threshold implies that more prompts have responses that are generated using Grounding with Google Search.
If the prediction score is less than the threshold, the model might still generate the answer, but it isn't grounded with Google Search.
To learn how to set the dynamic retrieval threshold using an SDK or the REST API, see the appropriate code example.

To find a good threshold that suits your business needs, you can create a representative set of queries that you expect to encounter. Then you can sort the queries according to the prediction score in the response and select a good threshold for your use case.

A grounded response
If your prompt successfully grounds to Google Search, the response will include groundingMetadata. A grounded response might look something like this (parts of the response have been omitted for brevity):


{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "Carlos Alcaraz won the Gentlemen's Singles title at the 2024 Wimbledon Championships. He defeated Novak Djokovic in the final, winning his second consecutive Wimbledon title and fourth Grand Slam title overall. \n"
          }
        ],
        "role": "model"
      },
      ...
      "groundingMetadata": {
        "searchEntryPoint": {
          "renderedContent": "\u003cstyle\u003e\n.container {\n  align-items: center;\n  border-radius: 8px;\n  display: flex;\n  font-family: Google Sans, Roboto, sans-serif;\n  font-size: 14px;\n  line-height: 20px;\n  padding: 8px 12px;\n}\n.chip {\n  display: inline-block;\n  border: solid 1px;\n  border-radius: 16px;\n  min-width: 14px;\n  padding: 5px 16px;\n  text-align: center;\n  user-select: none;\n  margin: 0 8px;\n  -webkit-tap-highlight-color: transparent;\n}\n.carousel {\n  overflow: auto;\n  scrollbar-width: none;\n  white-space: nowrap;\n  margin-right: -12px;\n}\n.headline {\n  display: flex;\n  margin-right: 4px;\n}\n.gradient-container {\n  position: relative;\n}\n.gradient {\n  position: absolute;\n  transform: translate(3px, -9px);\n  height: 36px;\n  width: 9px;\n}\n@media (prefers-color-scheme: light) {\n  .container {\n    background-color: #fafafa;\n    box-shadow: 0 0 0 1px #0000000f;\n  }\n  .headline-label {\n    color: #1f1f1f;\n  }\n  .chip {\n    background-color: #ffffff;\n    border-color: #d2d2d2;\n    color: #5e5e5e;\n    text-decoration: none;\n  }\n  .chip:hover {\n    background-color: #f2f2f2;\n  }\n  .chip:focus {\n    background-color: #f2f2f2;\n  }\n  .chip:active {\n    background-color: #d8d8d8;\n    border-color: #b6b6b6;\n  }\n  .logo-dark {\n    display: none;\n  }\n  .gradient {\n    background: linear-gradient(90deg, #fafafa 15%, #fafafa00 100%);\n  }\n}\n@media (prefers-color-scheme: dark) {\n  .container {\n    background-color: #1f1f1f;\n    box-shadow: 0 0 0 1px #ffffff26;\n  }\n  .headline-label {\n    color: #fff;\n  }\n  .chip {\n    background-color: #2c2c2c;\n    border-color: #3c4043;\n    color: #fff;\n    text-decoration: none;\n  }\n  .chip:hover {\n    background-color: #353536;\n  }\n  .chip:focus {\n    background-color: #353536;\n  }\n  .chip:active {\n    background-color: #464849;\n    border-color: #53575b;\n  }\n  .logo-light {\n    display: none;\n  }\n  .gradient {\n    background: linear-gradient(90deg, #1f1f1f 15%, #1f1f1f00 100%);\n  }\n}\n\u003c/style\u003e\n\u003cdiv class=\"container\"\u003e\n  \u003cdiv class=\"headline\"\u003e\n    \u003csvg class=\"logo-light\" width=\"18\" height=\"18\" viewBox=\"9 9 35 35\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"\u003e\n      \u003cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M42.8622 27.0064C42.8622 25.7839 42.7525 24.6084 42.5487 23.4799H26.3109V30.1568H35.5897C35.1821 32.3041 33.9596 34.1222 32.1258 35.3448V39.6864H37.7213C40.9814 36.677 42.8622 32.2571 42.8622 27.0064V27.0064Z\" fill=\"#4285F4\"/\u003e\n      \u003cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M26.3109 43.8555C30.9659 43.8555 34.8687 42.3195 37.7213 39.6863L32.1258 35.3447C30.5898 36.3792 28.6306 37.0061 26.3109 37.0061C21.8282 37.0061 18.0195 33.9811 16.6559 29.906H10.9194V34.3573C13.7563 39.9841 19.5712 43.8555 26.3109 43.8555V43.8555Z\" fill=\"#34A853\"/\u003e\n      \u003cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M16.6559 29.8904C16.3111 28.8559 16.1074 27.7588 16.1074 26.6146C16.1074 25.4704 16.3111 24.3733 16.6559 23.3388V18.8875H10.9194C9.74388 21.2072 9.06992 23.8247 9.06992 26.6146C9.06992 29.4045 9.74388 32.022 10.9194 34.3417L15.3864 30.8621L16.6559 29.8904V29.8904Z\" fill=\"#FBBC05\"/\u003e\n      \u003cpath fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M26.3109 16.2386C28.85 16.2386 31.107 17.1164 32.9095 18.8091L37.8466 13.8719C34.853 11.082 30.9659 9.3736 26.3109 9.3736C19.5712 9.3736 13.7563 13.245 10.9194 18.8875L16.6559 23.3388C18.0195 19.2636 21.8282 16.2386 26.3109 16.2386V16.2386Z\" fill=\"#EA4335\"/\u003e\n    \u003c/svg\u003e\n    \u003csvg class=\"logo-dark\" width=\"18\" height=\"18\" viewBox=\"0 0 48 48\" xmlns=\"http://www.w3.org/2000/svg\"\u003e\n      \u003ccircle cx=\"24\" cy=\"23\" fill=\"#FFF\" r=\"22\"/\u003e\n      \u003cpath d=\"M33.76 34.26c2.75-2.56 4.49-6.37 4.49-11.26 0-.89-.08-1.84-.29-3H24.01v5.99h8.03c-.4 2.02-1.5 3.56-3.07 4.56v.75l3.91 2.97h.88z\" fill=\"#4285F4\"/\u003e\n      \u003cpath d=\"M15.58 25.77A8.845 8.845 0 0 0 24 31.86c1.92 0 3.62-.46 4.97-1.31l4.79 3.71C31.14 36.7 27.65 38 24 38c-5.93 0-11.01-3.4-13.45-8.36l.17-1.01 4.06-2.85h.8z\" fill=\"#34A853\"/\u003e\n      \u003cpath d=\"M15.59 20.21a8.864 8.864 0 0 0 0 5.58l-5.03 3.86c-.98-2-1.53-4.25-1.53-6.64 0-2.39.55-4.64 1.53-6.64l1-.22 3.81 2.98.22 1.08z\" fill=\"#FBBC05\"/\u003e\n      \u003cpath d=\"M24 14.14c2.11 0 4.02.75 5.52 1.98l4.36-4.36C31.22 9.43 27.81 8 24 8c-5.93 0-11.01 3.4-13.45 8.36l5.03 3.85A8.86 8.86 0 0 1 24 14.14z\" fill=\"#EA4335\"/\u003e\n    \u003c/svg\u003e\n    \u003cdiv class=\"gradient-container\"\u003e\u003cdiv class=\"gradient\"\u003e\u003c/div\u003e\u003c/div\u003e\n  \u003c/div\u003e\n  \u003cdiv class=\"carousel\"\u003e\n    \u003ca class=\"chip\" href=\"https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4x8Epe-gzpwRBvp7o3RZh2m1ygq1EHktn0OWCtvTXjad4bb1zSuqfJd6OEuZZ9_SXZ_P2SvCpJM7NaFfQfiZs6064MeqXego0vSbV9LlAZoxTdbxWK1hFeqTG6kA13YJf7Fbu1SqBYM0cFM4zo0G_sD9NKYWcOCQMvDLDEJFhjrC9DM_QobBIAMq-gWN95G5tvt6_z6EuPN8QY=\"\u003ewho won wimbledon 2024\u003c/a\u003e\n  \u003c/div\u003e\n\u003c/div\u003e\n"
        },
        "groundingChunks": [
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4whET1ta3sDETZvcicd8FeNe4z0VuduVsxrT677KQRp2rYghXI0VpfYbIMVI3THcTuMwggRCbFXS_wVvW0UmGzMe9h2fyrkvsnQPJyikJasNIbjJLPX0StM4Bd694-ZVle56MmRA4YiUvwSqad1w6O2opmWnw==",
              "title": "wikipedia.org"
            }
          },
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4wR1M-9-yMPUr_KdHlnoAmQ8ZX90DtQ_vDYTjtP2oR5RH4tRP04uqKPLmesvo64BBkPeYLC2EpVDxv9ngO3S1fs2xh-e78fY4m0GAtgNlahUkm_tBm_sih5kFPc7ill9u2uwesNGUkwrQlmP2mfWNU5lMMr23HGktr6t0sV0QYlzQq7odVoBxYWlQ_sqWFH",
              "title": "wikipedia.org"
            }
          },
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4wsDmROzbP-tmt8GdwCW_pqISTZ4IRbBuoaMyaHfcQg8WW-yKRQQvMDTPAuLxJh-8_U8_iw_6JKFbQ8M9oVYtaFdWFK4gOtL4RrC9Jyqc5BNpuxp6uLEKgL5-9TggtNvO97PyCfziDFXPsxylwI1HcfQdrz3Jy7ZdOL4XM-S5rC0lF2S3VWW0IEAEtS7WX861meBYVjIuuF_mIr3spYPqWLhbAY2Spj-4_ba8DjRvmevIFUhRuESTKvBfmpxNSM",
              "title": "cbssports.com"
            }
          },
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4yzjLkorHiUKjhOPkWaZ9b4cO-cLG-02vlEl6xTBjMUjyhK04qSIclAa7heR41JQ6AAVXmNdS3WDrLOV4Wli-iezyzW8QPQ4vgnmO_egdsuxhcGk3-Fp8-yfqNLvgXFwY5mPo6QRhvplOFv0_x9mAcka18QuAXtj0SPvJfZhUEgYLCtCrucDS5XFc5HmRBcG1tqFdKSE1ihnp8KLdaWMhrUQI21hHS9",
              "title": "jagranjosh.com"
            }
          },
          {
            "web": {
              "uri": "https://vertexaisearch.cloud.google.com/grounding-api-redirect/AWhgh4y9L4oeNGWCatFz63b9PpP3ys-Wi_zwnkUT5ji9lY7gPUJQcsmmE87q88GSdZqzcx5nZG9usot5FYk2yK-FAGvCRE6JsUQJB_W11_kJU2HVV1BTPiZ4SAgm8XDFIxpCZXnXmEx5HUfRqQm_zav7CvS2qjA2x3__qLME6Jy7R5oza1C5_aqjQu422le9CaigThS5bvJoMo-ZGcXdBUCj2CqoXNVjMA==",
              "title": "apnews.com"
            }
          }
        ],
        "groundingSupports": [
          {
            "segment": {
              "endIndex": 85,
              "text": "Carlos Alcaraz won the Gentlemen's Singles title at the 2024 Wimbledon Championships."
            },
            "groundingChunkIndices": [
              0,
              1,
              2,
              3
            ],
            "confidenceScores": [
              0.97380733,
              0.97380733,
              0.97380733,
              0.97380733
            ]
          },
          {
            "segment": {
              "startIndex": 86,
              "endIndex": 210,
              "text": "He defeated Novak Djokovic in the final, winning his second consecutive Wimbledon title and fourth Grand Slam title overall."
            },
            "groundingChunkIndices": [
              1,
              0,
              4
            ],
            "confidenceScores": [
              0.96145374,
              0.96145374,
              0.96145374
            ]
          }
        ],
        "webSearchQueries": [
          "who won wimbledon 2024"
        ]
      }
    }
  ],
  ...
}
If the response doesn't include groundingMetadata, this means the response wasn't successfully grounded. There are several reasons this could happen, including low source relevance or incomplete information within the model response.

When a grounded result is generated, the metadata contains URIs that redirect to the publishers of the content that was used to generate the grounded result. These URIs contain the vertexaisearch subdomain, as in this truncated example: https://vertexaisearch.cloud.google.com/grounding-api-redirect/.... The metadata also contains the publishers' domains. The provided URIs remain accessible for 30 days after the grounded result is generated.

Important: The provided URIs must be directly accessible by the end users and must not be queried programmatically through automated means. If automated access is detected, the grounded answer generation service might stop providing the redirection URIs.
The renderedContent field within searchEntryPoint is the provided code for implementing Google Search Suggestions. See Use Google Search Suggestions to learn more.

Use Google Search Suggestions

To use Grounding with Google Search, you must enable Google Search Suggestions, which help users find search results corresponding to a grounded response.

Specifically, you need to display the search queries that are included in the grounded response's metadata. The response includes:

content: LLM generated response
webSearchQueries: The queries to be used for Google Search Suggestions
For example, in the following code snippet, Gemini responds to a search-grounded prompt which is asking about a type of tropical plant.


"predictions": [
  {
    "content": "Monstera is a type of vine that thrives in bright indirect light…",
    "groundingMetadata": {
      "webSearchQueries": ["What's a monstera?"],
    }
  }
]
You can take this output and display it by using Google Search Suggestions.

Requirements for Google Search Suggestions
Do:

Display the Search Suggestion exactly as provided without any modifications while complying with the Display Requirements.
Take users directly to the Google Search results page (SRP) when they interact with the Search Suggestion.
Don't:

Include any interstitial screens or additional steps between the user's tap and the display of the SRP.
Display any other search results or suggestions alongside the Search Suggestion or associated grounded LLM response.
Display requirements
Display the Search Suggestion exactly as provided and don't make any modifications to colors, fonts, or appearance. Ensure the Search Suggestion renders as specified in the following mocks, including for light and dark mode: mock Search Suggestion display

Whenever a grounded response is shown, its corresponding Google Search Suggestion should remain visible.

Branding: You must strictly follow Google's Guidelines for Third Party Use of Google Brand Features.

Google Search Suggestions should be at minimum the full width of the grounded response.

Behavior on tap
When a user taps the chip, they are taken directly to a Google Search results page (SRP) for the search term displayed in the chip. The SRP can open either within your in-app browser or in a separate browser app. It's important to not minimize, remove, or obstruct the SRP's display in any way. The following animated mockup illustrates the tap-to-SRP interaction.

user navigating to search results page

Code to implement a Google Search Suggestion
When you use the API to ground a response to search, the model response provides compliant HTML and CSS styling in the renderedContent field which you implement to display Search Suggestions in your application. To see an example of the API response, see the response section in Grounding with Google Search.

Note: The provided HTML and CSS provided in the API response automatically adapts to the user's device settings, displaying in either light or dark mode based on the user's preference indicated by @media(prefers-color-scheme).

System instructions
System instructions let you steer the behavior of a model based on your specific use case. When you provide system instructions, you give the model additional context to help it understand the task and generate more customized responses. The model should adhere to the system instructions over the full interaction with the user, enabling you to specify product-level behavior separate from the prompts provided by end users.

You can set system instructions when you initialize your model:

Python
JavaScript
Go
REST

curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$GEMINI_API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{
    "system_instruction": {
      "parts": [
        {
          "text": "You are a cat. Your name is Neko."
        }
      ]
    },
    "contents": [
      {
        "parts": [
          {
            "text": "Hello there"
          }
        ]
      }
    ]
  }'
Then, you can send requests to the model as usual.

Supported models
The entire Gemini family of models supports text generation. To learn more about the models and their capabilities, see Models.

Prompting tips
For basic text generation use cases, your prompt might not need to include any output examples, system instructions, or formatting information. This is a zero-shot approach. For some use cases, a one-shot or few-shot prompt might produce output that's more aligned with user expectations. In some cases, you might also want to provide system instructions to help the model understand the task or follow specific guidelines.