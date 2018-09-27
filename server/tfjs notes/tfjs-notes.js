/* Need 2 MobileNet Models:
1. truncated MobileNet Model --> (output data for input into next MobileNet model) --> 
2. model that you're training in the browser to predict image probabilities  */

// Loading Pretrained MobileNet Model & returning our truncated model
async function loadMobilenet() {
    const mobilenet = await tf.loadModel(
        'https://storage.googleapis.com/tfjs-models/tfjs/mobilenet_v1_0.25_224/model.json');
  
    // Reach into an internal layer of the model & return a model that outputs an internal activation
    // You can select ANY layer. Use console.log(model.layers) to print the layers of the model.
    const layer = mobilenet.getLayer('conv_pw_13_relu');
    return tf.model({inputs: mobilenet.inputs, outputs: layer.output});
  });

//Inspect mobileNet layers
  loadMobilenet().then(mobilenet => {
    mobilenet.summary();
  });

// tf.fromPixels creates a tf.Tensor from an image --> this can be HTML img or canvas element or image data
// NOTE: tf.fromPixels requires something coming from the browser though...if just using Node...???
//crop image w/ cropImage(...) and expand to fill square space with expandDims(0) 
// tensor should now be reshaped to [1,224,224,3] which represents a single batch (1) of an image of size 224x224 pixels in the RGB color space (3)
// image data is usually [row, column, depth of color channel]

/* Translate the tensor you created with tf.fromPixels */
function batchImage(image) {
    // Expand our tensor to have an additional dimension, whose size is 1
    const batchedImage = image.expandDims(0);
  
    // Normalization: Turn pixel data into a float between -1 and 1 instead of 0 - 255 (integer data)
    return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
  }

/* tf.tidy cleans up intermediate tensors that get created when performing a tensor operation. Wrap your entire function in tf.tidy.
It will execute that function, and purge intermediate tensors but NOT the return value of that function.
If you want an intermediate to be kept, use tf.keep()
NO ASYNC ALLOWED HERE */

/* Creating a control dataset by adding in example images:
1. Feed image into the truncated model & save the outputted activation tensors (xs & ys)
2. These will be used as inputs to the model you're going to train
    xs: all the activations from the truncated MobileNet model for ALL the collected data
    ys: the labels for all of the collected data as a one hot representation
*/

/* tf.oneHot will allow you to convert your labels into one hot representations [0,1,....]
 your labels will correspond to your indexes where the item has 100% probability of having that label. 
 For example, if you had the following 4 labels you would have:
 0 = left [1,0,0,0]
 1 = right [0,1,0,0]
 2 = up [0,0,1,0]
 3 = down [0,0,0,1]
 */

/* Function that translates our labels into a oneHot encoding. Takes a particular number (labelIndex) that corresponds 
to a label and turns it into a one hot encoding, given some number of classes. see kevin scott's writeup for how
to fit this code into a broader labeling function */
function oneHot(labelIndex, classLength) {
  return tf.tidy(() => {
    return tf.oneHot(tf.tensor1d([labelIndex]).toInt(), classLength)
  });
};

addExample(example, label) {
    const y = tf.tidy(() => tf.oneHot(tf.tensor1d([label]), this.numClasses));
  
    if (this.xs == null) {
      this.xs = tf.keep(example);
      this.ys = tf.keep(y);
    } else {
      const oldX = this.xs;
      this.xs = tf.keep(oldX.concat(example, 0));
  
      const oldY = this.ys;
      this.ys = tf.keep(oldY.concat(y, 0));
  
      oldX.dispose();
      oldY.dispose();
      y.dispose();
    }
  }


  /* DEFINING the second model */

 const model = tf.sequential({
    layers: [
      // Flattens the input to a vector so we can use it in a dense layer. While
      // technically a layer, this only performs a reshape (and has no training
      // parameters).
      tf.layers.flatten({inputShape: [7, 7, 256]}),
      tf.layers.dense({
        units: ui.getDenseUnits(),
        activation: 'relu',
        kernelInitializer: 'varianceScaling',
        useBias: true
      }),

      // The number of units of the last layer should correspond
      // to the number of classes we want to predict.
      tf.layers.dense({
        units: NUM_CLASSES,
        kernelInitializer: 'varianceScaling',
        useBias: false,
        activation: 'softmax' // interpret the output of the last layer as a probability distribution over the possible classes
      })
    ]
  });
  

/* The importance of batch size when training:
Update internal parameters ("take a step") only after averaging gradients from several examples,
so that you don't train the model on just 1 outlier and take a step in the wrong direction. */

// How many examples the model should "see" before making a parameter update.
// ****A batch size of 64 would mean that actual shape of our input data is [64, 224, 224, 3] - this is a tensor rank of 4
const BATCH_SIZE = 64;
// How many batches to train the model for.
const TRAIN_BATCHES = 100;

// Every TEST_ITERATION_FREQUENCY batches, test accuracy over TEST_BATCH_SIZE examples.
// Ideally, we'd compute accuracy over the whole test set, but for performance
// reasons we'll use a subset.
const TEST_BATCH_SIZE = 1000;
const TEST_ITERATION_FREQUENCY = 5;

// Batch training example from the tensorflow MNIST example...
for (let i = 0; i < TRAIN_BATCHES; i++) {
    const batch = data.nextTrainBatch(BATCH_SIZE);
   
    let testBatch;
    let validationData;
    // Every few batches test the accuracy of the mode.
    if (i % TEST_ITERATION_FREQUENCY === 0) {
      testBatch = data.nextTestBatch(TEST_BATCH_SIZE);
      validationData = [
        testBatch.xs.reshape([TEST_BATCH_SIZE, 28, 28, 1]), testBatch.labels
      ];
    }
   
    // The entire dataset doesn't fit into memory so we call fit repeatedly
    // with batches.
    const history = await model.fit(
        batch.xs.reshape([BATCH_SIZE, 28, 28, 1]),
        batch.labels,
        {
          batchSize: BATCH_SIZE,
          validationData,
          epochs: 1
        });
  
    const loss = history.history.loss[0];
    const accuracy = history.history.acc[0];
  
    // ... plotting code ...
}


/* Data set management: 
folder where the name of the folder is the label and all images in that folder correspond to that label
Since tf can grab from the browser, perhaps can just be label-named-file with array of links to images */

// In order to visualize output you must call tensor_name.print() on a tensor instead of console.log(tensor_name)

// For first attempt just load mobileNet and get it to predict on an image you give it