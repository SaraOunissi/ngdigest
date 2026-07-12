import { RealityCheck } from '../domain/models/reality-check.model';

/**
 * "Les vérités du marché" — Sara's honest, lived reality-checks, shown as
 * expandable cards. Copy from _drafts/REALITY_CHECKS_carriere_2026-07.md.
 *
 * The two data-backed checks (#7 AI & juniors, #8 Angular FR) carry their
 * primary `sources`; every figure was verified before publishing (2026-07):
 *  - #7 uses the robust ~13% Stanford headline + APEC 2024 −19%/−18% figures.
 *    The draft's unverified "−20% software devs" / "−60% APEC dev postings"
 *    were dropped for lack of a confirmable primary.
 *  - #8 was REFRAMED: the draft's "more Angular than React offers in France"
 *    is not supported — React leads usage (~40% vs ~17%, Stack Overflow 2024)
 *    and raw job volume, incl. France. The published version keeps the honest
 *    point (Angular = a solid, less-crowded FR enterprise niche) without the
 *    false claim.
 * Reality-check #4 (French market seen from abroad) is surfaced separately as
 * the dedicated callout on the page, not as an accordion row.
 */
export const REALITY_CHECKS: readonly RealityCheck[] = [
  {
    id: 'freelance-freedom',
    title: {
      fr: '« Freelance = liberté totale » — le plus gros malentendu',
      en: '“Freelance = total freedom” — the biggest misunderstanding',
    },
    body: {
      fr: [
        'On te vend le freelance comme la liberté : tes horaires, ton lieu, tes règles. La réalité, souvent, c’est un quasi-CDI. Mêmes horaires, même équipe, souvent du présentiel ou de l’hybride imposé, intégré·e au projet comme n’importe quel salarié.',
        'La vraie différence n’est pas dans le quotidien. Elle est dans le **statut** et dans le **risque**. Pas d’interco : le jour où la mission s’arrête, tu n’es pas payé·e en attendant la suivante — c’est à toi de la trouver. Pas de congés payés, pas de filet.',
        'Le freelance, ce n’est pas « travailler moins » ou « de chez soi les pieds dans l’eau ». C’est **porter le risque toi-même** en échange d’un peu plus de marge et d’indépendance. Ça peut valoir le coup — mais choisis-le en connaissance de cause, pas pour un fantasme de liberté.',
      ],
      en: [
        'Freelancing gets sold as freedom: your hours, your place, your rules. The reality is often a contract that looks a lot like a permanent job. Same hours, same team, frequently on-site or hybrid, embedded in the project like any employee.',
        'The real difference isn’t in the day-to-day. It’s the **status** and the **risk**. No bench: the day the mission ends, no one pays you while you look for the next one — that’s on you. No paid leave, no safety net.',
        'Freelancing isn’t “working less” or “laptop on a beach”. It’s **carrying the risk yourself** in exchange for a bit more margin and independence. It can be worth it — just choose it with your eyes open, not for a fantasy of freedom.',
      ],
    },
  },
  {
    id: 'full-remote',
    title: {
      fr: 'Le full-remote, c’est l’exception — pas la règle',
      en: 'Full-remote is the exception — not the rule',
    },
    body: {
      fr: [
        'Beaucoup arrivent en pensant que le télétravail total est devenu le standard. Sur le marché tech FR « classique » (grands groupes, grosses PME, ESN), c’est faux. Le présentiel et l’hybride dominent, on attend souvent 2-3 jours sur site, et ça a plutôt tendance à se resserrer.',
        'Le vrai full-remote existe surtout côté **startups / scale-ups produit**, sur des **profils rares** ou pénuriques. Ce n’est pas « partout », c’est « à certains endroits, pour certains profils ».',
        'Donc si le remote est non négociable pour toi : ne postule pas au hasard. Cible les boîtes réellement remote-first, sur les technos où tu es rare. C’est jouable — mais ça se chasse, ça ne tombe pas du ciel.',
      ],
      en: [
        'A lot of people assume full-remote is the new default. In the “classic” French tech market (big corporates, large mid-caps, consultancies), it isn’t. On-site and hybrid dominate, 2-3 days in the office is common, and it’s tightening rather than loosening.',
        'Real full-remote lives mostly in **product startups / scale-ups**, for **rare or in-demand profiles**. It’s not “everywhere”, it’s “in some places, for some people”.',
        'So if remote is non-negotiable for you: don’t apply randomly. Target genuinely remote-first companies, on the stacks where you’re scarce. It’s doable — but you hunt for it, it doesn’t fall in your lap.',
      ],
    },
  },
  {
    id: 'esn-margin',
    title: {
      fr: 'L’ESN ne te dira pas à combien elle te vend',
      en: 'The consultancy won’t tell you what it bills you at',
    },
    body: {
      fr: [
        'Passer par une ESN, c’est une vraie porte d’entrée : tu montes en compétence, tu vois des projets variés, tu as un salaire qui tombe. Mais il y a une règle du jeu qu’on te dit rarement : **tu ne sauras pas à combien on te vend au client.**',
        'La marge est opaque, et ta négociation salariale est encadrée par des grilles. Tu peux générer un TJM confortable pour l’ESN tout en restant sur ton salaire de base. Ce n’est pas « le mal » — c’est le modèle. Mais autant le savoir avant de signer, et négocier ce que tu peux (formation, montée en séniorité, choix des missions).',
        'Connaître les règles ne rend pas cynique : ça rend meilleur·e pour se défendre.',
      ],
      en: [
        'Going through a consultancy (ESN) is a real way in: you level up, you see varied projects, you get a steady salary. But there’s a rule of the game they rarely spell out: **you won’t know what they bill you at to the client.**',
        'The margin is opaque, and your salary negotiation is boxed in by internal grids. You can earn a comfortable day-rate *for the consultancy* while staying on your base salary. It’s not “evil” — it’s the model. But better to know it before you sign, and negotiate what you can (training, seniority track, choice of missions).',
        'Knowing the rules doesn’t make you cynical — it makes you better at standing up for yourself.',
      ],
    },
  },
  {
    id: 'ai-juniors',
    title: {
      fr: 'L’IA ne « remplace » pas les devs — mais elle referme la porte d’entrée junior',
      en: 'AI isn’t “replacing” devs — but it’s closing the junior entry door',
    },
    body: {
      fr: [
        'On entend partout « l’IA va remplacer les devs ». Les données récentes disent quelque chose de plus précis — et de plus inquiétant si tu débutes : ce n’est pas le métier qui s’effondre, c’est **la porte d’entrée junior** qui se referme.',
        'Aux États-Unis, une étude de Stanford (« Canaries in the Coal Mine? », 2025, sur les données de paie ADP) montre que l’emploi des 22-25 ans dans les métiers les plus exposés à l’IA a reculé d’environ **13 %** depuis fin 2022 — les jeunes développeurs étant parmi les plus touchés — alors que les seniors des mêmes métiers sont à peine affectés.',
        'En France, même tendance côté APEC : les recrutements de cadres débutants ont chuté de **19 %** en 2024, et l’informatique de **18 %**. L’IA absorbe les tâches simples — justement celles sur lesquelles on faisait ses armes. Le seuil pour entrer monte.',
        'Ce que j’en tire : si tu débutes, ne mise pas sur « je code la petite tâche qu’on me confie ». Mise sur ce que l’IA ne fait pas à ta place — jugement, archi, communication, compréhension métier. C’est ça qui te rend embauchable aujourd’hui.',
      ],
      en: [
        'Everywhere you hear “AI will replace developers.” Recent data tells a more precise — and, if you’re starting out, more worrying — story: it’s not the job collapsing, it’s **the junior entry door** closing.',
        'In the US, a Stanford study (“Canaries in the Coal Mine?”, 2025, based on ADP payroll data) found that employment of 22-25-year-olds in the most AI-exposed jobs fell about **13%** since late 2022 — young developers among the hardest hit — while older workers in the very same jobs were barely touched.',
        'In France, the APEC shows the same trend: recruitment of junior executives dropped **19%** in 2024, and IT roles **18%**. AI absorbs the simple tasks — exactly the ones you used to cut your teeth on. The bar to get in is rising.',
        'My takeaway: if you’re starting out, don’t bet on “I code the small task I’m handed.” Bet on what AI won’t do for you — judgment, architecture, communication, domain understanding. That’s what makes you hireable today.',
      ],
    },
    sources: [
      {
        label: 'Stanford Digital Economy Lab — « Canaries in the Coal Mine? » (2025)',
        url: 'https://digitaleconomy.stanford.edu/wp-content/uploads/2025/08/Canaries_BrynjolfssonChandarChen.pdf',
      },
      {
        label: 'APEC — Prévisions 2025',
        url: 'https://corporate.apec.fr/files/live/sites/corporate/files/Nos%20etudes/PDF/Etude%20-%20Previsions%20Apec%202025.pdf',
      },
    ],
  },
  {
    id: 'angular-france',
    title: {
      fr: 'Angular « mort » ? Pas en France — mais soyons précis',
      en: 'Angular “dead”? Not in France — but let’s be precise',
    },
    body: {
      fr: [
        'Sur internet, on te répète que « tout le monde fait React » et qu’Angular c’est fini. Côté usage mondial, c’est vrai que React domine : ~**40 %** des développeurs pros contre ~**17 %** pour Angular (Stack Overflow 2024). Et en volume brut d’offres, React mène aussi, y compris en France — autant le dire honnêtement.',
        'Mais réduire Angular à « mort », c’est faux. En France, il garde une **niche entreprise solide et durable** : banque, assurance, industrie, grands groupes, ESN — souvent couplé à Java ou .NET. Ces boîtes tournent sur Angular depuis des années et ne vont pas tout réécrire demain.',
        'Et il y a un effet contre-intuitif : comme Angular est moins « hype », il y a souvent **moins de candidats en face** sur ces offres. À mon sens, viser Angular en France, ce n’est pas suivre la tendance — c’est jouer un marché de niche stable où la concurrence de profils est plus raisonnable qu’on ne le croit.',
        'C’est pile pour ça que je construis autour d’Angular : pas parce que c’est le plus hype, mais parce que le marché FR le demande encore, et durablement.',
      ],
      en: [
        'Online, you keep hearing “everyone does React” and “Angular is dead.” On global usage, React does dominate: ~**40%** of professional developers versus ~**17%** for Angular (Stack Overflow 2024). And on raw job volume React leads too, including in France — let’s be honest about it.',
        'But calling Angular “dead” is wrong. In France it keeps a **solid, durable enterprise niche**: banking, insurance, industry, large groups, consultancies — often paired with Java or .NET. These companies have run on Angular for years and won’t rewrite everything tomorrow.',
        'And there’s a counter-intuitive effect: because Angular is less “hype,” there are often **fewer candidates competing** for those roles. To my mind, betting on Angular in France isn’t following the trend — it’s playing a stable niche market where profile competition is more reasonable than people think.',
        'That’s exactly why I build around Angular: not because it’s the most hyped, but because the French market still wants it, and durably.',
      ],
    },
    sources: [
      {
        label: 'Stack Overflow Developer Survey 2024',
        url: 'https://survey.stackoverflow.co/2024/technology',
      },
    ],
  },
  {
    id: 'same-mould',
    title: {
      fr: 'Grand groupe, grosse PME, ESN : souvent le même moule',
      en: 'Big corporate, large mid-cap, consultancy: often the same mould',
    },
    body: {
      fr: [
        'Soyons honnêtes : entre un grand groupe, une grosse PME et une ESN, le quotidien se ressemble beaucoup. Process lourds, legacy, réunions, peu de marge de créativité. Ce n’est pas un drame — ça paie les factures et ça forme — mais il ne faut pas s’attendre à l’aventure.',
        'Les vraies exceptions (culture saine, remote assumé, produit qu’on construit vraiment, autonomie) existent, mais elles sont **rares**, et elles se méritent : il faut les chercher activement, pas espérer tomber dessus.',
        'C’est exactement ce que j’essaie de débusquer et de partager — les pépites, les boîtes qui font les choses autrement. On cherche, on cherche. Elles sont là, juste pas à tous les coins de rue.',
      ],
      en: [
        'Let’s be honest: between a big corporate, a large mid-cap and a consultancy, the day-to-day feels pretty similar. Heavy processes, legacy, meetings, little room for creativity. It’s not a tragedy — it pays the bills and it trains you — but don’t expect adventure.',
        'The real exceptions (healthy culture, genuine remote, a product you actually build, autonomy) do exist, but they’re **rare**, and you earn them: you have to hunt actively, not hope to stumble in.',
        'That’s exactly what I try to dig out and share — the hidden gems, the companies doing it differently. We keep looking. They’re out there, just not on every street corner.',
      ],
    },
  },
  {
    id: 'build-your-exception',
    title: {
      fr: 'La vraie sortie : créer sa propre exception',
      en: 'The real way out: build your own exception',
    },
    body: {
      fr: [
        'À force de chercher la boîte idéale, j’ai fini par me dire une chose : et si, au lieu d’attendre l’exception, on la créait ?',
        'C’est mon fil rouge. Continuer à chercher les rares bonnes opportunités, oui — mais en parallèle, **construire mes propres produits**. Petit à petit, en marge du salariat, pour viser un jour l’autonomie. Ce n’est pas un plan « quit your job » du jour au lendemain, c’est une trajectoire, avec de la patience et beaucoup de travail invisible.',
        'Je ne prétends pas avoir réussi — je suis en plein dedans, et je partage le chemin en vrai, ratés compris. Mais je suis convaincue d’une chose : la meilleure façon de ne pas subir le marché, c’est de se construire un truc à soi, à côté.',
      ],
      en: [
        'After chasing the perfect company for years, I landed on one idea: what if, instead of waiting for the exception, we built it?',
        'That’s my through-line. Keep looking for the rare good opportunities, yes — but in parallel, **build my own products**. Bit by bit, on the side of employment, aiming one day for autonomy. It’s not a “quit your job overnight” plan, it’s a trajectory, with patience and a lot of invisible work.',
        'I’m not claiming I’ve made it — I’m right in the middle of it, sharing the road honestly, failures included. But I’m convinced of one thing: the best way to stop being at the mercy of the market is to build something of your own, on the side.',
      ],
    },
  },
];

/**
 * Reality-check #4, pulled out as the dedicated "coming from abroad" callout —
 * the strongest EN differentiator per the editorial cadrage.
 */
export const FOREIGN_MARKET_CALLOUT: RealityCheck = {
  id: 'foreign-market',
  title: {
    fr: 'Comprendre le marché FR quand on vient de l’étranger',
    en: 'Understanding the French market when you come from abroad',
  },
  body: {
    fr: [
      'Je reçois beaucoup de messages de gens à l’étranger persuadés qu’ils vont bosser à distance sur des postes français depuis leur pays. Honnêtement : dans l’IT « classique » FR, c’est très difficile. On attend du présentiel, de l’expérience solide, un CV lisible pour le marché local, et souvent la langue.',
      'Ce n’est pas de la mauvaise volonté — c’est juste une réalité de marché que beaucoup ignorent avant de se lancer. Là où ça s’ouvre : les **startups/scale-ups** et les entreprises vraiment remote-first, mais c’est une minorité, et la barre y est haute.',
      'Je préfère te le dire franchement plutôt que t’entretenir dans une illusion. Ça ne veut pas dire « impossible » — ça veut dire « vise les bons endroits, et prépare-toi sérieusement ».',
    ],
    en: [
      'I get a lot of messages from people abroad convinced they’ll work remotely on French roles from their home country. Honestly: in “classic” French IT, that’s very hard. Employers expect on-site presence, solid experience, a CV that reads for the local market, and often the language.',
      'It’s not bad will — it’s a market reality many don’t see before diving in. Where it opens up: **startups/scale-ups** and genuinely remote-first companies — but that’s a minority, and the bar there is high.',
      'I’d rather tell you straight than keep you in an illusion. It doesn’t mean “impossible” — it means “aim at the right places, and prepare seriously”.',
    ],
  },
};
