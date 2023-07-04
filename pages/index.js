import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [msgInput, setMsgInput] = useState("user: ");
  const [result, setResult] = useState([]);

  async function onSubmit(event) {
    event.preventDefault();

    try {
      setResult(["Sending request..."])
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: msgInput }),
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
          {result.map(x => (x.startsWith("- ") ? <li>{x.substring(2)}</li> : <p>{x}</p>))}
        </div>
      </main>
    </div>
  );
}

function splitContent(content) {
  return content.split("\n");
}
