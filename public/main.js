import htm from "/web_modules/htm.js";
import React, { useEffect, useState } from "/web_modules/react.js";
import ReactDOM from "/web_modules/react-dom.js";
import { nanoid } from "/web_modules/nanoid.js";
import { ObjectInspector } from "/web_modules/react-inspector.js";
import {
  BaseStyles,
  Timeline,
  StyledOcticon,
  Label,
  BranchName,
  BorderBox,
  Box,
  Flex,
  CircleBadge,
  Heading,
} from "./web_modules/@primer/components.js";
import { Flame, Zap } from "./web_modules/@primer/octicons-react.js";

const html = htm.bind(React.createElement);

const getColorByMethod = (method) =>
  ({
    POST: "blue.5",
    GET: "green.5",
    PUT: "purple.5",
    DELETE: "red.5",
  }[method]);

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
      const value = JSON.parse(e.data);
      console.log(value);
      setMessages((prev) => [
        {
          ...value,
          id: nanoid(),
          body: value.body ? JSON.parse(value.body) : null,
        },
        ...prev,
      ]);
    };
  }, []);

  if (!connected) return html`<div>Disconnected</div>`;

  return html`
    <${BaseStyles}>
      <${Box} bg="gray.0" minHeight="100vh">
        ${
          messages.length === 0 &&
          html` <${Flex} justifyContent="center" alignItems="center" flexDirection="column">
          <${Heading} mb="1rem" mt="1rem"> Waiting requests...</${Heading}>

          <${CircleBadge} className="heartBeat animated infinite">
            <${CircleBadge.Icon} icon=${Zap} />
          </${CircleBadge}>
          
        </${Flex}> `
        }
          <${Timeline}>
          ${messages.map(
            (message, index) => html`
               <${Timeline.Item} key="${message.id}">
                    <${Timeline.Badge} bg=${getColorByMethod(message.method)}>
                      <${StyledOcticon} icon=${Flame} color="white"/>
                    </${Timeline.Badge}>
                    <${Timeline.Body}>
                      <${Box} mb="1rem">
                        <${Label}>${message.method}</${Label}>
                        <${BranchName} ml="1rem">${message.path}</${BranchName}>
                      </ ${Box}>
                      ${
                        message.body &&
                        html`<${BorderBox} p="1rem" mr="1rem" bg="white">
                          <h3>Body</h3>
                          <${ObjectInspector}
                            data=${message.body}
                            expandLevel="5"
                        /></${BorderBox}>`
                      }

                      ${
                        message.headers &&
                        html`<${BorderBox} p="1rem" mr="1rem" bg="white">
                           <h3>Headers</h3>
                          <${ObjectInspector}
                            data=${message.headers
                              .split("\r\n")
                              .filter(Boolean)
                              .reduce((acc, str) => {
                                const values = str.split(": ");
                                if (values.length >= 2) {
                                  const [key, ...rest] = values;
                                  acc[key] = rest.join(": ");
                                }
                                return acc;
                              }, {})}
                            expandLevel="5"
                        /></${BorderBox}>`
                      }
                    </${Timeline.Body}>
            </${Timeline.Item} >
            ${messages.length - 1 === index && html`<${Timeline.Break} />`}
            `
          )}
          </${Timeline}>
        </${Box}>
    </${BaseStyles}>
    `;
};

ReactDOM.render(html`<${App} />`, document.getElementById("root"));
