import React from "react";

import { CloseIcon } from "./index";
import { PopupProps } from "./types";

export function InfoPopup(props: PopupProps) {
  return (
    <div
      className="info-popup">
      <div className="info-popup__inner">
        <CloseIcon
          className="info-popup__close-icon"
          onClick={() => { props.onClose() }} />

        <h1
          className="info-popup__headline">
          SQL Schema Visualizer
        </h1>

        <div className="info-popup__body">

          <h2>Shortcuts</h2>

          <p>
            <strong>CMD + hover</strong> over a table node or a column name to see the description.
          </p>

          <p>
            <strong>CMD + click on an edge</strong> to select and highlight it.
          </p>

          <p>
            <strong>CTRL + P</strong> shortcut prints all table node positions to the console and copies them to the clipboard. You can then paste these positions to the <a target="_blank" rel="noreferrer" href="https://github.com/sqlhabit/sql_schema_visualizer/blob/main/src/config/tablePositions.json"><i>TablePositions.json</i></a> file.
          </p>

          <p className="mb-32">
            <strong>Hover over a table node</strong> to highlight all incoming and outgoing edges.
          </p>

        </div>
      </div>
    </div>
  );
};
