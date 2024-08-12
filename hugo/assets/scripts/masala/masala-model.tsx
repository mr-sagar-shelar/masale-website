import {
  addMonacoStyles,
  createUserConfig,
  MonacoEditorReactComp,
  UserConfig,
} from "langium-website-core/bundle";
import { buildWorkerDefinition } from "monaco-editor-workers";
import React from "react";
import { createRoot } from "react-dom/client";
import {
  DomainModelAstNode,
  example,
  examples,
  getDomainModelAst,
  getMainTreeNode,
  syntaxHighlighting,
} from "./masala-model-tools";
import {
  deserializeAST,
  Diagnostic,
  DocumentChangeResponse,
} from "langium-ast-helper";
import Atoms from "./Atoms";
import D3Tree from "./d3tree";
import { CreateWebWorkerMLCEngine, WebWorkerMLCEngine } from "@mlc-ai/web-llm";
import * as webllm from "@mlc-ai/web-llm";


const initProgressCallback = (initProgress) => {
  console.error(` $$ Progress = ${initProgress}`);
}
const selectedModel = "mlc-ai/Qwen1.5-0.5B-Chat-q0f16-MLC";


addMonacoStyles("monaco-styles-helper");

buildWorkerDefinition(
  "../../libs/monaco-editor-workers/workers",
  new URL("", window.location.href).href,
  false
);

let userConfig: UserConfig;

interface AppState {
  ast?: DomainModelAstNode;
  diagnostics?: Diagnostic[];
  uiIndex: number;
  exampleIndex: number;
  mlEngine?: WebWorkerMLCEngine;
}

class App extends React.Component<{}, AppState> {
  monacoEditor: React.RefObject<MonacoEditorReactComp>;
  constructor(props) {
    super(props);

    // bind 'this' ref for callbacks to maintain parent context
    this.onMonacoLoad = this.onMonacoLoad.bind(this);
    this.onDocumentChange = this.onDocumentChange.bind(this);
    this.monacoEditor = React.createRef();

    // set initial state
    this.state = {
      ast: undefined,
      diagnostics: undefined,
      uiIndex: 0,
      exampleIndex: 0,
      mlEngine: undefined,
    };
  }

  /**
   * Callback that is invoked when Monaco is finished loading up.
   * Can be used to safely register notification listeners, retrieve data, and the like
   *
   * @throws Error on inability to ref the Monaco component or to get the language client
   */
  onMonacoLoad() {
    // verify we can get a ref to the editor
    if (!this.monacoEditor.current) {
      throw new Error("Unable to get a reference to the Monaco Editor");
    }

    // verify we can get a ref to the language client
    const lc = this.monacoEditor.current
      ?.getEditorWrapper()
      ?.getLanguageClient();
    if (!lc) {
      throw new Error("Could not get handle to Language Client on mount");
    }
    this.monacoEditor.current.getEditorWrapper()?.getEditor()?.focus();
    // register to receive DocumentChange notifications
    lc.onNotification("browser/DocumentChange", this.onDocumentChange);
  }

  /**
   * Callback invoked when the document processed by the LS changes
   * Invoked on startup as well
   * @param resp Response data
   */
  onDocumentChange(resp: DocumentChangeResponse) {
    // get the AST from the response and deserialize it
    const ast = deserializeAST(resp.content) as DomainModelAstNode;
    
    this.setState({
      ast: ast,
      diagnostics: resp.diagnostics,
    });
  }

  renderAST(ast: DomainModelAstNode): JSX.Element {
    if (!ast) {
      return <div>No AST available.</div>;
    }

    // if there are no errors, render the tree
    if (
      this.state.diagnostics == null ||
      this.state.diagnostics.filter((i) => i.severity === 1).length == 0
    ) {
      return <D3Tree data={getMainTreeNode(ast)} />;
    }

    // otherwise, render the errors
    return (
      <div className="flex flex-col h-full w-full p-4 justify-start items-center my-10">
        <div className="text-white border-2 border-solid border-accentRed rounded-md p-4 text-left text-sm cursor-default">
          {this.state.diagnostics
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
  }

  renderAtom(ast: DomainModelAstNode): JSX.Element {
    if (!ast) {
      return <div>No AST available.</div>;
    }

    // if there are no errors, render the tree
    if (
      this.state.diagnostics == null ||
      this.state.diagnostics.filter((i) => i.severity === 1).length == 0
    ) {
      const entities = getDomainModelAst(ast as DomainModelAstNode).entities;
      return <Atoms entities={entities} />;
    }

    // otherwise, render the errors
    return (
      <div className="flex flex-col h-full w-full p-4 justify-start items-center my-10">
        <div className="text-white border-2 border-solid border-accentRed rounded-md p-4 text-left text-sm cursor-default">
          {this.state.diagnostics
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
  }

  setUiIndex(index: number) {
    this.setState({ uiIndex: index });
  }

  setExampleIndex(index: number) {
    this.setState({ exampleIndex: index });
    this.monacoEditor.current
      ?.getEditorWrapper()
      ?.getEditor()
      ?.setValue(examples[index]);
  }


  render() {
    const style = {
      height: "100%",
      width: "100%",
    };

    
    return (
      <>
        <div className="justify-center self-center flex flex-col md:flex-row h-full w-full p-4">
          <div className="float-left w-full h-full flex flex-col">
            <div className="border-solid border border-emeraldLangium bg-emeraldLangiumDarker flex items-center p-3 text-white font-mono">
              Editor
              <select
                className="ml-4 bg-emeraldLangiumDarker cursor-pointer border-0 border-b invalid:bg-emeraldLangiumABitDarker"
                onChange={(e) => this.setExampleIndex(parseInt(e.target.value))}
              >
                <option value="0">Ride-Sharing App (e.g., Uber, Lyft)</option>
                <option value="1">
                  Online Food Delivery Platform (e.g., DoorDash, UberEats)
                </option>
                <option value="2">
                  Social Media Platform (e.g., Facebook, Instagram)
                </option>
                <option value="3">
                  Video Streaming Service (e.g., Netflix, Hulu)
                </option>
                <option value="4">
                  E-commerce Platform (e.g., Amazon, eBay)
                </option>
                <option value="5">
                  Cloud Storage Service (e.g., Google Drive, Dropbox)
                </option>
                <option value="6">
                  Real-Time Chat Application (e.g., WhatsApp, Slack)
                </option>
                <option value="7">
                  Job Search Platform (e.g., LinkedIn, Indeed)
                </option>
                <option value="8">
                  Online Learning Platform (e.g., Coursera, Udemy)
                </option>
                <option value="9">
                  Online Payment System (e.g., PayPal, Stripe)
                </option>
              </select>
              <button
                onClick={async () => {
                  const engine = await CreateWebWorkerMLCEngine(
                    new Worker(
                      new URL("/worker.js", import.meta.url), 
                      {
                        type: "module",
                      }
                    ),
                    selectedModel,
                    { initProgressCallback }, // engineConfig
                  );
                  console.error(` $$$$ Engine Ready:`);
                  this.setState({
                    mlEngine: engine
                  });

                  const request: webllm.ChatCompletionRequest = {
                    messages: [
                      {
                        role: "system",
                        content:
                          "You are a helpful, respectful and honest assistant. " +
                          "Be as happy as you can when speaking please. ",
                      },
                      { role: "user", content: "Provide me three US states." },
                      { role: "assistant", content: "California, New York, Pennsylvania." },
                      { role: "user", content: "Two more please!" },
                    ],
                    n: 3,
                    temperature: 1.5,
                    max_tokens: 256,
                  };
                
                  console.error(` $$$$ Calling Chat API:`);
                  const reply0 = await engine.chat.completions.create(request);

                  console.error(` $$$$ Got Reply:`);
                  console.log(reply0);
                
                  console.error(` $$$$ Got Usage:`);
                  console.log(reply0.usage);
                }}
                className="text-white border-2 border-solid transition-shadow bg-emeraldLangiumABitDarker rounded-md p-4 text-center text-sm enabled:hover:shadow-opacity-50 enabled:hover:shadow-[0px_0px_15px_0px] enabled:hover:shadow-emeraldLangium disabled:border-gray-400 disabled:text-gray-400 disabled:bg-emeraldLangiumDarker "
              >
                Load Model
              </button>
            </div>
            <div className="wrapper relative bg-white dark:bg-gray-900 border border-emeraldLangium h-[50vh] min-h-[300px]">
              <MonacoEditorReactComp
                ref={this.monacoEditor}
                onLoad={this.onMonacoLoad}
                userConfig={userConfig}
                style={style}
              />
            </div>
          </div>
          <div className="float-left w-full h-full flex flex-col" id="preview">
            <div className="border-solid border border-emeraldLangium bg-emeraldLangiumDarker flex items-center p-3 text-white font-mono ">
              Preview
              <select
                className="ml-4 bg-emeraldLangiumDarker cursor-pointer border-0 border-b invalid:bg-emeraldLangiumABitDarker"
                onChange={(e) => this.setUiIndex(parseInt(e.target.value))}
              >
                <option value="0">Mindmap</option>
                <option value="1">UX</option>
                <option value="2">UI</option>
                <option value="3">Class Diagram</option>
                <option value="4">Architecture Diagram</option>
                <option value="5">Atoms</option>
                <option value="6">Molecules</option>
                <option value="7">Templates</option>
                <option value="8">Pages</option>
                <option value="9">Web</option>
                <option value="10">Mobile</option>
              </select>
              <button
                onClick={() => {
                  const currentValue = this.monacoEditor.current
                    ?.getEditorWrapper()
                    ?.getEditor()
                    ?.getValue();
                  this.monacoEditor.current?.getEditorWrapper()?.getEditor()
                    ?.setValue(`${currentValue}\nentity Sagar extends HasAuthor {
    title: String
}`);
                }}
                className="text-white border-2 border-solid transition-shadow bg-emeraldLangiumABitDarker rounded-md p-4 text-center text-sm enabled:hover:shadow-opacity-50 enabled:hover:shadow-[0px_0px_15px_0px] enabled:hover:shadow-emeraldLangium disabled:border-gray-400 disabled:text-gray-400 disabled:bg-emeraldLangiumDarker "
              >
                Add Entity
              </button>
            </div>
            <div className="border border-emeraldLangium h-full w-full">
              {this.state.ast &&
                this.state.uiIndex == 0 &&
                this.renderAST(this.state.ast)}
              {this.state.ast &&
                this.state.uiIndex != 0 &&
                this.renderAtom(this.state.ast)}
            </div>
          </div>
        </div>
      </>
    );
  }
}

userConfig = createUserConfig({
  languageId: "domainmodel",
  code: example,
  worker: "../../showcase/libs/worker/domainmodelServerWorker.js",
  monarchGrammar: syntaxHighlighting,
});

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<App />);
