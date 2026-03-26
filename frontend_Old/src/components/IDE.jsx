import { useRef, useState } from "react";
import { runCode }        from "../utils/codeRunner";
import { useConsole }     from "../hooks/useConsole";
import { useReports }     from "../hooks/UseReports";
import { useFileManager } from "../hooks/UseFileManager";
import { TitleBar }       from "./TitleBar";
import { FileTabs }       from "./FileTabs";
import { Editor }         from "./Editor";
import { ResizeHandle }   from "./ResizeHandle";
import { ConsolePanel }   from "./ConsolePanel";
import { StatusBar }      from "./StatusBar";
import { ReportsPanel }   from "./ReportsPanel";
 
export function IDE() {
  const editorRef = useRef(null);
 
  const [cursorPos, setCursorPos] = useState("Ln 1, Col 1");
  const [consoleH,  setConsoleH]  = useState(190);
 
  const { logs, appendLogs, clearLogs }    = useConsole();
  const { errors, symbols, ast }           = useReports();


  const [tabs, setTabs] = useState([
    {
        id: 1,
        name: "main.gst"
    },
    ]);

    const [activeTab, setActiveTab] = useState(1);
 
    const activeFile = tabs.find(tab => tab.id === activeTab);
  const handleRun = () => {
    if (!editorRef.current) return;
    appendLogs(runCode(editorRef.current.getValue()));
    // TODO: conectar parser GoScript → setErrors / setSymbols / setAst
  };
 
  return (
    <div style={{
      background: "#1e1e1e",
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      overflow: "hidden",
    }}>
      <TitleBar
        activeFileName={tabs[activeTab]?.name}
        onNew={newFile}
        onOpen={openFile}
        onSave={saveFile}
        onRun={handleRun}
        onClear={clearLogs}
      />
 
      <FileTabs
        tabs={tabs}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
       />

       
 
      {/* Zona central: editor (izq) + reportes (der) */}
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* Columna izquierda */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Editor
            editorRef={editorRef}
            value={activeFile.content}
            onChange={(newValue) => {
                setTabs(prev =>
                prev.map(tab =>
                    tab.id === activeTab
                    ? { ...tab, content: newValue }
                    : tab
                )
                );
            }}
            onCursorChange={setCursorPos}
            onRun={handleRun}
            />
          <ResizeHandle consoleHeight={consoleH} onResize={setConsoleH} />
          <ConsolePanel logs={logs} height={consoleH} />
        </div>
 
        {/* Panel derecho de reportes */}
        <ReportsPanel errors={errors} symbols={symbols} ast={ast} />
      </div>
 
      <StatusBar cursorPos={cursorPos} />
    </div>
  );
}