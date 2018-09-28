import * as tf from "@tensorflow/tfjs";
import { image } from "@tensorflow/tfjs";


const mobileNetPath = `https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json`;
const numClasses = 5;

const loadMobileNet = async () => {
  try {
    const mobileNet = await tf.loadModel(mobileNetPath);
    // mobileNet.summary();
    const layer = mobileNet.getLayer(`conv_pw_13_relu`);
    // console.log(layer);
    const truncatedModel = tf.model({ inputs: mobileNet.inputs, outputs: layer.output });
    // console.log(truncatedModel);
    return truncatedModel;
  } catch (err) {
    // console.log(err);
  }
};

// First step is to load the image and turn it into a tensor -- not crop!
// image must be an HTMLImageElement Instance to call tf.fromPixels on it
const imageToTensor = (imageSrc) => {
  const img = new Image();
  img.src = imageSrc;
  img.onload = async () => {
    console.log(img.height);
    console.log(img.width);
    const tensorImage = await tf.fromPixels(img);
    tensorImage.print();
    return tensorImage;
  };
};


export { loadMobileNet, imageToTensor };

// /* Send images in to be formatted correctly for MobileNet models */
// const formatImage = async (image) => {
//   const croppedImage = await croppedImage(image);
//   const resizedImage = await resizedImage(croppedImage);
//   const batchedImage = await batchImage(resizedImage);
//   return batchedImage;
// };

/* tfjs example for cropping a TENSOR */
function cropImageTFJS(img) {
  const size = Math.min(img.shape[0], img.shape[1]);
  const centerHeight = img.shape[0] / 2;
  const beginHeight = centerHeight - size / 2;
  const centerWidth = img.shape[1] / 2;
  const beginWidth = centerWidth - size / 2;
  return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
}

/* example for copping from kevin scott */
function cropImage(img) {
  const width = img.shape[0];
  const height = img.shape[1];

  // use the shorter side as the size to which we will crop
  const shorterSide = Math.min(img.shape[0], img.shape[1]);

  // calculate beginning and ending crop points
  const startingHeight = (height - shorterSide) / 2;
  const startingWidth = (width - shorterSide) / 2;
  const endingHeight = startingHeight + shorterSide;
  const endingWidth = startingWidth + shorterSide;

  // return image data cropped to those points
  return img.slice([startingWidth, startingHeight, 0], [endingWidth, endingHeight, 3]);
}

//   adjustVideoSize(width, height) {
//     const aspectRatio = width / height;
//     if (width >= height) {
//       this.webcamElement.width = aspectRatio * this.webcamElement.height;
//     } else if (width < height) {
//       this.webcamElement.height = this.webcamElement.width / aspectRatio;
//     }
//   }


// const canvas = document.createElement(`canvas`);
// const imageData = canvas.getContext(`2d`).createImageData();
// imageData.data.set(imageSrc);
// const tensorImage = tf.fromPixels(imageData);
// tensorImage.print();
