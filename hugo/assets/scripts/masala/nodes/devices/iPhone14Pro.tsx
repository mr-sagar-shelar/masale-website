import React, { memo } from "react";

export default memo(() => {
  return (
    <>
      <div className="device device-iphone-14-pro">
        <div className="device-frame">
          <img className="device-screen" src="/img/bg-iphone-14-pro.jpg" />
        </div>
        <div className="device-stripe"></div>
        <div className="device-header"></div>
        <div className="device-sensors"></div>
        <div className="device-btns"></div>
        <div className="device-power"></div>
      </div>
    </>
  );
});
