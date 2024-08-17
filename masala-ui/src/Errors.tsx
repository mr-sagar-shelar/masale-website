import React from "react";
import { Diagnostic } from "langium-ast-helper";

interface DiagnosticProps {
  diagnostics: Diagnostic[];
}

export const Errors = (props: DiagnosticProps) => {
  const { diagnostics } = props;
  return (
    <div className="flex flex-col h-full w-full p-4 justify-start items-center my-10">
      <div className="text-white border-2 border-solid border-accentRed rounded-md p-4 text-left text-sm cursor-default">
        {diagnostics
          .filter((i) => i.severity === 1)
          .map((diagnostic, index) => (
            <details key={index}>
              <summary>{`Line ${diagnostic.range.start.line + 1}-${
                diagnostic.range.end.line + 1
              }: ${diagnostic.message}`}</summary>
              <p>
                Source: {diagnostic.source} | Code: {diagnostic.code}
              </p>
            </details>
          ))}
      </div>
    </div>
  );
};
