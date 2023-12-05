import os
import time
import string
import secrets
from pydantic import BaseModel

import matplotlib.pyplot as plt
from fastapi import FastAPI, UploadFile

from facade import ModelFacade

app = FastAPI()

base = os.getcwd()

model = ModelFacade()
model.load_model(os.path.join(base, "models"), "100push0.7413.pth")


class Response(BaseModel):
    predictions: dict[int, tuple]


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

    # Place to insert amazon image handling
    # Save images scaled, and top 10 prototypes to amazon
    # Return amazon links to images

    return Response(predictions=predictions)
