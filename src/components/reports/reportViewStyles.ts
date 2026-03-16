import { CyntraDesignTokens } from "@/design/cyntraDesignTokens";
import { reportDesignSystem } from "@/design/reportDesignSystem";

const gold = CyntraDesignTokens.colors.gold;
const goldSoft = CyntraDesignTokens.colors.goldSoft;
const divider = CyntraDesignTokens.colors.divider;
const white = CyntraDesignTokens.colors.white;
const titleSize = CyntraDesignTokens.typography.h2.size;
const bodySize = CyntraDesignTokens.typography.body.size;
const metaSize = CyntraDesignTokens.typography.meta.size;
const sectionGap = CyntraDesignTokens.spacing.sectionGap;
const blockGap = CyntraDesignTokens.spacing.blockGap;
const maxWidth = CyntraDesignTokens.layout.maxWidth;

export const reportViewStyles = {
  layout: {
    root: `relative overflow-hidden rounded-[30px] border border-white/7 bg-[radial-gradient(circle_at_top_left,_rgba(198,164,97,0.08),_transparent_26%),linear-gradient(180deg,_rgba(8,14,24,0.99),_rgba(10,16,26,0.972))] p-6 shadow-[0_18px_54px_rgba(0,0,0,0.2)] md:p-10 space-y-[${sectionGap}px]`,
    header: "relative space-y-5 overflow-hidden rounded-[26px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.014))] px-6 py-8",
    sections: `space-y-[${blockGap * 2}px]`,
  },
  header: {
    label: `text-[${metaSize + 1}px] font-semibold uppercase tracking-[0.32em] text-[${gold}]`,
    title: "max-w-4xl font-['Aptos_Display','Aptos','Segoe_UI',sans-serif] text-[35px] font-semibold leading-[1.08] tracking-[-0.035em] text-white md:text-[42px]",
    subtitle: `max-w-[${maxWidth}px] font-['Aptos','Segoe_UI',sans-serif] text-[${bodySize}px] leading-8 text-slate-300/95`,
    meta: "flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-slate-400/95",
  },
  section: {
    root: "space-y-5 rounded-[24px] border border-white/7 bg-[rgba(255,255,255,0.016)] px-5 py-6 md:px-7",
    number: `text-[${metaSize}px] font-semibold uppercase tracking-[0.24em] text-[${gold}]`,
    title: `mt-2 font-['Aptos_Display','Aptos','Segoe_UI',sans-serif] text-[${titleSize + 1}px] font-semibold tracking-[-0.024em] text-white`,
    rule: `mt-3 h-px w-24 bg-[${divider}]`,
    paragraph: `max-w-[${maxWidth}px] whitespace-pre-wrap font-['Aptos','Segoe_UI',sans-serif] text-[${bodySize}px] leading-8 text-slate-200/95`,
    emphasizedParagraph: `max-w-[${maxWidth}px] rounded-xl border border-[${gold}]/16 bg-[rgba(212,175,55,0.04)] px-4 py-3 whitespace-pre-wrap font-['Aptos','Segoe_UI',sans-serif] text-[${bodySize}px] leading-8 text-slate-100`,
    muted: "text-[15px] text-slate-500",
    bulletList: "space-y-2 pl-5",
    accentBulletList: "space-y-3",
    bullet: "font-['Aptos','Segoe_UI',sans-serif] text-[15px] leading-8 text-slate-300",
    accentBullet: `max-w-[${maxWidth}px] rounded-xl border border-white/8 bg-white/[0.018] px-4 py-2 font-['Aptos','Segoe_UI',sans-serif] text-[15px] leading-8 text-slate-200`,
    action: `rounded-full border border-[${gold}]/35 bg-[${gold}]/10 px-3 py-1.5 text-[13px] font-medium text-[${goldSoft}] transition hover:border-[${gold}] hover:text-white`,
  },
  panel: {
    root: "space-y-5 rounded-[24px] border border-white/7 bg-[rgba(255,255,255,0.02)] px-5 py-6 md:px-7",
    title: "text-[20px] font-semibold text-white",
    body: `whitespace-pre-wrap text-[14px] leading-7 text-[${white}]`,
    mutedBody: "text-[14px] leading-6 text-gray-300",
    list: "space-y-2 text-[14px] leading-6 text-gray-300",
    criticalList: "space-y-2 text-[14px] leading-6 text-red-200",
    warningList: "space-y-2 text-[14px] leading-6 text-amber-100",
  },
  decisionCard: {
    root: `space-y-5 rounded-[26px] border border-[${gold}]/18 bg-[linear-gradient(180deg,rgba(255,248,231,0.045),rgba(255,248,231,0.025))] p-6 shadow-[0_14px_30px_rgba(0,0,0,0.18)]`,
    label: `text-[12px] font-semibold uppercase tracking-[0.3em] text-slate-400`,
    metaGrid: "grid gap-4 md:grid-cols-3",
    metaLabel: `text-[11px] uppercase tracking-[0.28em] text-slate-500`,
    metaValue: `text-[18px] font-semibold text-white`,
    section: "space-y-2",
    sectionTitle: `text-[13px] uppercase tracking-[0.2em] text-slate-400`,
    sectionBody: `text-[15px] leading-7 text-slate-100`,
    bulletList: "space-y-2 pl-4 text-[15px] leading-6 text-slate-200 list-disc",
    bullet: "pl-1",
    stopRules: "space-y-2",
  },
  storyBridge: {
    root: "space-y-6 rounded-[26px] border border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.024),rgba(255,255,255,0.014))] px-6 py-6 md:px-7",
    header: "flex flex-col gap-3 md:flex-row md:items-end md:justify-between",
    label: `text-[${metaSize}px] font-semibold uppercase tracking-[0.24em] text-[${gold}]`,
    title: "font-['Aptos_Display','Aptos','Segoe_UI',sans-serif] text-[26px] font-semibold tracking-[-0.02em] text-white",
    subtitle: "max-w-[38rem] font-['Aptos','Segoe_UI',sans-serif] text-[15px] leading-7 text-slate-300",
    grid: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
    block: "rounded-[18px] border border-white/7 bg-[rgba(255,255,255,0.014)] px-4 py-4",
    eyebrow: `text-[${metaSize}px] font-semibold uppercase tracking-[0.22em] text-[${gold}]`,
    body: `mt-2 whitespace-pre-wrap font-['Aptos','Segoe_UI',sans-serif] text-[15px] leading-7 text-slate-200`,
    helpPanel: `space-y-4 rounded-[22px] border border-[${gold}]/18 bg-[linear-gradient(180deg,rgba(198,164,97,0.065),rgba(198,164,97,0.03))] px-5 py-5`,
    helpTitle: "font-['Aptos_Display','Aptos','Segoe_UI',sans-serif] text-[22px] font-semibold tracking-[-0.02em] text-white",
    helpEyebrow: "text-[12px] font-semibold uppercase tracking-[0.2em] text-slate-400",
    helpList: "space-y-3",
    helpListItem: "rounded-xl border border-white/8 bg-white/[0.018] px-4 py-3 font-['Aptos','Segoe_UI',sans-serif] text-[15px] leading-7 text-slate-200",
  },
} as const;

export const reportViewStyleMeta = {
  designSystem: reportDesignSystem.identity.name,
  allowedParagraphHighlights: reportDesignSystem.emphasis.allowedParagraphHighlights,
  allowedAccentLists: reportDesignSystem.emphasis.allowedAccentLists,
} as const;
