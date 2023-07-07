import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [msgInput, setMsgInput] = useState("user: ");
  const [result, setResult] = useState([]);

  async function onSubmit(event) {
    event.preventDefault();

    let model = "gpt-3.5-turbo";

    try {
      setResult(["Sending request..."])
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: msgInput, model }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(splitContent(data.message.content));
      setMsgInput(msgInput + "\n\n" + data.message.role + ":\n" + data.message.content );
    } catch(error) {
      console.error(error);
      setResult(["ERROR", JSON.stringify(error)]);
    }
  }

  function stringsToDomElems(strings) {
    let result = [];
    let code = null;
    strings.forEach(str => {
      if (str.startsWith('- ')) {
        result.push(<li>{str.substring(2)}</li>);
      } else if (str.startsWith('- ')) {
        result.push(<li>{str.substring(2)}</li>);
      } else if (str.startsWith('```')) {
        if (code == null) {
          code = ""; // start code block
        } else {
          result.push(<pre className={styles.code}>{code}</pre>)
          code = null; // finish code block
        }
      } else {
        if (code == null) {
          result.push(<p>{str}</p>);
        } else {
          code += str + "\n"; // building code block
        }
      }
    })
    return result;
  }

  return (
    <div className={styles.full}>
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
