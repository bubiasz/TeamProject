import os
import copy
import pickle

import cv2
import numpy as np
from PIL import Image

import torch
from torch.autograd import Variable
import torchvision.transforms as transforms


class ModelFacade(object):
    def __init__(self) -> None:
        """
        Initialize the Facade object.
        """
        self.__model = None
        self.__species = None
        self.__img_size = None
        self.__preprocess = None
        self.__model_multi = None
        self.__max_distance = None
        self.__std = (0.229, 0.224, 0.225)
        self.__mean = (0.485, 0.456, 0.406)

    def load_model(self, model_dir: str, model_name: str) -> None:
        """
        Loads a model from the specified directory.
        """
        if not os.path.exists(os.path.join(model_dir, model_name)):
            raise FileNotFoundError(
                "Model file not found. Please check model directory and name.")
        
        if not os.path.exists(os.path.join(model_dir, "numpy", "bb100.npy")):
            raise FileNotFoundError(
                "bb100 file not found. Please check models/numpy directory.")
        
        if not os.path.exists(os.path.join(model_dir, "data", "species.pkl")):
            raise FileNotFoundError(
                "Species file not found. Please check models/data directory.")

        with open(os.path.join(model_dir, "data", "species.pkl"), "rb") as f:
            self.__species = pickle.load(f)

        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model = torch.load(
            os.path.join(model_dir, model_name), map_location=device)
        
        self.__model = model.cuda() if device == "cuda" else model.cpu()
        self.__model_multi = torch.nn.DataParallel(self.__model)

        if not self.__sanity_check(model_dir):
            self.__model = None
            self.__model_multi = None

            raise RuntimeError(
                "Model sanity check failed. Please check model behaviour.")

        self.__img_size = self.__model_multi.module.img_size

        shape = self.__model.prototype_shape
        self.__max_distance = shape[1] * shape[2] * shape[3]

        self.__preprocess = transforms.Compose([
            transforms.Resize((self.__img_size, self.__img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=self.__mean, std=self.__std)
        ])


    def __sanity_check(self, model_dir: str) -> bool:
        """
        Perform a sanity check on the model by comparing the prototype connections
        with the prototype identities.
        """
        prot_img_identity = np.load(os.path.join(model_dir, "numpy", "bb100.npy"))[:, -1]

        prot_max_connection = torch.argmax(self.__model.last_layer.weight, dim=0)
        prot_max_connection = prot_max_connection.cpu().numpy()

        return (
            np.sum(
                prot_max_connection == prot_img_identity) == self.__model.num_prototypes)

    def load_image(self, img_path: str) -> torch.Tensor:
        """
        Load an image from the specified path and preprocess it.
        """
        if not os.path.exists(os.path.join(img_path)):
            raise FileNotFoundError(
                "Image file not found. Please check image directory and name.")

        img_tensor = self.__preprocess(Image.open(img_path).convert("RGB"))
        img_variable = Variable(img_tensor.unsqueeze(0))

        try:
            img_variable = img_variable.cuda()
        except AssertionError:
            img_variable = img_variable.cpu()

        return img_variable

    def predict(self, img_tens: torch.Tensor) -> (
            dict, np.ndarray, torch.Tensor, torch.Tensor):
        """
        Predicts the classes and their corresponding probabilities
        for an input image tensor.
        """
        logits, min_distance = self.__model_multi(img_tens)
        _, distances = self.__model.push_forward(img_tens)

        prot_act = self.__model.distance_2_similarity(min_distance)
        prot_act_pattern = self.__model.distance_2_similarity(distances)

        if self.__model.prototype_activation_function == "linear":
            prot_act = prot_act + self.__max_distance
            prot_act_pattern = prot_act_pattern + self.__max_distance

        topk = torch.topk(torch.softmax(logits, dim=1), k=5)

        predictions = {k: v for k, v in zip(range(1, 6), zip(
            (self.__species[i] for i in topk.indices[0].cpu().detach().numpy()),
            (round(i * 100, 2) for i in topk.values[0].cpu().detach().numpy())
        ))}

        img_copy = copy.deepcopy(img_tens[0:1])
        img_original = torch.zeros_like(img_copy)

        for i in range(3):
            img_original[:, i, :, :] = (
                img_copy[:, i, :, :] * self.__std[i] + self.__mean[i])

        img_original = img_original[0]
        img_original = img_original.detach().cpu().numpy()
        img_original = np.transpose(img_original, [1, 2, 0])

        return predictions, img_original, prot_act, prot_act_pattern
    
    def nearest_k_prototypes(
        self,
        k: int,
        img_original: np.ndarray,
        prot_act: torch.Tensor,
        prot_act_pattern: torch.Tensor
    ) -> list[np.ndarray]:
        """
        Generates a list of overlayed images by finding the nearest k prototypes
        based on their activation patterns.
        """
        _, sorted_indices = torch.sort(prot_act[0])

        activations = []
        for i in range(1, k + 1):
            activation_pattern = (
                prot_act_pattern[0][sorted_indices[-i].item()]
                .detach()
                .cpu()
                .numpy()
            )
            upsampled_activation_pattern = cv2.resize(
                activation_pattern,
                dsize=(self.__img_size, self.__img_size),
                interpolation=cv2.INTER_CUBIC,
            )
            rescaled_activation_pattern = upsampled_activation_pattern - np.amin(
                upsampled_activation_pattern)
            rescaled_activation_pattern = rescaled_activation_pattern / np.amax(
                rescaled_activation_pattern)
            
            heatmap = cv2.applyColorMap(
                np.uint8(255 * rescaled_activation_pattern), cv2.COLORMAP_JET)
            
            heatmap = np.float32(heatmap) / 255
            heatmap = heatmap[..., ::-1]
            overlayed_img = 0.5 * img_original + 0.3 * heatmap

            activations.append(overlayed_img)

        return activations
