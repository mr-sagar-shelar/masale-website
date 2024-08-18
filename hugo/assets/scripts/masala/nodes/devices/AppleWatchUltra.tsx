import React, { memo } from "react";

export default memo(() => {
  return (
    <>
      <div className="device device-apple-watch-ultra">
        <div className="device-frame">
          <img className="device-screen" src="/img/bg-watch.jpg" />
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