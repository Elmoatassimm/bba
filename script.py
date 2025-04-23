import argparse
import logging
import os
import sys

from google import genai
from google.api_core.exceptions import GoogleAPIError

# ── Logging configuration ────────────────────────────────────────────────────
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)

file_handler = logging.FileHandler("upload_pdf.log")
file_handler.setLevel(logging.DEBUG)

formatter = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")
console_handler.setFormatter(formatter)
file_handler.setFormatter(formatter)

logger.addHandler(console_handler)
logger.addHandler(file_handler)


def upload_pdf(pdf_path: str, client: genai.Client):
    """
    Upload a PDF via the Gemini Files API and return the uploaded_file object.
    """
    if not os.path.isfile(pdf_path):
        logger.error(f"The file '{pdf_path}' does not exist.")
        raise FileNotFoundError(f"The file '{pdf_path}' does not exist.")

    try:
        logger.info(f"Uploading PDF file: {pdf_path}")
        uploaded = client.files.upload(file=pdf_path)
        logger.info(f"Upload successful. File name: {uploaded.name}")
        return uploaded
    except GoogleAPIError as e:
        logger.error(f"Google API Error during upload: {e}")
        raise
    except Exception:
        logger.exception("Unexpected error during PDF upload.")
        raise


def generate_with_file(
    uploaded_file, prompt: str, client: genai.Client, model_name: str
) -> str:
    """
    Generate text from an uploaded file + prompt in one API call.
    """
    try:
        logger.info(
            f"Generating with model={model_name!r}, file={uploaded_file.name}, prompt={prompt!r}"
        )
        resp = client.models.generate_content(
            model=model_name,
            contents=[prompt, uploaded_file],
        )
        logger.info("Generation successful.")
        return resp.text
    except GoogleAPIError as e:
        logger.error(f"Google API Error during generation: {e}")
        raise
    except Exception:
        logger.exception("Unexpected error during generation.")
        raise


def parse_args():
    p = argparse.ArgumentParser(
        description="Upload a PDF to Gemini Files API and generate a response or quiz."
    )
    p.add_argument("--pdf-path", required=True, help="Path to your PDF file.")
    p.add_argument("--api-key", required=True, help="Your Gemini API key.")
    p.add_argument(
        "--prompt", help="The prompt to pair with your uploaded PDF."
    )
    p.add_argument(
        "--quiz", action="store_true", help="Generate a quiz based on the PDF."
    )
    p.add_argument(
        "--num-questions", type=int, default=5, help="Number of quiz questions to generate."
    )
    p.add_argument(
        "--model",
        default="gemini-2.0-flash-exp",  # experimental Flash model
        help="Model to use (e.g. gemini-2.0-flash-exp)",
    )
    return p.parse_args()


def main():
    args = parse_args()

    if not args.quiz and not args.prompt:
        logger.error("--prompt is required when --quiz is not set.")
        sys.exit(1)

    # ── Instantiate client with API key (no genai.configure) ────────────────
    client = genai.Client(api_key=args.api_key)

    try:
        uploaded = upload_pdf(args.pdf_path, client)
        
        if args.quiz:
            prompt = f"Generate {args.num_questions} multiple-choice quiz questions based on the content of this PDF. Each question should have four options and indicate the correct answer."
        else:
            prompt = args.prompt
        
        output = generate_with_file(uploaded, prompt, client, args.model)
        print(output)
    except Exception as e:
        logger.error(f"Failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()