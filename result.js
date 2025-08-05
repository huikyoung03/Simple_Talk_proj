// Result.js

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import Sound from 'react-native-sound';

export default function Result({ route }) {
  const {
    inputSentence = "입력 문장이 없습니다.",
    inputPronunciation = "입력 문장 발음 정보 없음",
    easySentence = "쉬운 한국어 문장이 없습니다.",
    easyPronunciation = "쉬운 문장 발음 정보 없음",
    easyEnglish = "쉬운 한국어 영어 번역 정보 없음.",
    dictionary = [],
  } = route.params || {};

  // 서버에서 tts_url(JSON)을 받아오고, 해당 URL을 Sound로 스트리밍 재생
  const playFromText = (textToSpeak) => {
    fetch("https://simpletalk-970.onrender.com/speak", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `text=${encodeURIComponent(textToSpeak)}`,
    })
    .then(async (res) => {
      if (!res.ok) {
        // res.ok가 false(404, 503 등)라면, 먼저 res.text()로 응답을 문자열로 읽어 온 다음
        const raw = await res.text();
        let errMsg = raw;
        try {
          // raw가 {"error":"..."} 같은 JSON 문자열이면 파싱해서
          const parsed = JSON.parse(raw);
          errMsg = parsed.error || JSON.stringify(parsed);
        } catch {
          // JSON 파싱이 안 되면 raw 그대로(errMsg=raw)
        }
        return Promise.reject(errMsg);
      }
      // status가 OK(200~299)이면 res.json()
      return res.json();
    })
    .then((json) => {
      const url = json.tts_url;
      if (!url) {
        Alert.alert("오류", "TTS URL을 가져오지 못했습니다.");
        return;
      }
      const sound = new Sound(url, "", (error) => {
        if (error) {
          console.log("Sound 로드 오류:", error);
          Alert.alert("오류", "음성 재생에 실패했습니다.");
          return;
        }
        sound.play((success) => {
          if (!success) {
            console.log("Sound 재생 중 오류");
          }
        });
      });
    })
    .catch((err) => {
      console.error("TTS 요청 에러:", err);
      Alert.alert("오류", `TTS 요청 실패: ${err}`);
    });
  };


  // 입력 문장 발음 재생
  const handlePlayInputTTS = () => {
    if (inputPronunciation && inputPronunciation !== "입력 문장 발음 정보 없음") {
      playFromText(inputPronunciation);
    } else {
      Alert.alert("알림", "입력 문장의 발음 정보가 없습니다.");
    }
  };

  // 쉬운 문장 발음 재생
  const handlePlayEasyTTS = () => {
    if (easyPronunciation && easyPronunciation !== "쉬운 문장 발음 정보 없음") {
      playFromText(easyPronunciation);
    } else {
      Alert.alert("알림", "쉬운 문장의 발음 정보가 없습니다.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* 입력 문장 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Input Sentence</Text>
        <Text style={styles.contentText}>{inputSentence}</Text>

        <Text style={styles.label}>Pronunciation</Text>
        <TouchableOpacity style={styles.ttsButton} onPress={handlePlayInputTTS}>
          <Text style={styles.ttsText}>🔊 {inputPronunciation}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {/* 쉬운 문장 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Easy Sentence</Text>
        <Text style={styles.contentText}>{easySentence}</Text>

        <Text style={styles.label}>Pronunciation</Text>
        <TouchableOpacity style={styles.ttsButton} onPress={handlePlayEasyTTS}>
          <Text style={styles.ttsText}>🔊 {easyPronunciation}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>English Sentence</Text>
        <Text style={styles.contentText}>
          {easyEnglish || "영어 번역 정보 없음"}
        </Text>
      </View>

      <View style={styles.divider} />

      {/* 단어 사전 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Word Dictionary</Text>
        {dictionary && dictionary.length > 0 ? (
          dictionary.map((item, index) => (
            <View key={index} style={styles.wordCard}>
              <Text style={styles.word}>
                {String(item.word)} ({String(item.pos)})
              </Text>
              {item.definitions && item.definitions.length > 0 ? (
                item.definitions.map((defObj, defIndex) => (
                  <Text key={defIndex} style={styles.meaning}>
                    {String(defObj.definition)}
                  </Text>
                ))
              ) : (
                <Text style={styles.meaning}>뜻풀이 없음</Text>
              )}
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>단어 정보가 없습니다.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#f8cf01",
  },
  contentText: { fontSize: 16, marginBottom: 8, color: "#333" },
  label: { fontSize: 15, fontWeight: "600", marginTop: 10, color: "#555" },
  ttsButton: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginVertical: 5,
    alignItems: "center",
  },
  ttsText: { fontSize: 16, color: "#333" },
  wordCard: {
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  word: { fontSize: 16, fontWeight: "bold", color: "#333" },
  meaning: { fontSize: 14, color: "#555", marginTop: 4 },
  divider: {
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    marginVertical: 20,
  },
  noDataText: { fontSize: 15, color: "#777", textAlign: "center", marginTop: 10 },
});
