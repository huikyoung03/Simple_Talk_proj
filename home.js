// Home.js
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, Alert } from 'react-native';

// 백엔드 기본 URL 설정. Render에 배포된 주소로 정확히 입력해주세요.
const API_BASE_URL = 'https://simple-gje3.onrender.com';

export default function Home({ navigation }) {
  const [sentence, setSentence] = useState("");

  const handleTranslate = async () => {
    if (!sentence.trim()) {
      Alert.alert("문장을 입력해주세요.");
      return;
    }

    try {
      // 1. (변경됨) 쉬운 한국어 변환 API 호출 (이 API가 모든 정보를 반환하도록 백엔드 수정됨)
      // 이전의 로마자 변환 API 호출 (romanizeResponse)는 삭제합니다.
      const easyKoreanResponse = await fetch(`${API_BASE_URL}/translate-to-easy-korean`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: sentence }),
      });

      if (!easyKoreanResponse.ok) {
        // 서버에서 500 에러 대신 다른 에러 코드를 반환할 수도 있으므로, 상세 에러 메시지를 확인하는 것이 좋습니다.
        const errorText = await easyKoreanResponse.text(); // 에러 응답 본문을 확인
        console.error("쉬운 한국어 변환 API 오류 응답:", errorText);
        throw new Error(`쉬운 한국어 변환 API 오류! 상태 코드: ${easyKoreanResponse.status}. 상세: ${errorText}`);
      }
      const easyKoreanData = await easyKoreanResponse.json();

      let ttsUrl = "";
      // 2. TTS API 호출 (쉬운 한국어 문장으로 TTS 생성)
      // 'main.py'의 generate_tts 함수는 'text'를 인자로 받으므로, 여기서는 쉬운 한국어 문장을 사용합니다.
      try {
        const speakResponse = await fetch(`${API_BASE_URL}/speak`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          // TTS는 변환된 쉬운 한국어 문장(easyKoreanData.translated_text)으로 요청하는 것이 자연스럽습니다.
          body: `text=${encodeURIComponent(easyKoreanData.translated_text || "")}`,
        });

        if (speakResponse.ok) {
          const speakData = await speakResponse.json();
          ttsUrl = speakData.tts_url;
        } else {
          console.error("TTS API 오류:", speakResponse.status);
          Alert.alert("TTS 오류", "음성 재생 기능을 사용할 수 없습니다.");
        }
      } catch (error) {
        console.error("TTS API 호출 오류:", error);
        Alert.alert("TTS 오류", "음성 재생 기능을 사용할 수 없습니다.");
      }

      // 3. (수정됨) 결과 화면으로 이동
      navigation.navigate("Result", {
        inputSentence: easyKoreanData.original_text, // 원문
        inputPronunciation: easyKoreanData.original_romanized_pronunciation, // 원문 로마자 발음
        inputEnglish: "", // 백엔드에서 원문 영어 번역을 제공하지 않으므로 비워둡니다.
                          // 필요하다면 main.py를 수정하여 original_english_translation 필드를 추가해야 합니다.

        easySentence: easyKoreanData.translated_text, // 쉬운 한국어 문장
        easyPronunciation: easyKoreanData.translated_romanized_pronunciation, // 쉬운 한국어 로마자 발음
        easyEnglish: easyKoreanData.translated_english_translation, // 쉬운 한국어 영어 번역 (수정됨)
        dictionary: easyKoreanData.keyword_dictionary, // 단어 사전 (수정됨)
        ttsUrl: ttsUrl,
      });

    } catch (error) {
      console.error("API 호출 오류:", error);
      Alert.alert("오류", `서버와 통신 중 문제가 발생했습니다: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Simple Talk</Text>
      <TextInput
        style={styles.input}
        placeholder="input your sentence"
        value={sentence}
        onChangeText={setSentence}
        multiline={true}
        textAlignVertical="top"
      />
      <Button
        title="Translate"
        onPress={handleTranslate}
        color="#f8cf01"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 28,
    textAlign: 'left',
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333'
  },
  input: {
    height: 150,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
  },
});
