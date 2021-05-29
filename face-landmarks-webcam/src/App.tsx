import { useRef } from "react";
import "./App.css";
import Webcam from "react-webcam";

function App() {
  const webcam = useRef<Webcam>(null);

  return (
    <div className="App">
      <header className="header">
        <div className="title">Face Landmarks Detection</div>
        <Webcam audio={false} ref={webcam} height={1080} width={1280} />
      </header>
    </div>
  );
}

export default App;
