import os
import time
import string
import secrets
import os
import time
import string
import secrets
from pydantic import BaseModel

import matplotlib.pyplot as plt
from fastapi import FastAPI, UploadFile

from facade import ModelFacade

from dotenv import load_dotenv

import boto3
from botocore.exceptions import NoCredentialsError

from typing import List

load_dotenv()

app = FastAPI()

s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
)

aws_bucket_name=os.getenv('AWS_BUCKET_NAME')

base = os.getcwd()

model = ModelFacade()
model.load_model(os.path.join(base, "models"), "100push0.7413.pth")


class Response(BaseModel):
    predictions: dict[int, tuple]
    original_img_url: str
    scaled_img_url: str
    activations_urls: List[str]


def upload_to_s3(file_name, bucket, object_name=None):
    """
    Function to upload a file to an S3 bucket
    """
    if object_name is None:
        object_name = file_name

    try:
        response = s3_client.upload_file(file_name, bucket, object_name)
        return f"https://{bucket}.s3.amazonaws.com/{object_name}"
    except FileNotFoundError:
        return "The file was not found"
    except NoCredentialsError:
        return "Credentials not available"

@app.post("/upload", response_model=Response)
async def upload(photo: UploadFile):
    """
    Uploads a photo and returns predicted species with corresponding confidence.
    """
    dir_name = "".join(secrets.choice(
        string.ascii_letters + string.digits) for _ in range(22)) + str(int(time.time()))

    dir_path = os.path.join(base, "requests", dir_name)
    os.makedirs(dir_path)

    img_path = os.path.join(dir_path, "upload.jpg")
    with open(img_path, "wb") as buffer:
        buffer.write(await photo.read())
    
    img_tens = model.load_image(img_path)

    predictions, img_original, prot_act, prot_act_pattern = model.predict(img_tens)
    plt.imsave(os.path.join(dir_path, "scaled.jpg"), img_original)
    
    os.makedirs(os.path.join(dir_path, "activations"))
    activations = model.nearest_k_prototypes(
        10, img_original, prot_act, prot_act_pattern)

    for i, img in enumerate(activations):
        plt.imsave(os.path.join(dir_path, "activations", f"{i}.jpg"), img)

    
    try:
        # Store local file paths to delete after upload
        local_files_to_delete = []

        # Upload original image
        original_img_url = upload_to_s3(img_path, aws_bucket_name, f"{dir_name}/upload.jpg")
        local_files_to_delete.append(img_path)  # Add local path to list

        # Upload scaled image
        scaled_img_path = os.path.join(dir_path, "scaled.jpg")
        scaled_img_url = upload_to_s3(scaled_img_path, aws_bucket_name, f"{dir_name}/scaled.jpg")
        local_files_to_delete.append(scaled_img_path)  # Add local path to list

        # Upload activation images
        activations_urls = []
        for i, img in enumerate(activations):
            act_img_path = os.path.join(dir_path, "activations", f"{i}.jpg")
            plt.imsave(act_img_path, img)
            act_img_url = upload_to_s3(act_img_path, aws_bucket_name, f"{dir_name}/activations/{i}.jpg")
            activations_urls.append(act_img_url)
            local_files_to_delete.append(act_img_path)  # Add local path to list

        # Delete local files after upload
        for file_path in local_files_to_delete:
            os.remove(file_path)

        # Clean up directories after all files have been deleted
        if os.path.isdir(os.path.join(dir_path, "activations")):
            os.rmdir(os.path.join(dir_path, "activations"))
        if os.path.isdir(dir_path):
            os.rmdir(dir_path)

    except Exception as e:
        # Handle exceptions here, such as logging the error
        print(f"An error occurred: {e}")
   
    
    return Response(predictions=predictions, original_img_url=original_img_url, scaled_img_url=scaled_img_url, activations_urls=activations_urls)