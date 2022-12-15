"use client";

import Link from "next/link";
import { MouseEvent, useCallback, useEffect, useState } from "react";
import useSWR from "swr";
import GitHubIcon from "@mui/icons-material/GitHub";
import { LoadingButton } from "@mui/lab";

type TweetData = {
  text: string | null | undefined;
};

const HomePage = () => {
  const [user, setUser] = useState<string>("");
  const [question, setQuestion] = useState<string>("");
  const [tweets, setTweets] = useState<TweetData[]>([]);
  const [loadingTweets, setLoadingTweets] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [loadedTweets, setLoadedTweets] = useState(false);
  const [answer, setAnswer] = useState<string>("");
  const [noUserError, setNoUserError] = useState(false);
  const [noQuestionError, setNoQuestionError] = useState(false);
  const [showTweets, setShowTweets] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setUser("");
    setQuestion("");
    setTweets([]);
    setAnswer("");
  }, []);

  const handleClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowTweets(true);
    setShowAnswer(false);

    if (user === "") {
      setNoUserError(true);
      return;
    } else {
      setNoUserError(false);
    }
    setLoadingTweets(true);

    const results = await fetch("/api/user/tweets", {
      method: "POST",
      body: JSON.stringify({
        user,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    setTweets(results.data.data);
    setLoadingTweets(false);
    setLoadedTweets(true);
  };

  const handleSecondClick = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("clicked button second");
    setShowTweets(false);
    setShowAnswer(true);

    if (question === "") {
      setNoQuestionError(true);
      return;
    } else {
      setNoQuestionError(false);
    }
    setLoadingData(true);

    const prompt = `you are given some tweets below, read these tweets : \n
    ${tweets.map((tweet) => tweet.text + "\n")}

    and about the person who wrote those Tweets ${question}
    `;

    const results = await fetch("/api/user/ai", {
      method: "POST",
      body: JSON.stringify({
        prompt,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());

    setAnswer(results.result.choices[0].text);
    setLoadingData(false);
  };

  let noTweets = tweets?.length < 1;

  return (
    <>
      <div className="flex items-center gap-5">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={user}
            onChange={(e) => {
              setUser(e.target.value);
              setAnswer("");
              setTweets([]);
            }}
            className="bg-white placeholder:text-gray-400 placeholder:text-lg border-none outline-none p-2"
            placeholder="username"
          />
          {noUserError && (
            <p className="text-red-600 text-md">Username can't be empty bro!</p>
          )}
          {loadedTweets && !tweets && (
            <p className="text-red-600 text-md">username wrong</p>
          )}
        </div>
        <LoadingButton
          onClick={handleClick}
          className="p-2 border-white border px-4 bg-white text-black"
          loading={loadingTweets}
          variant="contained"
        >
          Submit
        </LoadingButton>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-white placeholder:text-gray-400 placeholder:text-lg border-none outline-none p-2"
            placeholder="question"
          />
          {noQuestionError && (
            <p className="text-red-600 text-md">Question can't be empty bro!</p>
          )}
        </div>

        <div className="relative group">
          <span
            className={`absolute bg-white text-yellow text-xs p-1 -bottom-[4rem] hidden ${
              noTweets && "group-hover:block"
            }`}
          >
            Get tweets first bro!
          </span>
          <LoadingButton
            onClick={handleSecondClick}
            className={`p-2 border-white border px-4 bg-white text-black
            ${noTweets && "bg-red-500 text-black cursor-not-allowed"}`}
            loading={loadingData}
            variant="contained"
          >
            give data
          </LoadingButton>
        </div>
      </div>

      {tweets &&
        tweets.map((tweet) => (
          <p
            className={`text-yellow-500 mt-2 font-bold text-2xl p-2 bg-gray-100 ${
              !showTweets && "hidden"
            }`}
            key={tweet.text}
          >
            {tweet.text}
          </p>
        ))}

      <br />
      <br />
      <br />
      <br />

      <Link href="https://github.com/Aadarsh805/metaTweet.ai">
        <div className="gap-2 inline-flex items-center justify-center h-10 px-3 text-xs bg-transparent text-white border border-gray-5 hover:bg-gray-4 hover:border-gray-4">
          <GitHubIcon fontSize="small" />
          <span className="text-[.9rem]">Star us on github</span>
        </div>
      </Link>

      {answer && (
        <p
          className={`text-yellow-500 mt-2 font-bold text-2xl p-2 bg-gray-100 ${
            !showAnswer && "hidden"
          }`}
        >
          {answer?.split(/\d+\./).map((string, i) => (
            <li className="flex" key={i}>
              {i + 1 + ")"} {string}
            </li>
          ))}
        </p>
      )}
    </>
  );
};

export default HomePage;
