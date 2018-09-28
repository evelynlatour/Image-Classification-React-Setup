import React from "react";
import { loadMobileNet, imageToTensor } from "../tfjs/mobileNet-test";
import testImage from "../images/test.jpg";
import testImage2 from "../images/test2.jpg";
import colorful from "../images/colorful.jpg";

const App = () => {
  loadMobileNet();
  imageToTensor(testImage);
  return (
    <div>
      <h1>---</h1>
    </div>
  );
};

export default App;
