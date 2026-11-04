/* ==========================================================================
   Campus Archive — 프로젝트 데이터 및 기능 스크립트
   ========================================================================== */

/* ==========================================================================
   [프로젝트 데이터 관리 안내]
   새 프로젝트를 추가하거나 수정할 때는 아래 projects 배열을 편집하세요.
   
   각 프로젝트 항목 형식:
   {
     title: "프로젝트 제목",
     category: "course" | "team" | "ai-data" | "etc",
               * course: 수업 과제
               * team: 팀 프로젝트
               * ai-data: 데이터·AI·개발
               * etc: 기타
     date: "YYYY-MM-DD",     // 정렬 기준일
     description: "프로젝트에 대한 2~3줄 요약 설명",
     image: "assets/이미지명.jpg", // 없으면 null 또는 "" (단색 배경 자동 적용)
     file: "assets/자료명.pdf",   // 없으면 null 또는 "" (버튼이 표시되지 않음)
     fileType: "pdf" | "file",   // pdf면 'PDF 보기', 그 외는 '파일 다운로드'
     isSample: true              // 예시 프로젝트는 true, 실제 본인 자료는 false
   }
   ========================================================================== */

const projects = [
  {
    title: "현대 한국어 담화 표지의 의미론적 기능 분석",
    category: "course",
    date: "2026-10-15",
    description: "국어국문학 전공 '한국어의미론' 수업 과제로, 구어 담화에서 '근데', '있잖아', '사실' 등의 담화 표지가 대화 맥락과 화자의 태도에 미치는 화용적 기능을 체계적으로 분석했습니다.",
    image: "assets/project-semantics.svg",
    file: "assets/sample-semantics.pdf",
    fileType: "pdf",
    isSample: true
  },
  {
    title: "대학 상권 분석 및 로컬 브랜딩 마케팅 전략",
    category: "team",
    date: "2026-09-28",
    description: "경영학 전공 '마케팅원론' 팀 프로젝트로 춘천 대학가 일대의 유동인구와 소비 성향을 조사하고, 소상공인 공간을 활용한 청년 문화 팝업 스토어 브랜딩 전략을 기획했습니다.",
    image: "assets/project-marketing.svg",
    file: null, // 첨부파일이 없는 샘플: 깨진 버튼을 생성하지 않음
    fileType: null,
    isSample: true
  },
  {
    title: "한국 근대 소설 코퍼스 기반 형태소 및 감성 어휘 분석",
    category: "ai-data",
    date: "2026-10-30",
    description: "국어국문학과 데이터 분석의 융합 실습으로, Python과 KoNLPy 형태소 분석기를 활용해 1920~30년대 단편소설 속 감성 어휘의 출현 빈도와 변화 양상을 계량적으로 탐색했습니다.",
    image: "assets/project-textmining.svg",
    file: "assets/sample-textmining.pdf",
    fileType: "pdf",
    isSample: true
  }
];

/* ==========================================================================
   화면 렌더링 및 인터랙션 로직
   ========================================================================== */

const CATEGORY_MAP = {
  course: "수업 과제",
  team: "팀 프로젝트",
  "ai-data": "데이터·AI·개발",
  etc: "기타"
};

// DOM 요소
const container = document.getElementById("projects-container");
const searchInput = document.getElementById("search-input");
const sortSelect = document.getElementById("sort-select");
const filterButtons = document.querySelectorAll(".filter-btn");
const resultsCountEl = document.getElementById("results-count");
const noResultsEl = document.getElementById("no-results");
const resetFilterBtn = document.getElementById("reset-filter-btn");

// 현재 필터 상태
let currentCategory = "all";
let searchQuery = "";
let currentSort = "latest";

// 카드 HTML 생성 함수
function createCardElement(project) {
  const card = document.createElement("article");
  card.className = "card";

  const categoryName = CATEGORY_MAP[project.category] || "기타";
  const dateFormatted = project.date.replace(/-/g, ".");

  // 이미지 영역 (없으면 플레이스홀더)
  let mediaHtml = "";
  if (project.image) {
    mediaHtml = `
      <div class="card-media">
        <img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-media-placeholder\\'>이미지 없음</div>'">
        ${project.isSample ? '<span class="badge-sample">예시</span>' : ""}
      </div>
    `;
  } else {
    mediaHtml = `
      <div class="card-media">
        <div class="card-media-placeholder">${escapeHtml(categoryName)}</div>
        ${project.isSample ? '<span class="badge-sample">예시</span>' : ""}
      </div>
    `;
  }

  // 액션 버튼 영역 (파일이 있을 때만 노출)
  let actionsHtml = "";
  if (project.file) {
    const isPdf = project.fileType === "pdf" || project.file.toLowerCase().endsWith(".pdf");
    if (isPdf) {
      actionsHtml = `
        <div class="card-actions">
          <a href="${escapeHtml(project.file)}" target="_blank" rel="noopener noreferrer" class="btn-action btn-pdf">
            PDF 보기 ↗
          </a>
          <a href="${escapeHtml(project.file)}" download class="btn-action btn-download">
            다운로드
          </a>
        </div>
      `;
    } else {
      actionsHtml = `
        <div class="card-actions">
          <a href="${escapeHtml(project.file)}" download class="btn-action btn-download">
            파일 다운로드
          </a>
        </div>
      `;
    }
  }

  card.innerHTML = `
    ${mediaHtml}
    <div class="card-content">
      <div class="card-meta">
        <span class="card-category">${escapeHtml(categoryName)}</span>
        <time class="card-date" datetime="${escapeHtml(project.date)}">${escapeHtml(dateFormatted)}</time>
      </div>
      <h3 class="card-title">${escapeHtml(project.title)}</h3>
      <p class="card-desc">${escapeHtml(project.description)}</p>
      ${actionsHtml}
    </div>
  `;

  return card;
}

// XSS 방지용 간단한 이스케이프
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 필터링 및 정렬 처리
function renderProjects() {
  const query = searchQuery.trim().toLowerCase();

  // 1. 필터링
  const filtered = projects.filter((item) => {
    const matchCategory = currentCategory === "all" || item.category === currentCategory;
    const matchSearch =
      query === "" ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchCategory && matchSearch;
  });

  // 2. 정렬
  filtered.sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();

    if (currentSort === "latest") {
      if (timeB !== timeA) return timeB - timeA;
      return a.title.localeCompare(b.title, "ko");
    } else {
      if (timeA !== timeB) return timeA - timeB;
      return a.title.localeCompare(b.title, "ko");
    }
  });

  // 3. DOM 갱신
  container.innerHTML = "";

  if (filtered.length === 0) {
    noResultsEl.hidden = false;
    resultsCountEl.textContent = "0개 결과";
  } else {
    noResultsEl.hidden = true;
    resultsCountEl.textContent = `${filtered.length}개 표시 (전체 ${projects.length}개)`;

    filtered.forEach((project) => {
      container.appendChild(createCardElement(project));
    });
  }
}

// 이벤트 리스너 등록
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentCategory = btn.getAttribute("data-category") || "all";
    renderProjects();
  });
});

searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value;
  renderProjects();
});

sortSelect.addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderProjects();
});

if (resetFilterBtn) {
  resetFilterBtn.addEventListener("click", () => {
    currentCategory = "all";
    searchQuery = "";
    currentSort = "latest";

    searchInput.value = "";
    sortSelect.value = "latest";

    filterButtons.forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-category") === "all");
    });

    renderProjects();
  });
}

// 최초 실행
renderProjects();

