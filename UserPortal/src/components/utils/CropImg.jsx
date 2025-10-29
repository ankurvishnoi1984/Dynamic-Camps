import React from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";
import "./CropImg.css"
const CropImg = ({img1,setCropperFun,getCropData,closePopup}) => {
  return (
    <div>
      <div
        className="crop_popup"
      >
      <button className="close-btn" onClick={closePopup}>
        ✖
      </button>
        <Cropper
          src={img1}
          className="cropper_box"
          initialAspectRatio={4 / 3}
          minCropBoxHeight={200}
          minCropBoxWidth={200}
          guides={false}
          checkOrientation={false}
          onInitialized={(instance) => {
            setCropperFun(instance);
          }}
        />
        <button
          className="crop-btn btn btn-primary mt-2"
          onClick={getCropData}
        >
          Crop Image
        </button>
      </div>
    </div>
  );
};

export default CropImg;
