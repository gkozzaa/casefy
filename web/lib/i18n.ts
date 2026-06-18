// Lightweight i18n: a typed dictionary for both languages.
// The chosen language is also sent to the backend so the case, interview and
// feedback are generated in that language.

export type Lang = "en" | "pt";

export const LANGS: { id: Lang; label: string; flag: string }[] = [
  { id: "en", label: "EN", flag: "🇺🇸" },
  { id: "pt", label: "PT", flag: "🇧🇷" },
];

export const dict = {
  en: {
    nav: { pricing: "Pricing", signIn: "Sign in", signOut: "Sign out" },
    landing: {
      badge: "AI live-case interviews for Product Managers",
      h1a: "Practice PM interviews with AI. ",
      h1b: "Get hired.",
      sub: "Run a live product case on the apps you know, get grilled by an AI interviewer, and receive a scored breakdown across 7 PM dimensions — in minutes.",
      startFree: "Start free →",
      seePricing: "See pricing",
      freeNote: "1 free case · no credit card required",
      scoredAcross: "Scored across:",
      productsTitle: "Pick a product to be grilled on",
      productsSub:
        "12 real products. Each case is generated live by AI — no two interviews are the same.",
      howTitle: "How it works",
      steps: [
        {
          title: "Pick your case",
          body: "Choose a product and a level. The AI generates a realistic, open-ended business problem on the spot.",
        },
        {
          title: "Get interviewed",
          body: "A live chat interviewer probes your thinking across all 7 PM dimensions with real follow-ups.",
        },
        {
          title: "Get your scorecard",
          body: "Receive a FIFA-style skill radar, a seniority verdict, and dimension-by-dimension feedback.",
        },
      ],
      ctaTitle: "Your next PM interview starts now.",
      ctaSub: "The first case is on us. See where you stand.",
      footer: "Practice PM interviews with AI.",
    },
    levels: {
      title: "Choose your level",
      sub: "The case difficulty, the interviewer's rigor, and how you're scored all calibrate to the level you pick.",
      start: "Start →",
      items: {
        junior: {
          label: "Junior",
          blurb: "Clear scope, low ambiguity. Follow-ups that help you get unstuck.",
        },
        mid: {
          label: "Mid",
          blurb: "Moderate ambiguity. Pushes on prioritization, metrics and trade-offs.",
        },
        senior: {
          label: "Senior",
          blurb: "Multi-dimensional case, stakeholder tension, no obvious path.",
        },
        staff: {
          label: "Staff",
          blurb: "Platform strategy, extreme ambiguity, long-term impact.",
        },
      },
    },
    interview: {
      generating: (p: string) => `Generating your live ${p} case…`,
      yourCase: "Your case",
      assessing: "Currently assessing:",
      placeholder:
        "Type your answer…  (Enter to send, Shift+Enter for a new line)",
      send: "Send",
      complete: "Interview complete",
      completeSub: "You covered all 7 dimensions. Ready for your scorecard?",
      seeResults: "See my results →",
      scoring: "Scoring your performance…",
      backendError: "Could not reach the interview backend.",
      sendError: "Failed to send your answer.",
      evalError: "Evaluation failed. Try again.",
    },
    result: {
      scorecardOf: (p: string) => `${p} case · scorecard`,
      levelTag: (l: string) => `${l} level`,
      title: "Your PM scorecard",
      radar: "Skill radar",
      avg: "avg",
      shareTitle: "Share your result",
      breakdown: "Dimension breakdown",
      again: "Run another case",
      againSub: "Different product, fresh problem. Keep sharpening.",
      pickProduct: "Pick a product →",
      loading: "Loading your scorecard…",
      expired:
        "This result is no longer available. Results expire when the interview session ends — run a new case to get a fresh scorecard.",
      newCase: "Start a new case",
    },
    share: {
      linkedin: "Share on LinkedIn",
      copy: "Copy link",
      copied: "Copied!",
      text: (p: string, s: string) =>
        `I just ran a live ${p} PM case on Casefy and scored ${s}. Practice PM interviews with AI 👇`,
    },
    pricing: {
      successBanner: "🎉 You're Pro! Unlimited cases are unlocked.",
      successCta: "Start a case →",
      cancelledBanner: "Checkout cancelled — no charge was made.",
      limitBanner:
        "You've used your free case. Upgrade to keep practicing with unlimited cases.",
      title: "Simple, honest pricing",
      sub: "Start free. Upgrade once. Practice forever.",
      freeName: "Free",
      freeTagline: "To see where you stand.",
      freeFeatures: [
        "1 full live case",
        "Full 7-dimension scorecard",
        "Skill radar + seniority verdict",
        "LinkedIn sharing",
      ],
      useFree: "Use your free case",
      freeUsed: "Free case used",
      popular: "Most popular",
      proName: "Pro",
      oneTime: "one-time",
      proTagline: "Practice until it's second nature.",
      proFeatures: [
        "Everything in Free",
        "Unlimited live cases",
        "All 12 products",
        "Re-run cases for fresh problems",
        "Track progress over time",
      ],
      youArePro: "✓ You're Pro",
      unlock: "Unlock unlimited →",
      redirecting: "Redirecting…",
      footnote:
        "Questions? This is a demo build — payments run through Stripe Checkout.",
    },
  },

  pt: {
    nav: { pricing: "Preços", signIn: "Entrar", signOut: "Sair" },
    landing: {
      badge: "Entrevistas de PM com live case gerado por IA",
      h1a: "Treine entrevistas de PM com IA. ",
      h1b: "Seja contratado.",
      sub: "Resolva um live case nos apps que você conhece, seja questionado por um entrevistador de IA e receba uma avaliação em 7 dimensões de PM — em minutos.",
      startFree: "Começar grátis →",
      seePricing: "Ver preços",
      freeNote: "1 case grátis · sem cartão de crédito",
      scoredAcross: "Avaliado em:",
      productsTitle: "Escolha um produto para ser entrevistado",
      productsSub:
        "12 produtos reais. Cada case é gerado ao vivo pela IA — nenhuma entrevista é igual à outra.",
      howTitle: "Como funciona",
      steps: [
        {
          title: "Escolha seu case",
          body: "Escolha um produto e um nível. A IA gera na hora um problema de negócio realista e aberto.",
        },
        {
          title: "Seja entrevistado",
          body: "Um entrevistador por chat testa seu raciocínio nas 7 dimensões de PM com follow-ups reais.",
        },
        {
          title: "Receba seu scorecard",
          body: "Um radar de skills estilo FIFA, um veredito de senioridade e feedback por dimensão.",
        },
      ],
      ctaTitle: "Sua próxima entrevista de PM começa agora.",
      ctaSub: "O primeiro case é por nossa conta. Veja onde você está.",
      footer: "Treine entrevistas de PM com IA.",
    },
    levels: {
      title: "Escolha seu nível",
      sub: "A dificuldade do case, o rigor do entrevistador e a régua da avaliação se calibram ao nível que você escolher.",
      start: "Começar →",
      items: {
        junior: {
          label: "Junior",
          blurb: "Escopo claro, ambiguidade baixa. Follow-ups que ajudam a destravar.",
        },
        mid: {
          label: "Pleno",
          blurb: "Ambiguidade moderada. Cobra priorização, métricas e trade-offs.",
        },
        senior: {
          label: "Sênior",
          blurb: "Caso multidimensional, tensão entre stakeholders, sem caminho óbvio.",
        },
        staff: {
          label: "Staff",
          blurb: "Estratégia de plataforma, ambiguidade extrema, impacto de longo prazo.",
        },
      },
    },
    interview: {
      generating: (p: string) => `Gerando seu live case de ${p}…`,
      yourCase: "Seu case",
      assessing: "Avaliando agora:",
      placeholder:
        "Digite sua resposta…  (Enter envia, Shift+Enter quebra linha)",
      send: "Enviar",
      complete: "Entrevista concluída",
      completeSub:
        "Você passou pelas 7 dimensões. Pronto para o seu scorecard?",
      seeResults: "Ver meus resultados →",
      scoring: "Avaliando seu desempenho…",
      backendError: "Não foi possível conectar ao backend da entrevista.",
      sendError: "Falha ao enviar sua resposta.",
      evalError: "A avaliação falhou. Tente novamente.",
    },
    result: {
      scorecardOf: (p: string) => `case de ${p} · scorecard`,
      levelTag: (l: string) => `nível ${l}`,
      title: "Seu scorecard de PM",
      radar: "Radar de skills",
      avg: "média",
      shareTitle: "Compartilhe seu resultado",
      breakdown: "Detalhe por dimensão",
      again: "Fazer outro case",
      againSub: "Outro produto, problema novo. Continue afiando.",
      pickProduct: "Escolher um produto →",
      loading: "Carregando seu scorecard…",
      expired:
        "Este resultado não está mais disponível. Os resultados expiram quando a sessão da entrevista termina — faça um novo case para um scorecard novo.",
      newCase: "Começar um novo case",
    },
    share: {
      linkedin: "Compartilhar no LinkedIn",
      copy: "Copiar link",
      copied: "Copiado!",
      text: (p: string, s: string) =>
        `Acabei de fazer um live case de PM do ${p} no Casefy e fui avaliado como ${s}. Treine entrevistas de PM com IA 👇`,
    },
    pricing: {
      successBanner: "🎉 Você é Pro! Cases ilimitados desbloqueados.",
      successCta: "Começar um case →",
      cancelledBanner: "Checkout cancelado — nenhuma cobrança foi feita.",
      limitBanner:
        "Você já usou seu case grátis. Faça upgrade para continuar praticando com cases ilimitados.",
      title: "Preço simples e honesto",
      sub: "Comece grátis. Faça upgrade uma vez. Pratique para sempre.",
      freeName: "Grátis",
      freeTagline: "Para ver onde você está.",
      freeFeatures: [
        "1 live case completo",
        "Scorecard completo das 7 dimensões",
        "Radar de skills + veredito de senioridade",
        "Compartilhamento no LinkedIn",
      ],
      useFree: "Usar meu case grátis",
      freeUsed: "Case grátis usado",
      popular: "Mais popular",
      proName: "Pro",
      oneTime: "pagamento único",
      proTagline: "Pratique até virar segunda natureza.",
      proFeatures: [
        "Tudo do plano Grátis",
        "Cases ilimitados",
        "Todos os 12 produtos",
        "Refazer cases para problemas novos",
        "Acompanhar evolução ao longo do tempo",
      ],
      youArePro: "✓ Você é Pro",
      unlock: "Desbloquear ilimitado →",
      redirecting: "Redirecionando…",
      footnote:
        "Dúvidas? Esta é uma build de demonstração — pagamentos via Stripe Checkout.",
    },
  },
};

export type Dict = (typeof dict)["en"];
