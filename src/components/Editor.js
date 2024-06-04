import React, { useEffect, useRef, useState } from "react";
import Codemirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import ACTIONS from "../Actions";
import toast from "react-hot-toast";
import Output from "./Output";

const Editor = ({ socketRef, roomId, onCodeChange }) => {
  const editorRef = useRef(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    async function init() {
      editorRef.current = Codemirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    }
    init();
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }

    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(editorRef.current.getValue());
      toast.success("Code has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Code");
      console.error(err);
    }
  }

  return (
    <div className="editorcontainer">
      <div className="copyHeader">
        <button className="btn copyCode" onClick={copyCode}>
          Copy Code
        </button>
      </div>
      <div>
        <textarea
          id="realtimeEditor"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
          }}
        ></textarea>

        <Output editorRef={editorRef} />
      </div>
    </div>
  );
};

export default Editor;
