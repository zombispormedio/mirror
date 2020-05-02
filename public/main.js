import htm from "/web_modules/htm.js";
import React, { useEffect, useState } from "/web_modules/react.js";
import ReactDOM from "/web_modules/react-dom.js";
import { ObjectInspector } from "/web_modules/react-inspector.js";

const html = htm.bind(React.createElement);

const App = () => {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const connection = new WebSocket(`ws://${window.location.host}/ws`);

    connection.onopen = function () {
      setConnected(true);
    };

    connection.onerror = function (error) {
      console.log("WebSocket Error " + error);
    };

    // Log messages from the server
    connection.onmessage = function (e) {
      setMessages((prev) => [...prev, e.data]);
    };
  }, []);

  if (!connected) return html`<div>Disconnected</div>`;

  const data = messages.map((message) => {
    const value = JSON.parse(message);
    return {
      ...value,
      body: value.body ? JSON.parse(value.body) : {},
    };
  });

  return html`<h1>Connected</h1>
    <div>
      <${ObjectInspector} data=${data} />
    </div>`;
};

ReactDOM.render(html`<${App} />`, document.getElementById("root"));
