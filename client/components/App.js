import React from "react";
import loadMobileNet from "../tfjs/mobileNet-test";

const App = () => {
  loadMobileNet();
  return (
    <div>
      <h1>---</h1>
    </div>
  );
};

export default App;
