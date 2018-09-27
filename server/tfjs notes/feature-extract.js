const ml5 = require(`ml5`)

//extracts already learned features from MobileNet model
const featureExtractor = ml5.featureExtractor('MobileNet', () => console.log('model loaded'))

//specify use as classifier (as opposed to regressor)
const classifier = featureExtractor.classification()
const testImage = `http://lp2.hm.com/hmgoepprod?set=source[/cc/da/ccda38e8aa0c222a899a69ea7965548b7fc73778.jpg],origin[dam],category[ladies_tops_longsleeve],type[DESCRIPTIVESTILLLIFE],res[m],hmver[1]&call=url[file:/product/main]`

//add image
classifier.addImage(testImage, 'shirt', () => console.log('image added to model'))

//train
classifier.train((lossValue) => console.log('model trained, and loss value is:', lossValue))


/* Default MobileNet options */
// {   
//   version: 1,
//   alpha: 1.0,
//   topk: 3,
//   learningRate: 0.0001,
//   hiddenUnits: 100,
//   epochs: 20,
//   numClasses: 2,
//   batchSize: 0.4,
// }