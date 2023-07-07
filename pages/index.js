import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import SyntaxHighlighter from 'react-syntax-highlighter';
//import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

export default function Home() {
  const [msgInput, setMsgInput] = useState("user: ");
  const [result, setResult] = useState([]);

  async function onSubmit(event) {
    event.preventDefault();

    let model = "gpt-3.5-turbo";

    try {
      setResult(["Sending request..."])
      const startDate = new Date();
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: msgInput, model }),
      });

      const data = await response.json();
      const endDate = new Date();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      const durationMessage = `(Got response from ${model} in ${endDate - startDate} ms)`;
      setResult([durationMessage, ...splitContent(data.message.content)]);
      //setMsgInput(msgInput + "\n\n" + data.message.role + ":\n" + data.message.content );
    } catch(error) {
      console.error(error);
      setResult(["ERROR", JSON.stringify(error)]);
    }
  }

  function stringsToDomElems(strings) {
    let result = [];
    let code = null;
    let lang = null;
    strings.forEach(str => {
      if (str.startsWith('```')) {
        if (code == null) {
          code = ""; // start code block
          lang = str.sub(3);
        } else {
          //result.push(<pre className={styles.code}>{code}</pre>)
          result.push(<SyntaxHighlighter language={lang}>{code}</SyntaxHighlighter>)
          code = null; // finish code block
        }
      } else {
        if (code == null) {
          if (str.startsWith('- ')) {
            result.push(<li>{str.substring(2)}</li>);
          } else if (str.startsWith('- ')) {
            result.push(<li>{str.substring(2)}</li>);
          } else if (str.startsWith('(') && str.endsWith(')')) { // for durationMessage
            result.push(<p className={styles.comment}>{str}</p>);
          } else {
            result.push(<p>{str}</p>);
          }
        } else {
          code += str + "\n"; // building code block
        }
      }
    })
    return result;
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel="icon" href="/dog.png" />
      </Head>

      <main className={styles.main}>
        <form onSubmit={onSubmit}>
          <textarea
            name="msg"
            rows="10"
            placeholder="Message"
            value={msgInput}
            onChange={(e) => setMsgInput(e.target.value)}
          />
          <input type="submit" value="Send" />
        </form>
        <div className={styles.result}>
          {stringsToDomElems(result)}
        </div>
      </main>
    </div>
  );
}

function splitContent(content) {
  return content.split("\n");
}
