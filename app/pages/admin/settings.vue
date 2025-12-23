<template>
    <div class="space-y-6">
        <header class="flex justify-between items-center">
            <div>
                <h1 class="text-3xl font-bold text-gray-900">사이트 설정</h1>
                <p class="text-gray-500 mt-1">댓글 정책, 회원가입, OAuth 프로바이더를 관리합니다.</p>
            </div>
            <button
                @click="saveSettings"
                :disabled="saving"
                class="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-sm hover:shadow-md"
            >
                {{ saving ? '저장 중...' : '변경사항 저장' }}
            </button>
        </header>



        <div v-if="loading" class="text-center py-12">
            <div class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
        </div>

        <div v-else class="space-y-6">
            <!-- 사이트 기본 정보 -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">사이트 기본 정보</h3>
                <div class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label for="siteName" class="block text-sm font-medium text-gray-700">사이트 이름</label>
                            <input
                                id="siteName"
                                v-model="settings.site_name"
                                type="text"
                                class="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors sm:text-sm"
                                placeholder="예: 블로그"
                            />
                        </div>
                        <!-- 트위터 계정 -->
                        <div>
                            <label for="twitterSite" class="block text-sm font-medium text-gray-700 mb-1">트위터 계정</label>
                            <div class="relative rounded-md shadow-sm">
                                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span class="text-gray-500 sm:text-sm">@</span>
                                </div>
                                <input
                                    id="twitterSite"
                                    v-model="settings.twitter_site"
                                    type="text"
                                    class="block w-full rounded-md border-gray-300 pl-8 pr-12 focus:border-primary-500 focus:ring-primary-500 sm:text-sm px-4 py-2 border"
                                    placeholder="username"
                                />
                            </div>
                            <p class="mt-1 text-xs text-gray-500">아이디만 입력하세요 (예: blog)</p>
                        </div>
                    </div>
                <!-- 사이트 설명 -->
                <div>
                    <label for="siteDescription" class="block text-sm font-medium text-gray-700 mb-1">사이트 설명</label>
                    <textarea
                        id="siteDescription"
                        v-model="settings.site_description"
                        rows="3"
                        class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 px-4 py-2 border"
                        placeholder="사이트에 대한 간단한 설명을 입력하세요."
                    ></textarea>
                </div>

                <!-- 사이트 타입 -->
                <div>
                    <label for="siteType" class="block text-sm font-medium text-gray-700 mb-1">사이트 종류 (Schema.org)</label>
                    <div class="relative rounded-md shadow-sm">
                        <select
                            id="siteType"
                            v-model="settings.site_type"
                            class="w-full rounded-lg border-gray-300 focus:border-gray-900 focus:ring-gray-900 px-4 py-2 border"
                        >
                            <option value="WebSite">일반 웹사이트 (WebSite)</option>
                            <option value="Blog">블로그 (Blog)</option>
                            <option value="Organization">기업/단체 (Organization)</option>
                            <option value="Person">개인 (Person)</option>
                            <option value="LocalBusiness">지역 비즈니스 (LocalBusiness)</option>
                        </select>
                    </div>
                    <p class="mt-1 text-xs text-gray-500">SEO 구조화 데이터(JSON-LD) 생성 시 사용되는 사이트 타입입니다.</p>
                </div>

                    <div>
                        <label for="siteLogo" class="block text-sm font-medium text-gray-700 mb-2">로고 이미지</label>
                        
                        <div class="flex flex-col gap-4">
                            <!-- URL Input with Upload -->
                            <div class="flex rounded-md shadow-sm">
                                <span class="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
                                    URL
                                </span>
                                <input
                                    id="siteLogo"
                                    v-model="settings.site_logo"
                                    type="text"
                                    class="block w-full flex-1 border border-gray-300 px-4 py-2 focus:border-gray-900 focus:ring-gray-900 sm:text-sm"
                                    placeholder="https://..."
                                />
                                <button 
                                    @click="triggerFileUpload"
                                    class="inline-flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-4 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-gray-900"
                                    type="button"
                                    :disabled="isUploading"
                                >
                                    <svg v-if="isUploading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    <svg v-else xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    {{ isUploading ? '업로드 중...' : '업로드' }}
                                </button>
                                <input
                                    ref="fileInput"
                                    type="file"
                                    class="hidden"
                                    accept="image/*"
                                    @change="handleLogoUpload"
                                />
                            </div>

                            <!-- Preview Area -->
                            <div class="relative group">
                                <div class="absolute -top-3 left-3 bg-white px-1 text-xs font-medium text-gray-500">미리보기</div>
                                <div 
                                    class="border border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center min-h-[160px] transition-colors"
                                    :class="logoBgClass"
                                >
                                    <img
                                        v-if="settings.site_logo"
                                        :src="settings.site_logo"
                                        alt="Logo Preview"
                                        class="max-h-24 w-auto object-contain transition-transform group-hover:scale-105"
                                        @error="handleLogoError"
                                        @load="logoError = false"
                                        v-show="!logoError"
                                    />
                                    <div v-else class="text-gray-400 text-sm flex flex-col items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 mb-2 opacity-50"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                                        이미지 URL을 입력하면 미리보기가 표시됩니다
                                    </div>

                                    <div v-if="logoError && settings.site_logo" class="text-red-500 text-sm flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" /></svg>
                                        이미지를 불러올 수 없습니다
                                    </div>
                                </div>

                                <!-- Background Toggle Controls -->
                                <div class="flex justify-center gap-2 mt-3" v-if="settings.site_logo && !logoError">
                                    <button @click="logoBg = 'white'" class="w-6 h-6 rounded-full border border-gray-200 bg-white shadow-sm ring-2 ring-transparent hover:ring-gray-200 transition-all" :class="{ '!ring-gray-900': logoBg === 'white' }" title="White Background" aria-label="로고 배경을 흰색으로 변경" :aria-pressed="logoBg === 'white'"></button>
                                    <button @click="logoBg = 'checkered'" class="w-6 h-6 rounded-full border border-gray-200 bg-gray-100 shadow-sm ring-2 ring-transparent hover:ring-gray-200 transition-all overflow-hidden relative" :class="{ '!ring-gray-900': logoBg === 'checkered' }" title="Transparent/Checkered" aria-label="로고 배경을 투명 체크무늬로 변경" :aria-pressed="logoBg === 'checkered'">
                                        <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(#000 1px, transparent 1px); background-size: 4px 4px;" aria-hidden="true"></div>
                                    </button>
                                    <button @click="logoBg = 'dark'" class="w-6 h-6 rounded-full border border-gray-600 bg-gray-900 shadow-sm ring-2 ring-transparent hover:ring-gray-400 transition-all" :class="{ '!ring-gray-400': logoBg === 'dark' }" title="Dark Background" aria-label="로고 배경을 어두운색으로 변경" :aria-pressed="logoBg === 'dark'"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 댓글 정책 -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">댓글 정책 (전역 기본값)</h3>
                <p class="text-sm text-gray-500 mb-4">모든 글의 기본 댓글 정책입니다. 개별 글에서 재정의할 수 있습니다.</p>
                <div class="space-y-3">
                    <label class="flex items-center cursor-pointer">
                        <input
                            v-model="settings.comment_policy"
                            type="radio"
                            value="disabled"
                            class="h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                        />
                        <span class="ml-3 text-sm font-medium text-gray-900">비허용 (모든 글에서 댓글 불가)</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input
                            v-model="settings.comment_policy"
                            type="radio"
                            value="users_only"
                            class="h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                        />
                        <span class="ml-3 text-sm font-medium text-gray-900">회원만 (로그인한 사용자만)</span>
                    </label>
                    <label class="flex items-center cursor-pointer">
                        <input
                            v-model="settings.comment_policy"
                            type="radio"
                            value="anyone"
                            class="h-4 w-4 text-gray-900 border-gray-300 focus:ring-gray-900"
                        />
                        <span class="ml-3 text-sm font-medium text-gray-900">누구나 (비회원도 가능, 이메일+비밀번호 필요)</span>
                    </label>
                </div>
            </div>

            <!-- 회원가입 설정 -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-100">
                <div class="p-6">
                    <h4 class="text-sm font-medium text-gray-900 mb-4">회원가입 설정</h4>
                    <div class="space-y-4">
                        <div class="flex items-center justify-between">
                            <div>
                                <label class="text-sm font-medium text-gray-700">회원가입 허용</label>
                                <p class="text-xs text-gray-500">새로운 사용자의 회원가입을 허용합니다.</p>
                            </div>
                            <!-- allow_registration -->
                            <button 
                                @click="settings.allow_registration = !settings.allow_registration"
                                :class="settings.allow_registration ? 'bg-gray-900' : 'bg-gray-200'"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                            >
                                <span class="sr-only">회원가입 토글</span>
                                <span
                                    :class="settings.allow_registration ? 'translate-x-6' : 'translate-x-1'"
                                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                />
                            </button>
                        </div>

                        <div class="flex items-center justify-between" v-if="settings.allow_registration">
                            <div>
                                <label class="text-sm font-medium text-gray-700">이메일 가입 허용</label>
                                <p class="text-xs text-gray-500">소셜 로그인 외에 이메일/비밀번호 가입을 허용합니다.</p>
                            </div>
                            <button 
                                @click="settings.email_registration_enabled = !settings.email_registration_enabled"
                                :class="settings.email_registration_enabled ? 'bg-gray-900' : 'bg-gray-200'"
                                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                            >
                                <span class="sr-only">이메일 가입 토글</span>
                                <span
                                    :class="settings.email_registration_enabled ? 'translate-x-6' : 'translate-x-1'"
                                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- OAuth 프로바이더 -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6" :class="{ 'opacity-50 pointer-events-none grayscale': !settings.allow_registration }">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">소셜 로그인 프로바이더</h3>
                        <p class="text-sm text-gray-500">회원가입이 허용된 경우에만 활성화됩니다.</p>
                    </div>
                    <div v-if="!settings.allow_registration" class="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                        회원가입 비활성화됨
                    </div>
                </div>

                <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div v-for="provider in oauthProviders" :key="provider.key" class="flex items-center">
                        <input
                            :id="provider.key"
                            v-model="settings.oauth_providers[provider.key]"
                            type="checkbox"
                            :disabled="!settings.allow_registration"
                            class="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <label :for="provider.key" class="ml-2 block text-sm text-gray-900 cursor-pointer" :class="{ 'cursor-not-allowed text-gray-400': !settings.allow_registration }">
                            {{ provider.label }}
                        </label>
                    </div>
                </div>
            </div>

            <!-- 뉴스레터 설정 -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <h3 class="text-lg font-medium text-gray-900">뉴스레터 자동 발송</h3>
                        <p class="text-sm text-gray-500 mt-1">기사 발행 시 구독자에게 자동으로 뉴스레터를 발송합니다.</p>
                    </div>
                    <button 
                        @click="settings.newsletter.enabled = !settings.newsletter.enabled"
                        :class="settings.newsletter.enabled ? 'bg-gray-900' : 'bg-gray-200'"
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                    >
                        <span class="sr-only">뉴스레터 토글</span>
                        <span
                            :class="settings.newsletter.enabled ? 'translate-x-6' : 'translate-x-1'"
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                        />
                    </button>
                </div>

                <div v-if="settings.newsletter.enabled" class="mt-6 border-t border-gray-100 pt-6">
                    <h4 class="text-sm font-medium text-gray-900 mb-3">이메일 서비스 제공자</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label class="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus:outline-none ring-offset-2 focus-within:ring-2 focus-within:ring-gray-900">
                            <input type="radio" v-model="settings.newsletter.provider" value="resend" class="sr-only" />
                            <span class="flex flex-1">
                                <span class="flex flex-col">
                                    <span class="block text-sm font-medium text-gray-900">Resend</span>
                                    <span class="mt-1 flex items-center text-sm text-gray-500">모던한 개발자 경험, 간편한 설정</span>
                                    <span class="mt-3 text-xs text-gray-400">NUXT_RESEND_API_KEY 필요</span>
                                </span>
                            </span>
                            <span
                                :class="settings.newsletter.provider === 'resend' ? 'bg-gray-900 border-transparent' : 'bg-white border-gray-300'"
                                class="pointer-events-none absolute -inset-px rounded-lg border-2 z-[-1] transition-colors"
                                aria-hidden="true"
                            ></span>
                            <span
                                :class="settings.newsletter.provider === 'resend' ? 'border-gray-900' : 'border-transparent'"
                                class="pointer-events-none absolute -inset-px rounded-lg border-2 z-10 transition-colors" 
                                aria-hidden="true"
                            ></span>
                        </label>

                        <label class="relative flex cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm focus:outline-none ring-offset-2 focus-within:ring-2 focus-within:ring-gray-900">
                            <input type="radio" v-model="settings.newsletter.provider" value="sendgrid" class="sr-only" />
                            <span class="flex flex-1">
                                <span class="flex flex-col">
                                    <span class="block text-sm font-medium text-gray-900">SendGrid</span>
                                    <span class="mt-1 flex items-center text-sm text-gray-500">안정적인 업계 표준 서비스</span>
                                    <span class="mt-3 text-xs text-gray-400">NUXT_SENDGRID_API_KEY 필요</span>
                                </span>
                            </span>
                            <span
                                :class="settings.newsletter.provider === 'sendgrid' ? 'bg-gray-900 border-transparent' : 'bg-white border-gray-300'"
                                class="pointer-events-none absolute -inset-px rounded-lg border-2 z-[-1] transition-colors"
                                aria-hidden="true"
                            ></span>
                            <span
                                :class="settings.newsletter.provider === 'sendgrid' ? 'border-gray-900' : 'border-transparent'"
                                class="pointer-events-none absolute -inset-px rounded-lg border-2 z-10 transition-colors" 
                                aria-hidden="true"
                            ></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- 검색엔진 소유자 확인 (Search Engine Verification) -->
            <div class="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div class="mb-6">
                    <h3 class="text-lg font-medium text-gray-900">검색엔진 소유자 확인 (Search Engine Verification)</h3>
                    <p class="text-sm text-gray-500 mt-1">네이버, 구글, 빙 웹마스터 도구에서 사이트 소유권을 인증하기 위한 메타 태그 코드를 입력하세요.</p>
                </div>

                <div class="space-y-6">
                    <!-- 네이버 서치어드바이저 -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label for="naverVerification" class="block text-sm font-medium text-gray-900">
                                네이버 서치어드바이저
                            </label>
                            <a
                                href="https://searchadvisor.naver.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                            >
                                코드 발급 받기
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <input
                            id="naverVerification"
                            v-model="seoSettings.naver"
                            type="text"
                            class="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors sm:text-sm font-mono text-xs"
                            placeholder="naver-site-verification 메타 태그의 content 값을 입력하세요"
                        />
                        <p class="mt-1 text-xs text-gray-500">
                            예: <code class="bg-gray-100 px-1 py-0.5 rounded">abc123def456</code>
                        </p>
                    </div>

                    <!-- 구글 서치 콘솔 -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label for="googleVerification" class="block text-sm font-medium text-gray-900">
                                Google Search Console
                            </label>
                            <a
                                href="https://search.google.com/search-console"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                            >
                                코드 발급 받기
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <input
                            id="googleVerification"
                            v-model="seoSettings.google"
                            type="text"
                            class="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors sm:text-sm font-mono text-xs"
                            placeholder="google-site-verification 메타 태그의 content 값을 입력하세요"
                        />
                        <p class="mt-1 text-xs text-gray-500">
                            예: <code class="bg-gray-100 px-1 py-0.5 rounded">xyz789abc123</code>
                        </p>
                    </div>

                    <!-- 빙 웹마스터 도구 -->
                    <div>
                        <div class="flex items-center justify-between mb-2">
                            <label for="bingVerification" class="block text-sm font-medium text-gray-900">
                                Bing Webmaster Tools
                            </label>
                            <a
                                href="https://www.bing.com/webmasters"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
                            >
                                코드 발급 받기
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                        <input
                            id="bingVerification"
                            v-model="seoSettings.bing"
                            type="text"
                            class="mt-1 block w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-colors sm:text-sm font-mono text-xs"
                            placeholder="msvalidate.01 메타 태그의 content 값을 입력하세요"
                        />
                        <p class="mt-1 text-xs text-gray-500">
                            예: <code class="bg-gray-100 px-1 py-0.5 rounded">123ABC456DEF</code>
                        </p>
                    </div>

                    <!-- 저장 버튼 (통합) -->
                    <div class="pt-4 border-t border-gray-100">
                        <button
                            @click="saveSettings"
                            :disabled="saving"
                            class="w-full bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 text-sm font-medium shadow-sm hover:shadow-md"
                        >
                            {{ saving ? '저장 중...' : '변경사항 저장' }}
                        </button>
                    </div>
                </div>
            </div>

        </div>

    </div>
</template>

<script setup lang="ts">
/**
 * 관리자 - 사이트 설정 페이지
 *
 * 기능: 사이트의 전역 설정을 조회하고 수정합니다.
 * 경로: app/pages/admin/settings.vue
 * 권한: 관리자(Admin) 전용
 *
 * 데이터 흐름:
 * 1. 초기 로드 (onMounted) -> API(/api/admin/settings) 조회
 * 2. 사용자 입력 및 토글 인터랙션
 * 3. 저장 버튼 클릭 -> API(PUT /api/admin/settings) 전송
 */
definePageMeta({
    layout: 'admin',
    middleware: ['admin'],
});

const saving = ref(false);

const defaultCommentPolicy = 'default'; // 'default' | 'disabled' | 'users_only' | 'anyone'

interface SettingsData {
    site_name: string;
    site_description: string;
    site_logo: string;
    twitter_site: string;
    site_url: string;
    site_type: string;
    
    comment_policy: string;
    // registrationEnabled -> allow_registration (DB schema 일치)
    // registration_enabled 키도 허용하지만 우선 allow_registration 사용
    allow_registration: boolean; 
    email_registration_enabled: boolean;
    oauth_providers: Record<string, boolean>;
    newsletter: {
        enabled: boolean;
        provider: 'resend' | 'sendgrid';
    };
    [key: string]: any;
}


const settings = ref<SettingsData>({
    site_name: '',
    site_description: '',
    site_logo: '',
    twitter_site: '',
    site_url: '',
    site_type: 'Person',
    
    comment_policy: 'users_only',
    allow_registration: false,
    email_registration_enabled: false,
    oauth_providers: {
        google: true,
        github: true,
        naver: true,
        kakao: true,
        apple: false,
        microsoft: false,
    },
    newsletter: {
        enabled: false,
        provider: 'resend',
    },
});

// SEO 검색엔진 소유자 확인 설정
const seoSettings = ref({
    naver: '',
    google: '',
    bing: '',
});

// SEO 설정 불러오기
const { data: seoData, refresh: refreshSeo } = await useFetch('/api/admin/settings/seo', {
    lazy: true,
    server: false,
});

// SEO 데이터 로드 시 반영
watch(seoData, (newData) => {
    if (newData && (newData as any).success) {
        const data = (newData as any).data;
        seoSettings.value.naver = data.naver || '';
        seoSettings.value.google = data.google || '';
        seoSettings.value.bing = data.bing || '';
    }
}, { immediate: true });


// 로고 미리보기 컨트롤 (TDZ 방지를 위해 settings 후에 선언)
const logoBg = ref<'white' | 'dark' | 'checkered'>('white');
const logoError = ref(false);

const logoBgClass = computed(() => {
    switch (logoBg.value) {
        case 'dark': return 'bg-gray-900';
        case 'checkered': return 'bg-gray-50 bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwIDBoMTB2MTBIMTBWMHkwIDEwaDEwdjEwSDBWMHoiIGZpbGw9IiNlNWU3ZWIiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPjwvc3ZnPg==")]';
        default: return 'bg-white';
    }
});

const handleLogoError = () => {
    logoError.value = true;
};

// Reset error when URL changes
watch(() => settings.value.site_logo, () => {
    logoError.value = false;
});

// 로고 파일 업로드 로직
const isUploading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const triggerFileUpload = () => {
    fileInput.value?.click();
};

const handleLogoUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    try {
        isUploading.value = true;
        const formData = new FormData();
        formData.append('files', file);
        formData.append('categoryPath', 'common');
        formData.append('slug', 'logo'); // 공용 로고 폴더
        formData.append('type', 'featured'); // Featured 타입으로 해서 썸네일/OG 등 생성 유도
        formData.append('optimize', 'true');

        const { files } = await $fetch<{ files: any[] }>('/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (files && files.length > 0) {
            settings.value.site_logo = files[0].url;
            // Toast success? 굳이 필요없고 URL 바뀌면 미리보기 뜸
            const toast = useToast();
            toast.success('로고 이미지가 업로드되었습니다.');
        }
    } catch (e) {
        console.error('Logo upload failed:', e);
        const toast = useToast();
        toast.error('로고 업로드에 실패했습니다.');
    } finally {
        isUploading.value = false;
        if (fileInput.value) fileInput.value.value = ''; // Reset input
    }
};

const oauthProviders = [
    { key: 'google', label: 'Google' },
    { key: 'github', label: 'GitHub' },
    { key: 'naver', label: 'Naver' },
    { key: 'kakao', label: 'Kakao' },
    { key: 'apple', label: 'Apple' },
    { key: 'microsoft', label: 'Microsoft' },
];

// useFetch를 사용하여 데이터 로드 (SSR + Client)
const { data: fetchedSettings, pending: loading, error: fetchError, refresh } = useFetch<SettingsData>('/api/admin/settings', {
    lazy: true,
    server: false // 클라이언트 사이드 페칭 우선
});

// 데이터 로드 시 settings ref에 반영
// 데이터 로드 시 settings ref에 반영
watch(fetchedSettings, (newData) => {
    if (newData) {
        console.log('Settings Loaded:', newData); // 브라우저 콘솔 확인용
        
        // Safety Check: Support both snake_case (standard) and camelCase (legacy/cache)
        
        // 1. Strings (Check for emptiness is valid, but optional. We just overwrite)
        settings.value.site_name = newData.site_name || newData.siteName || '';
        settings.value.site_description = newData.site_description || newData.siteDescription || '';
        settings.value.site_logo = newData.site_logo || newData.siteLogo || '';
        settings.value.site_type = newData.site_type || newData.siteType || 'Person';
        settings.value.site_url = newData.site_url || newData.siteUrl || '';
        settings.value.comment_policy = newData.comment_policy || newData.commentPolicy || 'users_only';
        
        // 트위터 계정: @ 제거하고 표시
        const rawTwitter = newData.twitter_site || newData.twitterSite || '';
        settings.value.twitter_site = rawTwitter.replace(/^@/, '');

        // 2. Booleans
        // allow_registration
        if (newData.allow_registration !== undefined) {
             settings.value.allow_registration = newData.allow_registration;
        } else if (newData.registration_enabled !== undefined) {
             settings.value.allow_registration = newData.registration_enabled;
        } else if (newData.registrationEnabled !== undefined) {
             settings.value.allow_registration = newData.registrationEnabled;
        }

        // email_registration_enabled
        if (newData.email_registration_enabled !== undefined) {
             settings.value.email_registration_enabled = newData.email_registration_enabled;
        } else if (newData.emailRegistrationEnabled !== undefined) {
             settings.value.email_registration_enabled = newData.emailRegistrationEnabled;
        }
        
        // 3. Objects (OAuth Providers)
        const loadedProviders = newData.oauth_providers || newData.oauthProviders || {};
        settings.value.oauth_providers = {
            ...settings.value.oauth_providers,
            ...loadedProviders
        };
        
        // 4. Objects (Newsletter)
        const loadedNewsletter = newData.newsletter || {};
        settings.value.newsletter = {
            ...settings.value.newsletter,
            ...loadedNewsletter,
            enabled: loadedNewsletter.enabled ?? false,
            provider: loadedNewsletter.provider || 'resend',
        };


    }
}, { immediate: true, deep: true });

// 에러 처리
watch(fetchError, (newError) => {
    if (newError) {
        const toast = useToast();
        toast.error('설정을 불러오는데 실패했습니다.');
        console.error('Settings fetch error:', newError);
    }
});

// 설정 저장 (사이트 설정 + SEO 설정 통합)
async function saveSettings() {
    try {
        saving.value = true;

        // 1. Data Formatting (트위터 @ 자동 추가)
        const payload = {
            ...settings.value,
            // 트위터 변환 로직
            twitter_site: settings.value.twitter_site
                ? (settings.value.twitter_site.startsWith('@') ? settings.value.twitter_site : `@${settings.value.twitter_site}`)
                : '',
        };

        // 2. 사이트 기본 설정 저장
        await $fetch('/api/admin/settings', {
            method: 'PUT',
            body: payload,
        });

        // 3. SEO 검색엔진 소유자 확인 설정 저장
        await $fetch('/api/admin/settings/seo', {
            method: 'PUT',
            body: {
                naver: seoSettings.value.naver.trim(),
                google: seoSettings.value.google.trim(),
                bing: seoSettings.value.bing.trim(),
            },
        } as any);

        // Toast 알림
        const toast = useToast();
        toast.success('모든 설정이 성공적으로 저장되었습니다.');

        // 저장 후 데이터 갱신
        await refresh();
        await refreshSeo();

    } catch (error) {
        console.error('Save failed:', error);
        const toast = useToast();
        toast.error('설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
        saving.value = false;
    }
}
</script>
