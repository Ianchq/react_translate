import React, { useEffect, useState } from "react";

const YANDEX_DICTIONARY_API_KEY = "dict.1.1.20261021T080718Z.abacdb6c9d3bbf41.16c931da09e49d94ebe4a1c1d6529c64e160d802";

const doTranslation = (input, languageCode) => {
  return new Promise((resolve, reject) => {
    const callbackName = `yandexDictionaryCallback${Date.now()}${Math.floor(
      Math.random() * 1000
    )}`;
    const params = new URLSearchParams({
      key: YANDEX_DICTIONARY_API_KEY,
      lang: `ru-${languageCode}`,
      text: input,
      callback: callbackName
    });
    const script = document.createElement("script");
    let finished = false;

    const cleanUp = () => {
      finished = true;
      delete window[callbackName];
      script.remove();
    };

    window[callbackName] = data => {
      const translation =
        data && data.def && data.def[0] && data.def[0].tr && data.def[0].tr[0]
          ? data.def[0].tr[0].text
          : "";
      cleanUp();
      resolve(translation);
    };

    script.onerror = () => {
      if (!finished) {
        cleanUp();
        reject(new Error("Не удалось обратиться к Yandex Dictionary API"));
      }
    };

    script.src = `https://dictionary.yandex.net/api/v1/dicservice.json/lookup?${params}`;
    document.body.appendChild(script);

    return cleanUp;
  });
};

export default function Translate({ language, text }) {
  const [translated, setTranslated] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (!text) {
      setTranslated("");
      return () => {
        cancelled = true;
      };
    }

    setTranslated("");
    doTranslation(text, language)
      .then(result => {
        if (!cancelled) setTranslated(result);
      })
      .catch(() => {
        if (!cancelled) setTranslated("Перевод не найден или API-ключ недействителен");
      });

    return () => {
      cancelled = true;
    };
  }, [text, language]);

  return (
    <div>
      <label className="label">Перевод</label>
      <h1 className="title">{translated}</h1>
      <small>
        Реализовано с помощью сервиса{" "}
        <a href="https://api.yandex.ru/dictionary/" target="_blank" rel="noreferrer">
          API Яндекс.Словарь
        </a>
      </small>
    </div>
  );
}
