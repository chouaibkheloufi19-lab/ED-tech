import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  Clock3,
  Home as HomeIcon,
  MessageCircle,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Send,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

type LessonStatus = 'current' | 'upcoming' | 'done';
type LessonKind = 'theory' | 'practice';
type Lesson = {
  id: string;
  title: string;
  detail: string;
  date: string;
  time: string;
  timeValue?: string;
  kind: LessonKind;
  status: LessonStatus;
  wasMissed?: boolean;
};

const dateFromToday = (days: number) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const initialLessons: Lesson[] = [
  { id: 'algebra', title: 'المعادلات الخطية', detail: 'الرياضيات · الوحدة ٣', date: dateFromToday(0), time: '١٠:٠٠ ص', timeValue: '10:00', kind: 'theory', status: 'current' },
  { id: 'fractions', title: 'النسب والتناسب', detail: 'الرياضيات · الوحدة ٣', date: dateFromToday(1), time: '١٠:٠٠ ص', timeValue: '10:00', kind: 'theory', status: 'upcoming' },
  { id: 'practice', title: 'تطبيقات على المعادلات', detail: 'تدريب · الوحدة ٣', date: dateFromToday(1), time: '٠٤:٣٠ م', timeValue: '16:30', kind: 'practice', status: 'upcoming' },
  { id: 'geometry', title: 'أشكال هندسية', detail: 'الرياضيات · الوحدة ٤', date: dateFromToday(2), time: '١٠:٠٠ ص', timeValue: '10:00', kind: 'theory', status: 'upcoming' },
];

const arabicDate = (date: string) =>
  new Intl.DateTimeFormat('ar-EG-u-ca-gregory', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(`${date}T12:00:00`));

const shortArabicDate = (date: string) =>
  new Intl.DateTimeFormat('ar-EG-u-ca-gregory', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${date}T12:00:00`));

const shiftDate = (date: string, days = 1) => {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return next.toISOString().slice(0, 10);
};

function OwlMark({ small = false }: { small?: boolean }) {
  return (
    <div className={small ? 'owl-mark-small' : 'owl-body animate-float'} aria-label="بومة التعريف">
      {!small && (
        <>
          <div className="owl-face">
            <span className="owl-eye" />
            <span className="owl-eye" />
            <span className="owl-beak" />
          </div>
          <span className="absolute -bottom-3 left-7 h-3 w-7 rounded-full bg-[#e4a244]" />
          <span className="absolute -bottom-3 right-7 h-3 w-7 rounded-full bg-[#e4a244]" />
        </>
      )}
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2c9ebe] text-white shadow-[0_5px_12px_rgba(44,158,190,.22)]">
        <span className="text-[17px] font-bold leading-none">م</span>
      </div>
      {!compact && (
        <div className="text-right">
          <p className="text-[15px] font-bold tracking-tight text-white">مِداد</p>
          <p className="mt-0.5 text-[10px] text-[#9db8c7]">رفيق التعلّم</p>
        </div>
      )}
    </div>
  );
}

function SideRail() {
  const items = [
    { label: 'الرئيسية', icon: HomeIcon, active: true },
    { label: 'البرنامج', icon: BookOpen },
    { label: 'المواعيد', icon: CalendarDays },
    { label: 'تقدّمي', icon: ChartNoAxesColumnIncreasing },
  ];
  return (
    <aside className="side-rail hidden w-[248px] shrink-0 flex-col justify-between px-5 py-6 md:flex">
      <div>
        <Brand />
        <div className="mt-12">
          <p className="mb-3 px-3 text-[10px] font-semibold tracking-[.14em] text-[#86a0b0]">مساحتي الدراسية</p>
          <nav className="space-y-1" aria-label="التنقل الرئيسي">
            {items.map(({ label, icon: Icon, active }) => (
              <button
                type="button"
                className={`side-link flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-[13px] font-medium ${active ? 'active' : 'text-[#c1d1da]'}`}
                key={label}
                data-testid={`button-nav-${label}`}
                onClick={() => undefined}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.7} />
                <span>{label}</span>
                {active && <span className="mr-auto h-1.5 w-1.5 rounded-full bg-[#79d4ed]" />}
              </button>
            ))}
          </nav>
        </div>
      </div>
      <div>
        <div className="mb-5 rounded-2xl border border-[#34526b] bg-[#253c53] p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] text-[#a5bdc9]">هدف هذا الأسبوع</span>
            <span className="text-xs font-bold text-[#79d4ed]">٣ / ٥</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[#38556b]">
            <div className="h-full w-3/5 rounded-full bg-[#79d4ed]" />
          </div>
          <p className="mt-3 text-[10px] leading-5 text-[#a5bdc9]">خطوة صغيرة كل يوم تصنع فرقاً كبيراً.</p>
        </div>
        <button type="button" className="side-link flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right text-[12px] text-[#c1d1da]" data-testid="button-settings">
          <Settings size={17} strokeWidth={1.7} />
          <span>الإعدادات</span>
        </button>
      </div>
    </aside>
  );
}

function MobileNav() {
  return (
    <nav className="mobile-nav flex items-center justify-around border-t border-[#d9e5eb] bg-[#f8fbfc]/95 px-3 py-2.5 backdrop-blur" aria-label="التنقل السريع">
      {[['الرئيسية', HomeIcon], ['البرنامج', BookOpen], ['المواعيد', CalendarDays], ['تقدّمي', ChartNoAxesColumnIncreasing]].map(([label, Icon], index) => {
        const ItemIcon = Icon as typeof HomeIcon;
        return (
          <button type="button" key={label as string} className={`flex min-w-[62px] flex-col items-center gap-1 text-[10px] ${index === 0 ? 'font-bold text-[#2386a3]' : 'text-[#8196a5]'}`} data-testid={`button-mobile-nav-${label}`}>
            <ItemIcon size={18} strokeWidth={index === 0 ? 2.2 : 1.7} />
            <span>{label as string}</span>
          </button>
        );
      })}
    </nav>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between border-b border-[#dce8ed] bg-[#f4f8fa]/80 px-5 py-4 md:px-10">
      <div className="flex items-center gap-3">
        <div className="relative grid h-10 w-10 place-items-center rounded-full bg-[#d8eef3] text-[#287f99]">
          <Bell size={18} strokeWidth={1.8} />
          <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full border-2 border-[#f4f8fa] bg-[#e6a04c]" />
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[11px] text-[#8297a4]">الثلاثاء، ١٣ مايو</p>
          <p className="text-[12px] font-semibold text-[#30485b]">صباح الخير، سارة</p>
        </div>
      </div>
      <div className="md:hidden">
        <Brand compact />
      </div>
      <div className="hidden items-center gap-3 md:flex">
        <span className="text-[11px] text-[#8297a4]">الخطة الهادئة</span>
        <div className="h-8 w-px bg-[#dce8ed]" />
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f2cda0] text-[12px] font-bold text-[#74502a]">س</div>
      </div>
      <div className="grid h-9 w-9 place-items-center rounded-full bg-[#f2cda0] text-[12px] font-bold text-[#74502a] md:hidden">س</div>
    </header>
  );
}

type OnboardingStep = { eyebrow: string; title: string; body: string; note?: string };
const onboardingSteps: OnboardingStep[] = [
  { eyebrow: 'أهلاً بك في مِداد', title: 'سارة، سنمشي معاً خطوة بخطوة', body: 'أنا هنا لأعرّفك على مساحتك الجديدة بهدوء. لن تحتاجي إلى حفظ شيء الآن؛ سأريك ما تحتاجينه عندما يحين وقته.', note: 'تعريف سريع · أقل من دقيقة' },
  { eyebrow: 'المواعيد في مكان واحد', title: 'أضيفي حصصك، واتركي الباقي علينا', body: 'سجّلي موعد الحصة أو وقت المذاكرة، وسيظهر أمامك في البرنامج. هكذا تعرفين دائماً ما الخطوة التالية دون بحث.', note: 'يمكنك إضافة موعد في أي وقت' },
  { eyebrow: 'تقدّم واضح، بلا ضغط', title: 'سنحفظ تقدّمك مع كل خطوة', body: 'بعد كل درس، يحدّث مِداد تقدّمك تلقائياً. يمكنك رؤية ما أنجزته وما يستحق وقتك التالي، من دون أرقام مربكة.', note: 'خطتك تتكيّف مع إيقاعك' },
  { eyebrow: 'أصبحتِ جاهزة', title: 'لنفتح برنامجك الحقيقي', body: 'هذا هو مكانك من الآن: درس واحد واضح، مواعيد خفيفة، ووكيل البرنامج بجانبك ليقترح عليك ما تفعلينه تالياً.', note: 'يمكنك العودة إلى هذا الشرح من الإعدادات' },
];

function Onboarding({ onFinish }: { onFinish: () => void }) {
  const [step, setStep] = useState(0);
  const current = onboardingSteps[step];
  const finalStep = step === onboardingSteps.length - 1;
  return (
    <div className="onboarding-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" dir="rtl">
      <section className="animate-rise relative flex max-h-[calc(100dvh-32px)] w-full max-w-[930px] flex-col overflow-auto rounded-[30px] bg-[#f8fbfc] shadow-[0_28px_80px_rgba(20,47,68,.27)] md:min-h-[560px] md:flex-row md:overflow-hidden" aria-labelledby="onboarding-title">
        <button type="button" onClick={onFinish} className="absolute left-5 top-5 z-10 grid h-9 w-9 place-items-center rounded-full text-[#77909f] hover:bg-[#e7f1f4] hover:text-[#31556a]" aria-label="إغلاق التعريف" data-testid="button-close-onboarding">
          <X size={18} />
        </button>
        <div className="flex min-h-[245px] items-center justify-center bg-[#dff2f4] px-8 py-9 md:order-2 md:min-h-0 md:w-[42%]">
          <div className="flex flex-col items-center gap-5 text-center">
            <OwlMark />
            <div>
              <p className="text-[11px] font-semibold tracking-[.1em] text-[#378ea7]">دليل مِداد</p>
              <p className="mt-1 text-[12px] text-[#61818f]">معك في البداية فقط</p>
            </div>
          </div>
        </div>
        <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 md:order-1 md:px-14 md:py-12">
          <div className="mb-12 flex items-center gap-2">
            {onboardingSteps.map((item, index) => (
              <div key={item.title} className={`h-1.5 rounded-full transition-all duration-300 ${index <= step ? 'w-10 bg-[#2c9ebe]' : 'w-5 bg-[#d7e6eb]'}`} aria-label={`الخطوة ${index + 1}`} />
            ))}
            <span className="mr-2 text-[11px] text-[#8ba0aa]">{step + 1} من {onboardingSteps.length}</span>
          </div>
          <div className="flex-1">
            <p className="mb-4 text-[11px] font-bold tracking-[.13em] text-[#3293ae]">{current.eyebrow}</p>
            <h1 id="onboarding-title" className="max-w-[490px] text-[26px] font-bold leading-[1.65] tracking-[-.035em] text-[#203e53] sm:text-[31px]">{current.title}</h1>
            <p className="mt-5 max-w-[500px] text-[14px] leading-[2.1] text-[#617987]">{current.body}</p>
            {current.note && <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#e9f5f6] px-3 py-2 text-[11px] text-[#4e7c89]"><CheckCircle2 size={14} />{current.note}</div>}
          </div>
          <div className="mt-10 flex items-center justify-between gap-3">
            <button type="button" className="ghost-button rounded-xl px-3 py-2 text-[12px]" onClick={onFinish} data-testid="button-skip-onboarding">تخطي التعريف</button>
            <div className="flex items-center gap-2">
              {step > 0 && <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-[#d8e5ea] text-[#6d8793] hover:bg-[#edf5f7]" onClick={() => setStep((value) => value - 1)} aria-label="الخطوة السابقة" data-testid="button-onboarding-previous"><ArrowRight size={17} /></button>}
              <button type="button" className="primary-button flex h-11 items-center gap-2 rounded-xl px-5 text-[12px] font-bold" onClick={() => finalStep ? onFinish() : setStep((value) => value + 1)} data-testid={`button-onboarding-${finalStep ? 'finish' : 'next'}`}>
                {finalStep ? 'فتح برنامجي' : 'التالي'}
                {finalStep ? <Check size={16} /> : <ArrowLeft size={16} />}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function LessonCard({ lesson, onStart }: { lesson: Lesson; onStart: () => void }) {
  return (
    <section className="lesson-glow relative overflow-hidden rounded-[24px] px-6 py-7 text-white shadow-[0_12px_28px_rgba(31,72,99,.18)] sm:px-8 sm:py-8" dir="rtl" data-testid="card-next-lesson">
      <div className="absolute -left-12 -top-20 h-48 w-48 rounded-full border-[20px] border-white/5" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/10 px-3 py-1.5 text-[10px] text-[#c9e8ec]">الخطوة التالية</span>
          <MoreHorizontal size={19} className="text-[#afd5df]" />
        </div>
        <div className="mt-8 max-w-[530px]">
          <p className="text-[12px] text-[#a9d3dd]">{lesson.detail}</p>
          <h2 className="mt-2 text-[25px] font-bold tracking-[-.03em] sm:text-[30px]">{lesson.title}</h2>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-[#c3e1e5]">
            <span className="flex items-center gap-2"><CalendarDays size={15} />{arabicDate(lesson.date)}</span>
            <span className="flex items-center gap-2"><Clock3 size={15} />{lesson.time} · ٣٥ دقيقة</span>
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <button type="button" className="flex items-center gap-2 rounded-xl bg-[#f4c46d] px-4 py-3 text-[12px] font-bold text-[#503e24] transition hover:bg-[#f6d083]" onClick={onStart} data-testid="button-start-lesson">
            <BookOpen size={16} />ابدئي الدرس
          </button>
          <span className="flex items-center gap-2 rounded-xl px-3 py-3 text-[11px] text-[#c5e2e7]">
            <span className="status-dot bg-[#79d4ed]" />
            أتابع حضورك تلقائيًا
          </span>
        </div>
      </div>
    </section>
  );
}

function MiniSchedule({ lessons, onAdd }: { lessons: Lesson[]; onAdd: () => void }) {
  return (
    <section className="surface rounded-[24px] p-5 sm:p-6" dir="rtl" data-testid="section-schedule">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#8aa0ab]">القادم في برنامجك</p>
          <h2 className="mt-1 text-[17px] font-bold text-[#28485c]">مواعيد قريبة</h2>
        </div>
        <button type="button" className="ghost-button flex items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold" onClick={onAdd} data-testid="button-add-appointment-inline"><Plus size={15} />إضافة</button>
      </div>
      <div className="space-y-1">
        {lessons.slice(0, 3).map((lesson, index) => (
          <div className="flex items-center gap-3 rounded-2xl px-2 py-3 transition hover:bg-[#f3f8fa]" key={lesson.id} data-testid={`row-schedule-${lesson.id}`}>
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[10px] font-bold ${lesson.wasMissed ? 'bg-[#fff0dc] text-[#b1722b]' : index === 0 ? 'bg-[#dff3f5] text-[#2c91aa]' : 'bg-[#edf2f4] text-[#7d929d]'}`}>
              <span>{shortArabicDate(lesson.date)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-[12px] font-bold ${lesson.wasMissed ? 'text-[#5f7380]' : 'text-[#355469]'}`}>{lesson.title}</p>
              <p className="mt-1 text-[10px] text-[#8aa0ab]">{lesson.time} · {lesson.wasMissed ? 'أعيدت جدولة الموعد' : lesson.detail.split(' · ')[0]}</p>
            </div>
            {lesson.wasMissed ? <span className="rounded-full bg-[#fff1de] px-2 py-1 text-[9px] font-semibold text-[#ae722d]">معدّل</span> : index === 0 ? <span className="status-dot bg-[#36a7a0]" /> : <ChevronLeft size={15} className="text-[#b8c7ce]" />}
          </div>
        ))}
      </div>
      <button type="button" className="mt-3 flex w-full items-center justify-center gap-2 border-t border-[#edf2f4] pt-4 text-[11px] font-semibold text-[#568092] hover:text-[#277e99]" onClick={onAdd} data-testid="button-add-appointment-schedule">
        <CalendarDays size={14} />إضافة موعد جديد
      </button>
    </section>
  );
}

function ProgressCard() {
  return (
    <section className="surface rounded-[24px] p-5 sm:p-6" dir="rtl" data-testid="card-progress">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold text-[#8aa0ab]">نظرة هادئة</p>
          <h2 className="mt-1 text-[17px] font-bold text-[#28485c]">تقدّمك هذا الأسبوع</h2>
        </div>
        <div className="rounded-xl bg-[#e5f3f4] px-2.5 py-1.5 text-[11px] font-bold text-[#328d9c]">جيد</div>
      </div>
      <div className="mt-7 flex items-center gap-5">
        <div className="relative grid h-[88px] w-[88px] shrink-0 place-items-center rounded-full" style={{ background: 'conic-gradient(#36a7a0 0 68%, #e5eff0 68% 100%)' }}>
          <div className="grid h-[68px] w-[68px] place-items-center rounded-full bg-[#fcfdfd]">
            <span className="text-[21px] font-bold text-[#2e7e88]">٦٨٪</span>
          </div>
        </div>
        <div className="space-y-3 text-[11px]">
          <p className="flex items-center gap-2 text-[#5f7784]"><span className="status-dot bg-[#36a7a0]" />٤ دروس مكتملة</p>
          <p className="flex items-center gap-2 text-[#5f7784]"><span className="status-dot bg-[#e5b15d]" />درس واحد قادم</p>
          <p className="text-[10px] leading-5 text-[#8ca0aa]">بقي القليل على هدفك الأسبوعي.</p>
        </div>
      </div>
    </section>
  );
}

function ProgramAgent({ adjustment, onPrompt }: { adjustment: string | null; onPrompt: (prompt: string) => void }) {
  const [messages, setMessages] = useState([
    { from: 'agent', text: 'أهلًا سارة. خطوتك الواضحة الآن هي درس المعادلات الخطية. هل نبدأ معًا؟' },
  ]);
  const [draft, setDraft] = useState('');
  useEffect(() => {
    if (adjustment) setMessages((current) => [...current, { from: 'agent', text: adjustment }]);
  }, [adjustment]);
  const send = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { from: 'student', text: clean }, { from: 'agent', text: 'تمام. سأبقيها خطوة بسيطة: ابدئي بعشر دقائق، ثم نقرر الخطوة التالية.' }]);
    setDraft('');
    onPrompt(clean);
  };
  return (
    <section className="surface rounded-[24px] p-5 sm:p-6" dir="rtl" data-testid="section-program-agent">
      <div className="flex items-center gap-3 border-b border-[#e8eff2] pb-4">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#e6f1f5] text-[#318ca7]"><Sparkles size={19} /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-[#28485c]">وكيل البرنامج</h2>
            <span className="h-1.5 w-1.5 rounded-full bg-[#3aa89f]" />
            <span className="text-[10px] text-[#7e989f]">متاح الآن</span>
          </div>
          <p className="mt-1 text-[10px] text-[#8aa0ab]">يرافق خطتك اليومية، لا يشرح التعريف</p>
        </div>
        <MessageCircle size={17} className="text-[#9eb5be]" />
      </div>
      <div className="max-h-[225px] space-y-3 overflow-auto py-4" aria-live="polite">
        {messages.map((message, index) => (
          <div key={`${message.from}-${index}`} className={`flex ${message.from === 'student' ? 'justify-start' : 'justify-end'}`} data-testid={`text-agent-message-${index}`}>
            <p className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-[11px] leading-[1.8] ${message.from === 'student' ? 'rounded-bl-md bg-[#eaf2f5] text-[#5e7581]' : 'rounded-br-md bg-[#e6f5f4] text-[#356f77]'}`}>{message.text}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {['كيف أبدأ؟', 'كم بقي لي؟', 'أريد تغيير الموعد'].map((prompt) => (
          <button type="button" key={prompt} onClick={() => send(prompt)} className="rounded-full border border-[#dbe8ec] px-3 py-2 text-[10px] text-[#5a7e8d] transition hover:border-[#93c9d5] hover:bg-[#f0f8fa]" data-testid={`button-agent-prompt-${prompt}`}>{prompt}</button>
        ))}
      </div>
      <form className="mt-4 flex items-center gap-2 rounded-xl border border-[#dbe7eb] bg-[#f8fbfc] p-1.5" onSubmit={(event) => { event.preventDefault(); send(draft); }}>
        <input value={draft} onChange={(event) => setDraft(event.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-[11px] text-[#3e5d6b] outline-none placeholder:text-[#9aadb5]" placeholder="اكتبي سؤالك للوكيل..." aria-label="رسالة إلى وكيل البرنامج" data-testid="input-agent-message" />
        <button type="submit" className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#2c9ebe] text-white transition hover:bg-[#218ca9]" aria-label="إرسال الرسالة" data-testid="button-send-agent-message"><Send size={14} /></button>
      </form>
    </section>
  );
}

function AppointmentModal({ onClose, onSave }: { onClose: () => void; onSave: (appointment: { title: string; date: string; time: string }) => void }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('2025-05-22');
  const [time, setTime] = useState('10:00');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (title.trim()) onSave({ title: title.trim(), date, time: time === '10:00' ? '١٠:٠٠ ص' : '٠٤:٣٠ م' });
  };
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#1d3448]/40 p-4 backdrop-blur-[3px]" dir="rtl">
      <form onSubmit={submit} className="animate-rise w-full max-w-[440px] rounded-[25px] bg-[#f9fcfd] p-6 shadow-[0_25px_70px_rgba(20,47,68,.2)] sm:p-8" aria-labelledby="appointment-title">
        <div className="mb-7 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#3b9ab3]">موعد جديد</p>
            <h2 id="appointment-title" className="mt-1 text-[21px] font-bold text-[#28485c]">ماذا نضيف لبرنامجك؟</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-[#829ba6] hover:bg-[#e9f2f4]" aria-label="إغلاق" data-testid="button-close-appointment"><X size={18} /></button>
        </div>
        <label className="block text-[11px] font-semibold text-[#506d7b]">
          اسم الموعد
          <input required value={title} onChange={(event) => setTitle(event.target.value)} className="modal-input mt-2 w-full rounded-xl px-3 py-3 text-[12px] text-[#28485c]" placeholder="مثال: مراجعة درس اليوم" data-testid="input-appointment-title" />
        </label>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <label className="text-[11px] font-semibold text-[#506d7b]">
            التاريخ
            <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="modal-input mt-2 w-full rounded-xl px-3 py-3 text-[11px] text-[#28485c]" data-testid="input-appointment-date" />
          </label>
          <label className="text-[11px] font-semibold text-[#506d7b]">
            الوقت
            <select value={time} onChange={(event) => setTime(event.target.value)} className="modal-input mt-2 w-full rounded-xl px-3 py-3 text-[11px] text-[#28485c]" data-testid="select-appointment-time">
              <option value="10:00">١٠:٠٠ صباحًا</option>
              <option value="16:30">٠٤:٣٠ مساءً</option>
            </select>
          </label>
        </div>
        <div className="mt-7 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="ghost-button rounded-xl px-4 py-3 text-[11px] font-semibold" data-testid="button-cancel-appointment">إلغاء</button>
          <button type="submit" className="primary-button rounded-xl px-5 py-3 text-[11px] font-bold" data-testid="button-save-appointment">حفظ الموعد</button>
        </div>
      </form>
    </div>
  );
}

function LiveProgram() {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem('medad-lessons');
      return saved ? JSON.parse(saved) as Lesson[] : initialLessons;
    } catch {
      return initialLessons;
    }
  });
  const [showAppointment, setShowAppointment] = useState(false);
  const [started, setStarted] = useState(false);
  const [adjustment, setAdjustment] = useState<string | null>(null);
  const currentLesson = lessons.find((lesson) => lesson.status === 'current') ?? lessons[0];
  const nextDateLabel = useMemo(() => arabicDate(currentLesson.date), [currentLesson.date]);

  useEffect(() => {
    localStorage.setItem('medad-lessons', JSON.stringify(lessons));
  }, [lessons]);

  const missCurrentLesson = () => {
    if (currentLesson.wasMissed) return;
    const oldDate = currentLesson.date;
    const moved = lessons.map((lesson) => ({ ...lesson, date: shiftDate(lesson.date), ...(lesson.id === currentLesson.id ? { wasMissed: true } : {}) }));
    setLessons(moved);
    setAdjustment(`سجّلت أن «${currentLesson.title}» فاتتك. لا مشكلة — حرّكت هذا الموعد وكل ما بعده يوماً واحداً، وأصبح موعدك الجديد ${arabicDate(shiftDate(oldDate))}.`);
    setStarted(false);
  };

  useEffect(() => {
    const detectMissedLesson = () => {
      if (started || currentLesson.wasMissed) return;
      const scheduledAt = new Date(`${currentLesson.date}T${currentLesson.timeValue ?? '10:00'}:00`);
      if (scheduledAt.getTime() < Date.now()) {
        missCurrentLesson();
      }
    };

    detectMissedLesson();
    const watcher = window.setInterval(detectMissedLesson, 30_000);
    return () => window.clearInterval(watcher);
  }, [currentLesson, started]);

  const saveAppointment = (appointment: { title: string; date: string; time: string }) => {
    setLessons((current) => {
      const added: Lesson = { ...appointment, timeValue: appointment.time === '١٠:٠٠ ص' ? '10:00' : '16:30', id: `custom-${Date.now()}`, detail: 'موعد شخصي · أضيف الآن', kind: 'practice', status: 'upcoming' };
      return current.length ? [current[0], added, ...current.slice(1)] : [added];
    });
    setShowAppointment(false);
    setAdjustment('أضفت الموعد إلى برنامجك. سيظهر هنا عندما يقترب، ولن يغيّر ترتيب دروسك.');
  };

  return (
    <div className="app-shell flex flex-col md:flex-row" dir="rtl">
      <SideRail />
      <div className="min-w-0 flex-1">
        <Header />
        <main className="mx-auto max-w-[1200px] px-5 py-7 sm:px-8 md:px-10 md:py-10">
          <div className="animate-rise mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-semibold tracking-[.12em] text-[#3d9ab2]">الأربعاء، ١٤ مايو ٢٠٢٥</p>
              <h1 className="mt-2 text-[25px] font-bold tracking-[-.04em] text-[#203e53] sm:text-[30px]">خلّينا نبدأ بهدوء، سارة</h1>
              <p className="mt-2 text-[12px] text-[#78909c]">لستِ مطالبة بإنجاز كل شيء اليوم. هذه هي خطوتك التالية فقط.</p>
            </div>
            <button type="button" className="primary-button flex w-fit items-center gap-2 rounded-xl px-4 py-3 text-[11px] font-bold" onClick={() => setShowAppointment(true)} data-testid="button-add-appointment-header"><Plus size={16} />إضافة موعد</button>
          </div>
          {adjustment && (
            <div className="animate-fade mb-6 flex items-start gap-3 rounded-2xl border border-[#e8d3ac] bg-[#fff8eb] px-4 py-3 text-[11px] leading-7 text-[#866335]" role="status" data-testid="status-schedule-adjustment">
              <CircleAlert size={17} className="mt-1 shrink-0 text-[#c58b3f]" />
              <p className="flex-1">{adjustment}</p>
              <button type="button" className="mt-1 text-[#a47a43]" onClick={() => setAdjustment(null)} aria-label="إخفاء التنبيه" data-testid="button-dismiss-adjustment"><X size={15} /></button>
            </div>
          )}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(330px,.75fr)]">
            <div className="space-y-6">
              <LessonCard lesson={currentLesson} onStart={() => setStarted(true)} />
              {started && (
                <div className="animate-fade flex items-center gap-3 rounded-2xl border border-[#bde1df] bg-[#eef9f7] px-4 py-3 text-[11px] text-[#3d7777]" role="status" data-testid="status-lesson-started">
                  <CheckCircle2 size={18} />
                  <p className="flex-1">ممتاز. افتحي صفحة الدرس وابدئي بالسؤال الأول. سأبقى هنا عندما تنتهين.</p>
                  <button type="button" className="text-[#4b9290]" onClick={() => setStarted(false)} aria-label="إخفاء رسالة بدء الدرس" data-testid="button-dismiss-lesson-started"><X size={15} /></button>
                </div>
              )}
              <div className="grid gap-6 sm:grid-cols-2">
                <MiniSchedule lessons={lessons} onAdd={() => setShowAppointment(true)} />
                <ProgressCard />
              </div>
            </div>
            <div className="lg:pt-0">
              <ProgramAgent adjustment={adjustment} onPrompt={() => undefined} />
              <div className="mt-4 rounded-2xl border border-[#d9e8ee] bg-[#eaf4f7] px-4 py-3 text-right" dir="rtl" data-testid="text-next-date">
                <p className="text-[10px] font-semibold text-[#65909d]">موعد خطوتك التالية</p>
                <p className="mt-1 text-[12px] font-bold text-[#366a7b]">{nextDateLabel} · {currentLesson.time}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-[#dce8ed] pt-5 text-[10px] text-[#92a5ae]">
            <p>خطتك محفوظة على هذا الجهاز</p>
            <button type="button" className="flex items-center gap-1.5 text-[#688592] hover:text-[#2c8ca5]" onClick={() => { localStorage.removeItem('medad-onboarding-complete'); window.location.reload(); }} data-testid="button-replay-onboarding"><RotateCcw size={13} />إعادة التعريف</button>
          </div>
        </main>
      </div>
      <MobileNav />
      {showAppointment && <AppointmentModal onClose={() => setShowAppointment(false)} onSave={saveAppointment} />}
    </div>
  );
}

function Home() {
  const [onboarding, setOnboarding] = useState(() => localStorage.getItem('medad-onboarding-complete') !== 'true');
  const finishOnboarding = () => {
    localStorage.setItem('medad-onboarding-complete', 'true');
    setOnboarding(false);
  };
  return (
    <>
      <LiveProgram />
      {onboarding && <Onboarding onFinish={finishOnboarding} />}
    </>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;