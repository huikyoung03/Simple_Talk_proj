# 공식 Python 3.10 이미지를 기본으로 사용 (Konlpy는 Python 3.10까지 안정적)
FROM python:3.10-slim-buster

# 빌드 전 패키지 목록 업데이트 및 OpenJDK 11 설치 (Konlpy는 OpenJDK 11과 잘 호환)
# OpenJDK 17도 가능하지만, 11이 좀 더 널리 사용되고 안정적일 수 있습니다.
RUN apt-get update && apt-get install -y openjdk-11-jdk && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# JAVA_HOME 환경 변수 설정 (Konlpy가 JVM을 찾을 수 있도록)
ENV JAVA_HOME="/usr/lib/jvm/java-11-openjdk-amd64"
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# 작업 디렉토리 설정
WORKDIR /app

# requirements.txt 파일을 복사
COPY requirements.txt .

# Python 의존성 설치
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 포트 노출 (FastAPI 기본 포트 8000)
EXPOSE 8000

# FastAPI 앱 실행 명령어
# Render는 $PORT 환경 변수를 자동으로 주입하므로, 0.0.0.0:$PORT 로 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
# Render가 자동으로 포트를 할당하면 Render에서 설정한 PORT 환경변수 사용
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "${PORT}"]