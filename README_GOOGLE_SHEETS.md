# 구글 스프레드시트 연동 및 이메일 실시간 알림 가이드

비즈니스 북클럽 홈페이지의 가입 신청서 데이터를 **구글 스프레드시트**에 자동으로 누적하고, 신청 발생 시 **관리자(대표님)에게 즉각 이메일로 알림**을 발송해 주는 Google Apps Script 세팅 방법입니다.

---

## 1단계. 구글 스프레드시트 생성 및 스크립트 작성
1. [구글 드라이브](https://drive.google.com/) 또는 [구글 시트](https://sheets.google.com/)에 접속하여 **새 스프레드시트**를 만듭니다.
2. 스프레드시트 상단 메뉴에서 **확장 프로그램 (Extensions) > Apps Script**를 선택합니다.
3. 기존에 적혀있는 기본 코드를 완전히 지우고, 아래의 **전체 코드**를 복사해서 붙여넣습니다.

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // 첫 번째 행에 머리글(헤더)이 비어 있다면 자동으로 생성합니다.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["이름", "연락처", "이메일", "회사 및 직책", "선택 코스", "등록 일시"]);
  }
  
  try {
    var data = JSON.parse(e.postData.contents);
    
    // 데이터 추가
    sheet.appendRow([
      data.name,
      data.phone,
      data.email,
      data.company + " (" + data.role + ")",
      data.plan,
      data.timestamp || new Date().toLocaleString("ko-KR")
    ]);
    
    // -------------------------------------------------------------
    // ★ 이메일 알림 수신자 주소 설정
    // -------------------------------------------------------------
    var adminEmail = "YOUR_EMAIL_HERE@example.com"; // ◀ 알림 메일을 수신할 실제 이메일 주소를 입력해 주세요.
    // -------------------------------------------------------------
    
    var subject = "[비즈니스 북클럽] 새 멤버십 가입 신청 알림 - " + data.name + " 님";
    var body = "새로운 멤버십 가입 신청이 접수되었습니다.\n\n" +
               "■ 이름: " + data.name + "\n" +
               "■ 연락처: " + data.phone + "\n" +
               "■ 이메일: " + data.email + "\n" +
               "■ 회사 및 직책: " + data.company + " (" + data.role + ")\n" +
               "■ 선택 코스: " + data.plan + "\n" +
               "■ 신청 일시: " + (data.timestamp || new Date().toLocaleString("ko-KR")) + "\n\n" +
               "구글 스프레드시트에서 전체 리스트를 확인하실 수 있습니다.";
               
    if (adminEmail && adminEmail.indexOf("YOUR_EMAIL") === -1) {
      MailApp.sendEmail(adminEmail, subject, body);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader("Access-Control-Allow-Origin", "*");
  }
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var data = [];
  
  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    
    var companyAndRole = row[3] || "";
    var company = companyAndRole;
    var role = "";
    var match = companyAndRole.match(/(.+)\s*\((.+)\)/);
    if (match) {
      company = match[1].trim();
      role = match[2].trim();
    }
    
    data.push({
      name: row[0],
      phone: row[1],
      email: row[2],
      company: company,
      role: role,
      plan: row[4],
      timestamp: row[5]
    });
  }
  
  data.reverse(); // 최신 등록 순 정렬
  
  return ContentService.createTextOutput(JSON.stringify({ result: "success", data: data }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setHeader("Access-Control-Allow-Origin", "*")
    .setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
    .setHeader("Access-Control-Allow-Headers", "Content-Type");
}
```

4. 코드 중간의 `var adminEmail = "YOUR_EMAIL_HERE@example.com";` 부분의 메일 주소를 알림을 받으실 **대표님 본인 혹은 담당자의 메일 주소**로 바꿉니다.
5. 상단 디스크 아이콘 또는 `Ctrl+S` / `Cmd+S` 를 눌러 스크립트를 **저장**합니다.

---

## 2단계. 웹 앱(Web App)으로 배포
1. Apps Script 창 우측 상단의 주황색 **배포 (Deploy) > 새 배포 (New deployment)**를 클릭합니다.
2. 유형 선택 톱니바퀴 아이콘을 누르고 **웹 앱 (Web app)**을 지정합니다.
3. 설정을 다음과 같이 기입합니다:
   * **설명**: `비즈니스 북클럽 데이터 연동`
   * **웹 앱을 실행할 사용자**: **나 (대표님 구글 계정)**
   * **액세스 권한이 있는 사용자**: **모든 사용자 (Anyone)** (누구나 양식을 통해 서버로 신청을 보낼 수 있어야 하므로 중요합니다)
4. 하단의 **배포 (Deploy)** 버튼을 누릅니다.
5. 최초 실행 시 구글 계정의 권한 승인이 필요할 수 있습니다. **권한 검토 (Review Permissions)**를 클릭하고 본인의 구글 계정을 선택한 후, 'Advanced' 링크를 누르고 **'Go to 무제 프로젝트 (unsafe)'** 또는 **'허용 (Allow)'**을 차례대로 클릭해 줍니다.
6. 배포가 완료되면 생성된 **웹 앱 URL**이 화면에 출력됩니다. 해당 URL을 복제해 둡니다.
   *(URL 형식 예시: `https://script.google.com/macros/s/AKfycbz.../exec`)*

---

## 3단계. 홈페이지(소스코드)에 URL 적용하기
웹사이트의 모든 방문자 환경에서 제출이 구글 시트로 들어가게 하려면 소스코드에 해당 URL을 저장해야 합니다.

1. **`app.js` 파일 열기**:
   - `app.js` 최상단 (약 5번째 줄)에 위치한 아래 설정을 찾습니다:
     ```javascript
     const GOOGLE_SCRIPT_URL = localStorage.getItem('bbc_google_script_url') || '';
     ```
   - 이 부분을 방금 복사해 둔 구글 웹 앱 URL을 빈 값 대신 직접 대입하도록 아래처럼 바꿉니다:
     ```javascript
     const GOOGLE_SCRIPT_URL = localStorage.getItem('bbc_google_script_url') || '복사한_구글_웹앱_URL';
     ```
2. **저장 및 빌드**:
   - 수정 완료 후 터미널에서 단일 파일 컴파일 스크립트(`ruby bundle.rb`)를 1회 실행하여 `index_single.html`에 코드를 임베딩해 줍니다.
   - 변경된 코드를 Git에 커밋하여 Push(배포)해 줍니다.

---

## 4단계. 홈페이지 관리자 대시보드에서 간편 테스트
1. 홈페이지 우측 상단 **관리자 로그인**을 클릭하여 관리자 대시보드로 이동합니다.
2. **신청 예약자 명단** 탭으로 이동합니다.
3. 화면의 **🔗 구글 스프레드시트 실시간 연동 설정** 상자에 방금 복사해 두었던 구글 웹 앱 URL을 붙여넣고 **[설정 저장 & 적용]**을 누릅니다. (관리자 브라우저에 임시 세팅됩니다)
4. 이제 메인 화면으로 돌아가 **멤버십 가입 신청서** 양식을 적고 테스트 제출을 진행합니다.
5. 구글 스프레드시트에 즉시 기록이 추가되고, 지정하신 메일 주소로 알림 메일이 도착하는지 확인합니다!
6. 관리자 화면의 예약자 탭을 열어보면, 구글 시트에 있는 정보가 초록색 **`시트`** 배지를 달고 관리자 대시보드 테이블에 실시간으로 표시됩니다.
