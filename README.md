# IAN AX 연구소 홈페이지

IAN AX 연구소의 AX 교육 및 AX 컨설팅 소개용 정적 홈페이지입니다.

## 구성

- `index.html`: 홈페이지 본문
- `styles.css`: 반응형 스타일
- `script.js`: 모바일 메뉴 및 문의 폼 동작
- `assets/hero-training.png`: 메인 비주얼 이미지

## GitHub Pages 배포

1. GitHub에서 새 repository를 만듭니다.
2. 이 폴더 안의 파일들을 repository 루트에 업로드합니다.
3. GitHub repository의 `Settings > Pages`에서 배포 소스를 설정합니다.
4. `main` 브랜치의 `/root`를 선택하면 `index.html`이 홈페이지로 열립니다.

## Vercel 배포

이 홈페이지는 정적 사이트라 Vercel에서 별도 빌드 없이 배포할 수 있습니다.

### 웹에서 배포

1. 이 폴더를 GitHub repository에 업로드합니다.
2. [Vercel](https://vercel.com)에서 `Add New Project`를 선택합니다.
3. 업로드한 GitHub repository를 import합니다.
4. Framework Preset은 `Other` 또는 자동 감지 그대로 둡니다.
5. Build Command는 비워두고, Output Directory도 비워둡니다.
6. Deploy를 누릅니다.

### 터미널에서 배포

Node.js가 설치되어 있다면 아래 명령으로 배포할 수 있습니다.

```bash
cd /Users/sunheeheo/Documents/Codex/2026-06-03/new-chat/outputs/corporate-education-homepage
./deploy-to-vercel.sh
```

직접 실행하고 싶다면 아래 명령도 가능합니다.

```bash
npx vercel --prod
```

## 문의 폼을 Google Sheets에 연결하기

현재 문의 폼은 Google Apps Script 웹앱 URL을 넣으면 Google Sheets로 전송되도록 준비되어 있습니다.

`index.html`에서 아래 부분의 빈 값을 Apps Script 웹앱 URL로 바꾸면 됩니다.

```html
<form class="contact-form" data-contact-form data-google-sheet-url="">
```

예시:

```html
<form class="contact-form" data-contact-form data-google-sheet-url="https://script.google.com/macros/s/DEPLOYMENT_ID/exec">
```

## Google Apps Script 예시

스프레드시트에서 `확장 프로그램 > Apps Script`를 열고 아래 코드를 붙여 넣은 뒤 웹 앱으로 배포합니다.

```javascript
function parseRequestData(e) {
  if (e && e.parameter && Object.keys(e.parameter).length > 0) {
    return e.parameter;
  }

  if (e && e.postData && e.postData.contents) {
    return e.postData.contents.split("&").reduce(function (acc, pair) {
      var parts = pair.split("=");
      var key = decodeURIComponent((parts[0] || "").replace(/\+/g, " "));
      var value = decodeURIComponent((parts[1] || "").replace(/\+/g, " "));

      if (key) {
        acc[key] = value;
      }

      return acc;
    }, {});
  }

  return {};
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = parseRequestData(e);

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.company || "",
    data.phone || "",
    data.email || "",
    data.topic || "",
    data.message || "",
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function testDoPost() {
  return doPost({
    parameter: {
      name: "테스트 담당자",
      company: "테스트 회사",
      phone: "010-0000-0000",
      email: "test@example.com",
      topic: "테스트 문의",
      message: "Apps Script 테스트 입력입니다.",
    },
  });
}
```

스프레드시트 첫 행은 아래처럼 만들면 관리하기 좋습니다.

```text
접수일시 | 담당자명 | 회사명 | 연락처 | 이메일주소 | 문의주제 | 문의내용
```
