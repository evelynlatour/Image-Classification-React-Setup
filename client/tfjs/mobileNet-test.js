import * as tf from "@tensorflow/tfjs";

const mobileNetPath = `https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json`;

const loadMobileNet = async () => {
  try {
    const mobileNet = await tf.loadModel(mobileNetPath);
    // mobileNet.summary();
    const layer = mobileNet.getLayer(`conv_pw_13_relu`);
    console.log(layer);
    const truncatedModel = tf.model({ inputs: mobileNet.inputs, outputs: layer.output });
    console.log(truncatedModel);
    return truncatedModel;
  } catch (err) {
    console.log(err);
  }
};

export default loadMobileNet;

// /* Send images in to be formatted correctly for MobileNet models */
// const formatImage = async (image) => {
//   const croppedImage = await croppedImage(image);
//   const resizedImage = await resizedImage(croppedImage);
//   const batchedImage = await batchImage(resizedImage);
//   return batchedImage;
// };
