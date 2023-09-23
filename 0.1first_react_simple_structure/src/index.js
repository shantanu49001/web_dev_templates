//ater addign depe
import React from "react";
import ReactDOM from "react-dom";

//for react to atually show some thing it needs this

//ReactDom.render(WHAT TO SHOW ,WHERE TO SHOW,CALLBACK FUNTION)

//h1 show krna hai aur index.html ke div root me krna hai
//agar aise compenent show krna h to DOM -->document req
ReactDOM.render(<h1>Heelo</h1>, document.getElementById("root"));
//multiple elements ko send kra hai render kr liye -->div me andar place krdo

ReactDOM.render(
  <div>
    <h1> hi</h1>
    <p> bye</p>
  </div>,
  document.getElementById("root")
);
