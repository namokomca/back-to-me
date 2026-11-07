# 복직 온보딩

한 사람이 맡던 돌봄과 집안일을, 두 사람이 출근한 뒤에도 함께 이어가도록 돕는 생활 분담 수첩입니다.

- 서비스: https://back-to-me-rose.vercel.app/
- vooy 레시피: https://app.vooy.com/ko/recipes/4fe9b659-cf76-48bc-ae77-ebdfc00d906c?tab=intro
- MCP 주소: https://back-to-me-rose.vercel.app/api/mcp

## 동작하는 기능

- 두 보호자의 근무시간과 직접 입력한 이동시간을 기준으로 등하원 담당과 공백 계산
- 식사, 세탁, 등원 준비 등 생활 할 일 추가, 담당 지정, 완료 기록
- 가능한 시간 안에서 미정 담당 제안. 이미 정한 담당은 유지하고 시간 부족은 미정으로 표시
- 대체 돌봄 확인 상태와 인계 메모, 물건 위치 기록
- 시간표와 생활 목록을 OpenAI에 보내 오늘 조율할 일 제안
- 이름과 주소, 인계/비상 메모를 제외한 요약을 확인하고 vooy에 직접 복사
- 직무별 가상 업무를 활용한 AI 연습과 피드백

기록은 현재 브라우저의 localStorage에 저장합니다. 다른 기기나 배우자 계정과 자동 공유하지 않습니다. vooy의 답변도 앱에 자동 반영하지 않습니다. 지도 자동 길찾기와 자동 알림은 미구현입니다.

## MCP 도구

가족 저장소를 갖지 않는 무상태 계산·예시 도구입니다. 네 도구 모두 실제 일정을 저장하거나 외부 메시지를 보내지 않습니다.

| 도구 | 기능 |
| --- | --- |
| plan_family_handoff | 입력한 근무·이동시간으로 평일 등하원 계산 |
| plan_household_tasks | 생활 할 일과 가능한 분으로 담당 제안 |
| get_return_checklist | 생활 및 복직 준비의 예시 목록 |
| get_role_practice | 직무별 10분 가상 업무 연습 |

## 실행

Node.js 22 이상과 pnpm을 사용합니다.

```sh
pnpm install
pnpm build
pnpm start
```

개발 모드는 `pnpm dev`입니다. Vercel은 `build/`를 정적 파일로 제공하고 `api/`를 Functions로 배포합니다.

OpenAI 키는 Vercel Production의 Secret 환경변수 `OPENAI_API_KEY`로 설정합니다. 로컬에서는 무시된 `.env.local`에 보관합니다. 공개 코드나 `VITE_` 환경변수에 넣지 마세요. 모델 기본값은 `gpt-6-luna`이며 `OPENAI_MODEL`로 변경할 수 있습니다.

## 검증

```sh
node coach-check.mjs
node life-check.mjs
node mcp-check.mjs
pnpm build
```

생활 분담 테스트는 고정 담당 보존, 완료 작업 제외, 시간 부족, 입력 불변성을 확인합니다. MCP 테스트는 공식 SDK 클라이언트로 실제 HTTP 초기화·도구 목록·네 도구 호출을 검증합니다.

## 현재 범위

공개 해커톤 MVP입니다. 이전 Sites 전용 계정 저장 코드는 참고 소스로 남아 있지만 이 Vercel 앱의 계정 동기화 기능은 아닙니다. 사용자 인증과 공용 DB, 지도 키, 배우자 초대는 별도 구현이 필요합니다. 실제 회사 비밀이나 고객 개인정보는 넣지 마세요.

